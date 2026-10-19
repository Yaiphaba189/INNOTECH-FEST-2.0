#!/usr/bin/env python3
"""Download and prepare the openly licensed datasets listed in Docs/DATA.md.

Images are exported as RGB 224x224 JPEGs in data/training/<crop>/<class>/.
Source originals are streamed from temporary files and are not retained.
Requires curl, unzip is not required, and Pillow (python -m pip install Pillow).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tempfile
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path, PurePosixPath

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
TRAINING = DATA / "training"
PROVENANCE = DATA / "provenance"
STATUS_FILE = PROVENANCE / "acquisition_status.json"
MANIFEST = PROVENANCE / "image_manifest.csv"
SOURCES = PROVENANCE / "sources.json"
FAILURES = PROVENANCE / "download_failures.csv"
TEMP_ROOT = Path(tempfile.gettempdir()) / "harvestlink-public-data"
IMAGE_SIZE = (224, 224)


def update_acquisition_status(status: str, active_crop: str = "", active_archive: str = "", reason: str = "") -> None:
    counts: dict[str, dict[str, int]] = {}
    if TRAINING.exists():
        for crop_dir in sorted(TRAINING.iterdir()):
            if crop_dir.is_dir() and not crop_dir.name.startswith("."):
                for class_dir in sorted(crop_dir.iterdir()):
                    if class_dir.is_dir() and not class_dir.name.startswith("."):
                        img_count = len([f for f in class_dir.glob("*.jpg") if f.is_file()])
                        if img_count > 0:
                            counts.setdefault(crop_dir.name, {})[class_dir.name] = img_count
    data = {
        "updated": "2026-10-18",
        "prepared_images_by_crop": counts,
        "total_prepared_images": sum(sum(c.values()) for c in counts.values()),
        "status": status,
        "active_crop": active_crop,
        "active_archive": active_archive,
        "reason": reason,
    }
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATUS_FILE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
MANIFEST_FIELDS = [
    "relative_path", "crop", "class_name", "source_dataset", "source_doi",
    "source_image", "source_file_id", "source_sha256", "license",
    "specimen_id", "split", "is_simulated", "prepared_sha256",
]

SOURCES_DATA = {
    "pineapple": {
        "name": "Pineapple Leaf Disease Dataset (PLDD), v1",
        "doi": "10.5281/zenodo.21893516",
        "page": "https://zenodo.org/records/21893516",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "authors": ["Raj, Saranya", "Prakash, Nupur", "Malik, Nidhi"],
        "scope": ["healthy", "mealybug_wilt"],
        "exclusions": ["heart_rot", "black_rot"],
    },
    "rice": {
        "name": "A Rice Leaf Disease Image Dataset for Multi-Class Disease Classification, v1",
        "doi": "10.17632/n8jpkpfz5p.1",
        "page": "https://data.mendeley.com/datasets/n8jpkpfz5p/1",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "authors": ["Md Mahamudul Hasan", "Md Shakib Hossain", "Jahanur Biswas"],
        "scope": ["healthy", "blast", "bacterial_leaf_blight", "sheath_blight", "tungro"],
        "exclusions": [],
    },
    "orange": {
        "name": "Multi-format open-source sweet orange leaf dataset, v1 (original images only)",
        "doi": "10.17632/f7cr74mwpj.1",
        "page": "https://data.mendeley.com/datasets/f7cr74mwpj/1",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "authors": ["Yousuf Rayhan Emon", "Md Taimur Ahad"],
        "scope": ["healthy", "citrus_canker", "citrus_greening_hlb", "powdery_mildew"],
        "exclusions": ["root_rot"],
    },
}

def curl_download(url: str, destination: Path, *, retries: int = 5) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(destination.suffix + ".part")
    command = [
        "curl", "--fail", "--location", "--silent", "--show-error",
        "--retry", str(retries), "--retry-all-errors", "--retry-delay", "2",
        "--connect-timeout", "30", "--max-time", "3600", "--output", str(partial), url,
    ]
    subprocess.run(command, check=True)
    partial.replace(destination)


def curl_download_segmented(
    url: str, destination: Path, size: int, *, workers: int = 6,
    chunk_size: int = 128 * 1024 * 1024, retries: int = 100,
) -> None:
    """Download a large range-capable archive concurrently, keeping chunks resumable."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    chunk_dir = destination.parent / f"{destination.name}.chunks"
    chunk_dir.mkdir(parents=True, exist_ok=True)
    ranges = [
        (start, min(start + chunk_size, size) - 1)
        for start in range(0, size, chunk_size)
    ]

    def fetch(bounds: tuple[int, int]) -> Path:
        start, end = bounds
        part = chunk_dir / f"{start:012d}-{end:012d}.part"
        expected = end - start + 1
        if part.exists() and part.stat().st_size == expected:
            return part
        if part.exists() and part.stat().st_size > expected:
            part.unlink()
        attempts = 0
        while not part.exists() or part.stat().st_size < expected:
            attempts += 1
            if attempts > retries:
                actual = part.stat().st_size if part.exists() else 0
                raise IOError(
                    f"Range {start}-{end} stopped at {actual}/{expected} bytes "
                    f"after {retries} resumable attempts"
                )
            received = part.stat().st_size if part.exists() else 0
            range_start = start + received
            remainder = part.with_suffix(part.suffix + ".resume")
            remainder.unlink(missing_ok=True)
            command = [
                "curl", "--fail", "--location", "--silent", "--show-error",
                "--connect-timeout", "30", "--max-time", "3600",
                "--range", f"{range_start}-{end}",
                "--output", str(remainder), url,
            ]
            result = subprocess.run(command, check=False)
            if remainder.exists():
                with remainder.open("rb") as source, part.open("ab") as output:
                    shutil.copyfileobj(source, output, length=8 * 1024 * 1024)
                remainder.unlink()
            if part.exists() and part.stat().st_size > expected:
                part.unlink()
                raise IOError(f"Range {start}-{end} exceeded expected size {expected}")
            if result.returncode and attempts < retries:
                print(
                    f"  range {start}-{end} interrupted at "
                    f"{part.stat().st_size if part.exists() else 0}/{expected}; resuming",
                    flush=True,
                )
        if part.stat().st_size != expected:
            raise IOError(f"Range {start}-{end} returned {part.stat().st_size} bytes")
        return part

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(fetch, bounds) for bounds in ranges]
        for index, future in enumerate(as_completed(futures), start=1):
            future.result()
            print(f"  archive ranges: {index}/{len(ranges)} complete", flush=True)

    partial = destination.with_suffix(destination.suffix + ".part")
    with partial.open("wb") as output:
        for bounds in ranges:
            part = chunk_dir / f"{bounds[0]:012d}-{bounds[1]:012d}.part"
            with part.open("rb") as source:
                shutil.copyfileobj(source, output, length=8 * 1024 * 1024)
    if partial.stat().st_size != size:
        raise IOError(f"Combined archive has {partial.stat().st_size} bytes; expected {size}")
    partial.replace(destination)
    shutil.rmtree(chunk_dir)


