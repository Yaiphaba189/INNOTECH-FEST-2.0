"""Train and honestly evaluate a MobileNetV3-Small disease classifier for one crop.

    uv run --extra ml python -m intelligence_layer.module_a_disease.training.train --crop rice

Inputs : data/training/<crop>/<class>/*.jpg (224x224 RGB) + data/provenance/image_manifest.csv
Outputs: data/models/disease_mobilenetv3_<crop>.pt   checkpoint {classes, state_dict, temperature, metrics}
         data/models/<crop>_metrics.json             test-set report shown to judges
         data/models/<crop>_split.json               which image is in train/val/test (reproducible)

Leakage control (why the reported accuracy can be trusted):
- Images are split by GROUP, never individually. Pineapple groups are the source specimen IDs.
  Rice/orange sources carry no specimen IDs, so near-duplicate photos (perceptual-hash Hamming
  distance <= HASH_GROUP_DISTANCE) are merged into one group and kept on one side of the split.
- The test split is touched once, after the best epoch is chosen on the validation split.
- Temperature scaling is fitted on validation only.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from datetime import date
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
TRAINING_DIR = ROOT / "data" / "training"
MODELS_DIR = ROOT / "data" / "models"
MANIFEST = ROOT / "data" / "provenance" / "image_manifest.csv"

SPLIT_FRACTIONS = (0.70, 0.15, 0.15)
HASH_GROUP_DISTANCE = 10
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# ─────────────────────────── data discovery & grouping ───────────────────────────

def load_records(crop: str) -> List[Dict[str, str]]:
    """Every prepared image of `crop` with its class and (if known) source specimen ID."""
    specimen: Dict[str, str] = {}
    if MANIFEST.exists():
        with MANIFEST.open(newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                if row["crop"] == crop:
                    specimen[row["relative_path"]] = row.get("specimen_id", "")
    records = []
    for class_dir in sorted((TRAINING_DIR / crop).iterdir()):
        if not class_dir.is_dir() or class_dir.name.startswith("."):
            continue
        for img in sorted(class_dir.glob("*.jpg")):
            rel = str(img.relative_to(ROOT))
            records.append({"path": rel, "class": class_dir.name, "specimen": specimen.get(rel, "")})
    return records


def dhash(path: Path, size: int = 8) -> int:
    with Image.open(path) as img:
        px = np.asarray(img.convert("L").resize((size + 1, size), Image.BILINEAR), dtype=np.int16)
    bits = (px[:, 1:] > px[:, :-1]).flatten()
    return int("".join("1" if b else "0" for b in bits), 2)


def assign_groups(records: List[Dict[str, str]]) -> str:
    """Fills record['group']; returns the method used."""
    if records and all(r["specimen"] for r in records):
        for r in records:
            r["group"] = f'{r["class"]}/{r["specimen"]}'
        return "source specimen id"

    hashes = [dhash(ROOT / r["path"]) for r in records]
    parent = list(range(len(records)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    by_class: Dict[str, List[int]] = {}
    for i, r in enumerate(records):
        by_class.setdefault(r["class"], []).append(i)
    for idxs in by_class.values():
        for a in range(len(idxs)):
            for b in range(a + 1, len(idxs)):
                if bin(hashes[idxs[a]] ^ hashes[idxs[b]]).count("1") <= HASH_GROUP_DISTANCE:
                    parent[find(idxs[a])] = find(idxs[b])
    for i, r in enumerate(records):
        r["group"] = f'{r["class"]}/dh{find(i)}'
    return f"perceptual-hash near-duplicate clusters (Hamming <= {HASH_GROUP_DISTANCE})"


def leakage_audit(split: Dict[str, List[Dict[str, str]]]) -> Dict[str, float]:
    """Share of test images whose nearest TRAIN image (64-bit dhash) is within 4/8/12 bits.

    A high share means near-duplicate photos span the split and accuracy is optimistic."""
    def bits(rows):
        return np.array([[int(b) for b in f"{dhash(ROOT / r['path']):064b}"] for r in rows], dtype=np.uint8)

    train_bits, test_bits = bits(split["train"]), bits(split["test"])
    nearest = np.array([(train_bits != row).sum(1).min() for row in test_bits])
    return {f"test_with_train_neighbour_within_{t}_bits": round(float((nearest <= t).mean()), 4) for t in (4, 8, 12)}


def split_by_group(records: List[Dict[str, str]], seed: int) -> Dict[str, List[Dict[str, str]]]:
    """Per-class group-level split so every class appears in train/val/test."""
    rng = random.Random(seed)
    out: Dict[str, List[Dict[str, str]]] = {"train": [], "val": [], "test": []}
    classes = sorted({r["class"] for r in records})
    for cls in classes:
        groups: Dict[str, List[Dict[str, str]]] = {}
        for r in records:
            if r["class"] == cls:
                groups.setdefault(r["group"], []).append(r)
        names = sorted(groups)
        rng.shuffle(names)
        total = sum(len(groups[g]) for g in names)
        targets = [total * f for f in SPLIT_FRACTIONS]
        counts = [0, 0, 0]
        for g in names:
            # fill the split currently furthest below its target; groups stay whole
            deficits = [targets[k] - counts[k] for k in range(3)]
            k = max(range(3), key=lambda i: deficits[i])
            counts[k] += len(groups[g])
            out[("train", "val", "test")[k]].extend(groups[g])
    return out


# ─────────────────────────────── training / evaluation ───────────────────────────

def build_model(num_classes: int, pretrained: bool):
    import torch
    import torchvision.models as models

    weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1 if pretrained else None
    model = models.mobilenet_v3_small(weights=weights)
    model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, num_classes)
    return model


class ImageDataset:
    """Module-level (picklable) map-style dataset so DataLoader workers can spawn."""

    def __init__(self, records, class_to_idx, transform):
        self.records, self.class_to_idx, self.transform = records, class_to_idx, transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, i):
        r = self.records[i]
        with Image.open(ROOT / r["path"]) as img:
            return self.transform(img.convert("RGB")), self.class_to_idx[r["class"]]


def make_loader(records, class_to_idx, train: bool, batch_size: int, workers: int):
    import torch
    import torchvision.transforms as T

    norm = T.Normalize(IMAGENET_MEAN, IMAGENET_STD)
    if train:
        tf = T.Compose([
            T.RandomResizedCrop(224, scale=(0.7, 1.0)),
            T.RandomHorizontalFlip(),
            T.RandomVerticalFlip(),
            T.ColorJitter(0.25, 0.25, 0.2, 0.03),
            T.ToTensor(), norm,
        ])
    else:
        tf = T.Compose([T.ToTensor(), norm])

    return torch.utils.data.DataLoader(ImageDataset(records, class_to_idx, tf), batch_size=batch_size, shuffle=train, num_workers=workers,
                                       persistent_workers=workers > 0)


def collect_logits(model, loader, device) -> Tuple["np.ndarray", "np.ndarray"]:
    import torch

    model.eval()
    logits, labels = [], []
    with torch.no_grad():
        for x, y in loader:
            logits.append(model(x.to(device)).cpu().numpy())
            labels.append(y.numpy())
    return np.concatenate(logits), np.concatenate(labels)


def fit_temperature(val_logits: np.ndarray, val_labels: np.ndarray) -> float:
    """Single-parameter calibration: T minimising validation NLL."""
    import torch

    logits = torch.tensor(val_logits)
    labels = torch.tensor(val_labels)
    log_t = torch.zeros(1, requires_grad=True)
    opt = torch.optim.LBFGS([log_t], lr=0.1, max_iter=100)

    def closure():
        opt.zero_grad()
        loss = torch.nn.functional.cross_entropy(logits / log_t.exp(), labels)
        loss.backward()
        return loss

    opt.step(closure)
    return float(np.clip(log_t.exp().item(), 0.5, 5.0))


def report(logits: np.ndarray, labels: np.ndarray, classes: Sequence[str], temperature: float) -> Dict:
    z = logits / temperature
    z = z - z.max(axis=1, keepdims=True)
    probs = np.exp(z) / np.exp(z).sum(axis=1, keepdims=True)
    pred = probs.argmax(axis=1)
    n = len(classes)
    cm = np.zeros((n, n), dtype=int)
    for t, p in zip(labels, pred):
        cm[t, p] += 1
    per_class = {}
    for i, name in enumerate(classes):
        tp = cm[i, i]
        precision = tp / cm[:, i].sum() if cm[:, i].sum() else 0.0
        recall = tp / cm[i].sum() if cm[i].sum() else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class[name] = {"precision": round(float(precision), 4), "recall": round(float(recall), 4),
                           "f1": round(float(f1), 4), "support": int(cm[i].sum())}
    # expected calibration error, 10 bins
    conf = probs.max(axis=1)
    correct = (pred == labels).astype(float)
    ece = 0.0
    for lo in np.linspace(0, 0.9, 10):
        m = (conf > lo) & (conf <= lo + 0.1)
        if m.any():
            ece += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return {
        "accuracy": round(float((pred == labels).mean()), 4),
        "macro_f1": round(float(np.mean([v["f1"] for v in per_class.values()])), 4),
        "mean_confidence": round(float(conf.mean()), 4),
        "expected_calibration_error": round(float(ece), 4),
        "per_class": per_class,
        "confusion_matrix": {"labels": list(classes), "rows_true_cols_pred": cm.tolist()},
    }


def main() -> None:
    import torch

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--crop", required=True, choices=["pineapple", "rice", "orange"])
    ap.add_argument("--epochs", type=int, default=10)
    ap.add_argument("--batch-size", type=int, default=64)
    ap.add_argument("--lr", type=float, default=5e-4)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--no-pretrained", action="store_true", help="skip ImageNet initialisation (offline)")
    ap.add_argument("--max-per-class", type=int, default=0, help="cap images per class (smoke tests)")
    args = ap.parse_args()

    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")

    records = load_records(args.crop)
    if args.max_per_class:
        kept, seen = [], {}
        for r in records:
            if seen.get(r["class"], 0) < args.max_per_class:
                kept.append(r)
                seen[r["class"]] = seen.get(r["class"], 0) + 1
        records = kept
    classes = sorted({r["class"] for r in records})
    if len(classes) < 2:
        raise SystemExit(f"Need at least 2 populated classes under data/training/{args.crop}; found {classes}")
    class_to_idx = {c: i for i, c in enumerate(classes)}

    method = assign_groups(records)
    split = split_by_group(records, args.seed)
    print(f"crop={args.crop} device={device} classes={classes}")
    print(f"grouping: {method}")
    print({k: len(v) for k, v in split.items()}, "images (train/val/test)")
    for name, rows in split.items():
        missing = set(classes) - {r["class"] for r in rows}
        if missing:
            raise SystemExit(f"{name} split has no images for {sorted(missing)}; collect more data for these classes")
    train_groups = {r["group"] for r in split["train"]}
    assert not train_groups & {r["group"] for r in split["test"]}, "group leakage between train and test"
    assert not train_groups & {r["group"] for r in split["val"]}, "group leakage between train and val"

    train_dl = make_loader(split["train"], class_to_idx, True, args.batch_size, args.workers)
    val_dl = make_loader(split["val"], class_to_idx, False, args.batch_size, args.workers)
    test_dl = make_loader(split["test"], class_to_idx, False, args.batch_size, args.workers)

    model = build_model(len(classes), pretrained=not args.no_pretrained).to(device)
    counts = np.bincount([class_to_idx[r["class"]] for r in split["train"]], minlength=len(classes))
    weights = torch.tensor(counts.sum() / (len(classes) * np.maximum(counts, 1)), dtype=torch.float32, device=device)
    loss_fn = torch.nn.CrossEntropyLoss(weight=weights, label_smoothing=0.05)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=args.lr, total_steps=args.epochs * len(train_dl))

    best_acc, best_state = -1.0, None
    for epoch in range(1, args.epochs + 1):
        model.train()
        running = 0.0
        for x, y in train_dl:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            loss = loss_fn(model(x), y)
            loss.backward()
            opt.step()
            sched.step()
            running += loss.item() * len(y)
        vl, vy = collect_logits(model, val_dl, device)
        val_acc = float((vl.argmax(1) == vy).mean())
        print(f"epoch {epoch:2d}/{args.epochs} train_loss={running / len(split['train']):.4f} val_acc={val_acc:.4f}")
        if val_acc > best_acc:
            best_acc = val_acc
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}

    model.load_state_dict(best_state)
    val_logits, val_labels = collect_logits(model, val_dl, device)
    temperature = fit_temperature(val_logits, val_labels)
    test_logits, test_labels = collect_logits(model, test_dl, device)  # test touched exactly once
    metrics = report(test_logits, test_labels, classes, temperature)
    audit = leakage_audit(split)
    print("leakage audit (test -> nearest train image):", audit)
    metrics.update({
        "leakage_audit": audit,
        "crop": args.crop,
        "trained_on": str(date.today()),
        "classes": classes,
        "temperature": round(temperature, 4),
        "best_val_accuracy": round(best_acc, 4),
        "images": {k: len(v) for k, v in split.items()},
        "split_method": f"group-level 70/15/15, {method}",
        "backbone": "MobileNetV3-Small, ImageNet-pretrained" if not args.no_pretrained else "MobileNetV3-Small, random init",
        "caveats": [
            "Public leaf-image datasets, not Manipur field photos: expect lower accuracy on phone photos in the field.",
            "Classes without licensed public data are not covered by this model.",
        ],
    })

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save({"classes": classes, "state_dict": best_state, "temperature": temperature, "metrics": metrics},
               MODELS_DIR / f"disease_mobilenetv3_{args.crop}.pt")
    (MODELS_DIR / f"{args.crop}_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    (MODELS_DIR / f"{args.crop}_split.json").write_text(
        json.dumps({k: [r["path"] for r in v] for k, v in split.items()}, indent=1) + "\n", encoding="utf-8")

    print(f"\nTEST accuracy={metrics['accuracy']:.4f} macro_F1={metrics['macro_f1']:.4f} "
          f"ECE={metrics['expected_calibration_error']:.4f} (T={temperature:.3f})")
    for name, v in metrics["per_class"].items():
        print(f"  {name:24s} P={v['precision']:.3f} R={v['recall']:.3f} F1={v['f1']:.3f} n={v['support']}")


if __name__ == "__main__":
    main()