def warm_mendeley_page(url: str) -> None:
    """Establish the public dataset page session before following S3 download redirects."""
    subprocess.run(
        ["curl", "--fail", "--location", "--silent", "--show-error", "--retry", "5",
         "--retry-all-errors", "--retry-delay", "2", "--connect-timeout", "30",
         "--max-time", "120", "--output", os.devnull, url],
        check=True,
    )


def fetch_json(url: str, destination: Path | None = None) -> dict:
    if destination and destination.exists():
        return json.loads(destination.read_text(encoding="utf-8"))
    if destination is None:
        raise ValueError("A destination is required when fetching source metadata")
    curl_download(url, destination, retries=5)
    result = json.loads(destination.read_text(encoding="utf-8"))
    destination.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def md5_file(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def save_image(source: Path | io.BytesIO | bytes, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(source, bytes):
        source = io.BytesIO(source)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(
            image, IMAGE_SIZE, method=Image.Resampling.BILINEAR, centering=(0.5, 0.5)
        )
        image.save(target, format="JPEG", quality=92, optimize=True)


def manifest_rows() -> dict[str, dict[str, str]]:
    if not MANIFEST.exists():
        return {}
    with MANIFEST.open(newline="", encoding="utf-8") as stream:
        return {row["relative_path"]: row for row in csv.DictReader(stream)}


def write_manifest(rows: dict[str, dict[str, str]]) -> None:
    PROVENANCE.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=MANIFEST_FIELDS)
        writer.writeheader()
        writer.writerows(rows[key] for key in sorted(rows))


def add_manifest_row(
    rows: dict[str, dict[str, str]], *, crop: str, label: str, source: str,
    source_doi: str, source_image: str, source_id: str, source_sha: str,
    specimen: str = "", simulated: str = "unknown",
) -> None:
    relative = f"data/training/{crop}/{label}/{source_id}.jpg"
    target = ROOT / relative
    if not target.exists():
        return
    rows[relative] = {
        "relative_path": relative,
        "crop": crop,
        "class_name": label,
        "source_dataset": source,
        "source_doi": source_doi,
        "source_image": source_image,
        "source_file_id": source_id,
        "source_sha256": source_sha,
        "license": "CC BY 4.0",
        "specimen_id": specimen,
        "split": "unassigned",
        "is_simulated": simulated,
        "prepared_sha256": sha256_file(target),
    }


def record_source_files() -> None:
    PROVENANCE.mkdir(parents=True, exist_ok=True)
    SOURCES.write_text(json.dumps(SOURCES_DATA, indent=2) + "\n", encoding="utf-8")


def prepare_pineapple(rows: dict[str, dict[str, str]]) -> None:
    base = "https://zenodo.org/records/21893516/files/"
    metadata_path = TEMP_ROOT / "pineapple_metadata.csv"
    if not metadata_path.exists():
        prov_meta = PROVENANCE / "pineapple_metadata.csv"
        if prov_meta.exists():
            shutil.copy2(prov_meta, metadata_path)
        else:
            curl_download(base + "Metadata_PineappleLeafdiseaseDataset.csv?download=1", metadata_path)
    with metadata_path.open(newline="", encoding="utf-8-sig") as stream:
        metadata = {row["Image_Name"]: row for row in csv.DictReader(stream)}

    archives = [
        ("PLDD_Healthy.zip", "e8fee15caad06ac2cf138b76c28e1da3", "healthy", 3657073385),
        ("PLDD_Mealy_bug_wilt.zip", "cbb44ec6ce7a6f697f3ef9ba488d24df", "mealybug_wilt", 3894767321),
    ]
    for filename, expected_md5, label, size in archives:
        update_acquisition_status("in_progress", active_crop="pineapple", active_archive=filename, reason=f"Downloading {filename}")
        archive = TEMP_ROOT / filename
        if not archive.exists():
            curl_download_segmented(base + filename + "?download=1", archive, size)
        print(f"Verifying MD5 checksum for {filename}...", flush=True)
        md5 = md5_file(archive)
        if md5 != expected_md5:
            raise ValueError(f"MD5 mismatch for {filename}: expected {expected_md5}, got {md5}")
        source_name = SOURCES_DATA["pineapple"]["name"]
        update_acquisition_status("in_progress", active_crop="pineapple", active_archive=filename, reason=f"Extracting and preprocessing {filename}")
        with zipfile.ZipFile(archive) as zf:
            members = [m for m in zf.infolist() if not m.is_dir() and PurePosixPath(m.filename).suffix.lower() in {".jpg", ".jpeg", ".png"}]
            total_members = len(members)
            print(f"Extracting {total_members} images from {filename} into {label}...", flush=True)
            for idx, member in enumerate(members, start=1):
                basename = PurePosixPath(member.filename).name
                info = metadata.get(basename, {})
                specimen = info.get("Specimen_ID", "")
                image_id = Path(basename).stem
                target = TRAINING / "pineapple" / label / f"{image_id}.jpg"
                if not target.exists():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    save_image(io.BytesIO(zf.read(member)), target)
                add_manifest_row(
                    rows, crop="pineapple", label=label, source=source_name,
                    source_doi="10.5281/zenodo.21893516", source_image=member.filename,
                    source_id=image_id, source_sha="", specimen=specimen, simulated="false",
                )
                if idx % 100 == 0 or idx == total_members:
                    print(f"  Processed {idx}/{total_members} {label} images...", flush=True)
                    write_manifest(rows)
                    update_acquisition_status("in_progress", active_crop="pineapple", active_archive=filename, reason=f"Processed {idx}/{total_members} {label} images")
        archive.unlink(missing_ok=True)
        write_manifest(rows)
        update_acquisition_status("in_progress", active_crop="pineapple", reason=f"Completed {filename}")


def rice_label(filename: str) -> str | None:
    name = filename.casefold().replace("\\", "/")
    stem = PurePosixPath(name).stem
    # The source labels these classes with explicit prefixes. Other categories
    # (including Brown Spot and Neck Blast) are intentionally not relabeled.
    rules = [
        ("bacterial_leaf_blight", "bacterial_leaf_blight"),
        ("leaf_blast", "blast"),
        ("sheath_blight", "sheath_blight"),
        ("tungro", "tungro"),
        ("healthy", "healthy"),
    ]
    return next((label for prefix, label in rules if stem.startswith(prefix)), None)


def rice_target_files(files: list[dict]) -> list[tuple[dict, str]]:
    """Use the source's disease folders to resolve a few generically named files."""
    votes: dict[str, dict[str, int]] = {}
    folder_sizes: dict[str, int] = {}
    for item in files:
        label = rice_label(item.get("filename", ""))
        folder = item.get("folder_id", "")
        folder_sizes[folder] = folder_sizes.get(folder, 0) + 1
        if label and folder:
            bucket = votes.setdefault(folder, {})
            bucket[label] = bucket.get(label, 0) + 1
    folder_labels = {}
    for folder, counts in votes.items():
        label, count = max(counts.items(), key=lambda pair: pair[1])
        folder_size = folder_sizes[folder]
        if count / folder_size >= 0.9:
            folder_labels[folder] = label
    selected = []
    for item in files:
        label = rice_label(item.get("filename", ""))
        label = label or folder_labels.get(item.get("folder_id", ""))
        if label:
            selected.append((item, label))
    return selected


def prepare_rice(rows: dict[str, dict[str, str]], workers: int) -> None:
    warm_mendeley_page("https://data.mendeley.com/datasets/n8jpkpfz5p/1")
    api_path = PROVENANCE / "mendeley_rice_api.json"
    metadata = fetch_json("https://data.mendeley.com/public-api/datasets/n8jpkpfz5p", api_path)
    file_rows = rice_target_files(metadata["files"])
    temp_dir = TEMP_ROOT / "rice"
    temp_dir.mkdir(parents=True, exist_ok=True)

    def fetch_one(pair):
        item, label = pair
        source_id = item["id"]
        target = TRAINING / "rice" / label / f"{source_id}.jpg"
        if target.exists():
            return item, label
        original = temp_dir / f"{source_id}{Path(item['filename']).suffix or '.img'}"
        curl_download(item["content_details"]["download_url"], original, retries=8)
        try:
            expected_sha = item.get("content_details", {}).get("sha256_hash", "")
            if expected_sha and sha256_file(original).casefold() != expected_sha.casefold():
                raise ValueError(f"SHA-256 mismatch for rice source file {source_id}")
            save_image(original, target)
        finally:
            original.unlink(missing_ok=True)
        return item, label

    failures: list[dict[str, str]] = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(fetch_one, pair): pair for pair in file_rows}
        for future in as_completed(futures):
            requested_item, _ = futures[future]
            try:
                item, label = future.result()
            except Exception as error:
                cause = error.__cause__ or error
                failures.append({"source_file_id": requested_item["id"], "error": str(cause)})
                continue
            add_manifest_row(
                rows, crop="rice", label=label,
                source=SOURCES_DATA["rice"]["name"], source_doi="10.17632/n8jpkpfz5p.1",
                source_image=item["filename"], source_id=item["id"],
                source_sha=item.get("content_details", {}).get("sha256_hash", ""),
                simulated="unknown",
            )
            if len(rows) % 25 == 0:
                write_manifest(rows)
    shutil.rmtree(temp_dir, ignore_errors=True)
    write_manifest(rows)
    if failures:
        with FAILURES.open("w", newline="", encoding="utf-8") as stream:
            writer = csv.DictWriter(stream, fieldnames=["source_file_id", "error"])
            writer.writeheader()
            writer.writerows(failures)
        print(f"Rice: {len(failures)} source files failed; see {FAILURES}", flush=True)


def orange_label(member: str) -> str | None:
    path = member.casefold().replace("\\", "/")
    if any(word in path for word in ("augmented", "synthetic", "cgan", "generated", "fake")):
        return None
    parts = [re.sub(r"[^a-z0-9]+", "_", p).strip("_") for p in PurePosixPath(path).parts]
    normalized = "/".join(parts)
    if any(token in normalized for token in ("healthy_leaf", "healthy_orange", "/healthy/")):
        return "healthy"
    if "powdery_mildew" in normalized:
        return "powdery_mildew"
    if "citrus_canker" in normalized or "canker" in normalized:
        return "citrus_canker"
    if "citrus_greening" in normalized or "yellow_dragon" in normalized or "huanglongbing" in normalized:
        return "citrus_greening_hlb"
    return None


def prepare_orange(rows: dict[str, dict[str, str]], workers: int) -> None:
    # The 5 GB Sweetorange.zip is the original-image archive; the separate
    # Sweet_orange_cGAN_dataset.zip is excluded because it contains generated data.
    warm_mendeley_page("https://data.mendeley.com/datasets/f7cr74mwpj/1")
    api_path = PROVENANCE / "mendeley_orange_api.json"
    metadata = fetch_json("https://data.mendeley.com/public-api/datasets/f7cr74mwpj", api_path)
    source_file = next(x for x in metadata["files"] if x["filename"] == "Sweetorange.zip")
    archive = TEMP_ROOT / "Sweetorange.zip"
    update_acquisition_status("in_progress", active_crop="orange", active_archive="Sweetorange.zip", reason="Downloading Sweetorange.zip")
    if not archive.exists():
        curl_download_segmented(
            source_file["content_details"]["download_url"], archive,
            int(source_file["content_details"]["size"]),
            workers=max(workers, 6),
        )
    print("Verifying MD5 checksum for Sweetorange.zip...", flush=True)
    expected_sha = source_file.get("content_details", {}).get("sha256_hash", "")
    if expected_sha and sha256_file(archive).casefold() != expected_sha.casefold():
        raise ValueError("SHA-256 mismatch for the sweet orange source archive")
    update_acquisition_status("in_progress", active_crop="orange", active_archive="Sweetorange.zip", reason="Extracting and preprocessing orange images")
    with zipfile.ZipFile(archive) as zf:
        members = [
            m for m in zf.infolist()
            if not m.is_dir() and orange_label(m.filename) is not None
            and PurePosixPath(m.filename).suffix.lower() in {".jpg", ".jpeg", ".png"}
        ]
        total_members = len(members)
        print(f"Extracting {total_members} orange images...", flush=True)
        for idx, member in enumerate(members, start=1):
            label = orange_label(member.filename)
            source_id = hashlib.sha256(member.filename.encode("utf-8")).hexdigest()[:24]
            target = TRAINING / "orange" / label / f"{source_id}.jpg"
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                save_image(io.BytesIO(zf.read(member)), target)
            add_manifest_row(
                rows, crop="orange", label=label, source=SOURCES_DATA["orange"]["name"],
                source_doi="10.17632/f7cr74mwpj.1", source_image=member.filename,
                source_id=source_id, source_sha="", simulated="false",
            )
            if idx % 100 == 0 or idx == total_members:
                print(f"  Processed {idx}/{total_members} orange images...", flush=True)
                write_manifest(rows)
                update_acquisition_status("in_progress", active_crop="orange", active_archive="Sweetorange.zip", reason=f"Processed {idx}/{total_members} orange images")
    archive.unlink(missing_ok=True)
    write_manifest(rows)
    update_acquisition_status("in_progress", active_crop="orange", reason="Completed Sweetorange.zip")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--crop", choices=["all", "pineapple", "rice", "orange"], default="all")
    parser.add_argument("--workers", type=int, default=2, help="Concurrent downloads for rice images / orange archive chunks (default: 2; the source throttles per connection, so 24-32 is much faster)")
    args = parser.parse_args()
    if args.workers < 1 or args.workers > 32:
        parser.error("--workers must be between 1 and 32")
    TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    record_source_files()
    rows = manifest_rows()
    selected = {"pineapple", "rice", "orange"} if args.crop == "all" else {args.crop}
    for crop in ("pineapple", "rice", "orange"):
        if crop not in selected:
            continue
        print(f"Preparing {crop}…", flush=True)
        if crop == "pineapple":
            prepare_pineapple(rows)
        elif crop == "rice":
            prepare_rice(rows, args.workers)
        else:
            prepare_orange(rows, args.workers)
    print(f"Prepared images: {len(rows)}")
    counts: dict[tuple[str, str], int] = {}
    for row in rows.values():
        key = (row["crop"], row["class_name"])
        counts[key] = counts.get(key, 0) + 1
    for (crop, label), count in sorted(counts.items()):
        print(f"  {crop}/{label}: {count}")
    print(f"Manifest: {MANIFEST}")
    update_acquisition_status("completed", reason=f"Preparation completed for crop(s): {args.crop}")


if __name__ == "__main__":
    main()
