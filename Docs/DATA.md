# DATA SOURCES — HARVESTLINK AI Disease Screening

**Project:** HARVESTLINK AI — Predictive Crop Intelligence & Smart Market Linkage for Manipur (INNOTECH FEST 2.0)  
**Module:** Module A — Crop Disease Screening (MobileNetV3 computer vision, 224×224 input, 5 MB max image)  
**Status:** Reference for AI/ML Engineer (Member 1)

> **Curation status (17 Oct 2026):** The source records and licenses below were checked. `scripts/prepare_public_datasets.py` downloads selected public data, exports 224×224 RGB JPEGs into lowercase `data/training/`, and writes per-image provenance to `data/provenance/image_manifest.csv`. It does not assign validation splits when specimen IDs are missing. A prior attempt retrieved 70 rice bacterial-leaf-blight images; the full acquisition is now running with resumable range downloads. Track current progress in `data/provenance/acquisition_status.json`. Do not train from the partial set. Public images are not Manipur field validation.

---

## 1. Purpose

This document lists where to obtain **real, labeled disease image data** for training/validating the Module A vision models.

Per **Docs/PART1_ARCHITECTURE_AND_FOUNDATION.md — Core Principle #1 (Radical AI Honesty)** and **#2 (Progressive AI Layer)**:
- Never train or evaluate on undisclosed synthetic data presented as real.
- Every demo/simulated record must carry `is_simulated = TRUE` in the DB and must never be mixed into the production training set.
- Phase 1 = deterministic/phenological rules; Phase 2 = pilot data logging & ground validation; Phase 3 = neural models trained only on real field data.

---

## 2. In-Scope Crops for Disease Detection

Module A screens the following **three crops** using the same MobileNetV3 + 224×224 pipeline:

| Crop | Varieties / Types in Manipur | Classes to Detect |
|------|------------------------------|-------------------|
| **Pineapple** | Queen, Kew | `healthy`, `heart_rot`, `black_rot`, `mealybug_wilt` |
| **Rice** | Chak-hao (black rice), white rice | `healthy`, `blast`, `bacterial_leaf_blight`, `sheath_blight`, `tungro` |
| **Orange** | Tamenglong mandarin | `healthy`, `citrus_greening_hlb`, `citrus_canker`, `powdery_mildew`, `root_rot` |

Each crop gets its own model weights file exported to `data/models/`.

---

## 3. Pineapple (Queen & Kew) — Current Module A Scope

Your project screens four classes from pineapple photos:
`healthy`, `heart_rot`, `black_rot`, `mealybug_wilt`

### 3.1 Verified public dataset

**Zenodo — Pineapple Leaf Disease Dataset (PLDD)**
- **URL:** https://zenodo.org/records/21893516  
- **DOI:** 10.5281/zenodo.21893516  
- **Authors:** Raj, S., Prakash, N., Malik, N. (The NorthCap University)  
- **License:** CC BY 4.0  
- **Published:** 11 Aug 2026  
- **Size:** ~15.8 GB total (5 class ZIPs + metadata CSV)

| File | Size | Class |
|------|------|-------|
| `PLDD_Healthy.zip` | ~3.7 GB | Healthy (1,118 images) |
| `PLDD_Mealy_bug_wilt.zip` | ~3.9 GB | Mealybug Wilt (1,089 images) |
| `PLDD_Fusarium.zip` | ~4.3 GB | Fusarium Rot (not your target class) |
| `PLDD_Leaf_Blight.zip` | ~4.0 GB | Leaf Blight (not your target class) |
| `Metadata_PineappleLeafdiseaseDataset.csv` | 725 KB | Image-level metadata (name, class, specimen ID, camera) |

**Use:** `Healthy` + `Mealybug Wilt` only (2 of 4 project labels). The source has 50 specimens per class and specimen IDs in its metadata, so these classes can use specimen-level splits. Images show pineapple leaves from Vazhakulam, Kerala; they are not Manipur Queen/Kew field validation.

**Gap:** PLDD contains no `Heart Rot` or `Black Rot` images. Those are plant-base/fruit symptoms and cannot be inferred from this leaf-only set. Keep those classes empty until images are collected and diagnosed locally.

### 3.2 Where to get Heart Rot + Black Rot images (Manipur-specific)

| Source | Contact / Location | What to photograph |
|--------|-------------------|-------------------|
| KVK Churachandpur | Krishi Vigyan Kendra, Churachandpur | Heart Rot (central leaf base, water-soaked rot, brown necrotic margins), Black Rot (fruit stalk black breakdown) |
| KVK Thoubal | Krishi Vigyan Kendra, Thoubal | Same as above |
| KVK Imphal East | Krishi Vigyan Kendra, Imphal East | Same as above |
| KVK Bishnupur | Krishi Vigyan Kendra, Bishnupur | Same as above |
| Central Agricultural University (CAU), Imphal | Plant Pathology / Horticulture dept. | Verified symptomatic & healthy pineapple specimens |
| ICAR Research Complex for NEH Region, Manipur | Imphal | Field disease samples |
| Dept. of Agriculture, Govt. of Manipur | Imphal | Crop health records & farmer fields |
| Local Queen & Kew pineapple farms | Churachandpur, Thoubal, Imphal East, Bishnupur clusters | Crown (`crown`), fruit base (`fruit_base`), lateral leaf (`lateral`) angles |

**Target:** ≥200–300 verified images per class, varied lighting/angles, each <5 MB.

**Photo angles (match your API `image_angle` enum):**
- `crown` — top of plant / leaf whorl (Heart Rot signifiers)
- `fruit_base` — stalk / fruit bottom (Black Rot signifiers)
- `lateral` — side leaf view (Mealybug Wilt: pinkish-bronze tips, white waxy bugs)

---

## 4. Rice — In-Scope Detection Target

Rice is Manipur's staple food crop. Chak-hao (black rice) is GI-tagged and economically important.

### 4.1 Classes to detect

| Class | What to look for |
|-------|------------------|
| `healthy` | Green, upright leaves; no spots or lesions |
| `blast` | Diamond/elliptical gray-white lesions with brown margins on leaves (Magnaporthe oryzae) |
| `bacterial_leaf_blight` | Yellow to white leaf lesions starting from leaf tip/margin, oozing bacteria (Xanthomonas oryzae) |
| `sheath_blight` | Greenish-gray to straw-colored lesions on leaf sheaths near waterline (Rhizoctonia solani) |
| `tungro` | Yellow-orange leaf discoloration, stunted growth, reduced tillering (virus, vector: green leafhopper) |

### 4.2 Verified public data source

| Dataset | URL / DOI | In-scope coverage | License and limits |
|---------|-----------|-------------------|--------------------|
| **A Rice Leaf Disease Image Dataset for Multi-Class Disease Classification** | [Mendeley Data](https://data.mendeley.com/datasets/n8jpkpfz5p/1), DOI `10.17632/n8jpkpfz5p.1` | Healthy (753), leaf blast (521), bacterial leaf blight (785), sheath blight (608), tungro (556) | CC BY 4.0. The page's stated total (6,758) conflicts with its class totals and file listing (6,712). The five selected target folders contain 3,223 files (~0.69 GB). No plant/specimen IDs are supplied; leave `split=unassigned` until groups and duplicates are reviewed. Source varieties and Manipur location are not established. |

Generic PlantVillage/Kaggle/GitHub search results are not source records: a platform or search result alone does not establish image license, label provenance, and target class coverage.

### 4.3 Local Manipur collection (recommended for ground truth)

| Source | Contact / Location | What to photograph |
|--------|-------------------|-------------------|
| CAU Imphal | Agronomy / Plant Pathology dept. | Verified blast, blight, sheath blight, tungro specimens |
| KVK Churachandpur / Thoubal / Imphal East / Bishnupur | Krishi Vigyan Kendras | Farmer-field rice disease samples |
| Dept. of Agriculture, Govt. of Manipur | Imphal | Crop health records, pest/disease surveillance photos |
| Local rice farms | Churachandpur, Thoubal, Imphal East, Bishnupur valleys | Rice leaf close-ups showing lesions/spots/streaks |

**Target:** ≥200–300 verified images per class, each <5 MB.

**Photo angles (suggested):**
- `leaf_top` — upper leaf surface showing lesions (blast, blight)
- `leaf_sheath` — sheath near waterline (sheath blight)
- `whole_plant` — stunted/yellowed plants (tungro)

---

## 5. Orange (Tamenglong Mandarin) — In-Scope Detection Target

Tamenglong orange is a GI-tagged major hill cash crop of Manipur.

### 5.1 Classes to detect

| Class | What to look for |
|-------|------------------|
| `healthy` | Green, glossy leaves; no spots, cracks, or yellowing |
| `citrus_greening_hlb` | Asymmetric yellow mottling on leaves, stunted fruit, bitter taste (Candidatus Liberibacter, vector: psyllid) |
| `citrus_canker` | Raised corky lesions with yellow halos on leaves/fruit/twigs (Xanthomonas axonopodis) |
| `powdery_mildew` | White powdery fungal growth on leaves, shoots, fruit |
| `root_rot` | Yellowing, wilting, root decay; often at base of trunk (Phytophthora) |

### 5.2 Verified public data source

| Dataset | URL / DOI | In-scope coverage | License and limits |
|---------|-----------|-------------------|--------------------|
| **Multi-format open-source sweet orange leaf dataset** | [Mendeley Data](https://data.mendeley.com/datasets/f7cr74mwpj/1), DOI `10.17632/f7cr74mwpj.1` | Healthy, citrus canker, citrus greening/yellow dragon (mapped to HLB), powdery mildew | CC BY 4.0. Use `Sweetorange.zip` (original image archive, 5.03 GB); exclude the separate cGAN archive from real-image training. This is sweet orange from Bangladesh, not Tamenglong mandarin. The source's stated coordinates appear inconsistent with its stated location, so do not use them as validated location metadata. |

No suitable licensed public `root_rot` image class was verified. Root rot is primarily a root/base diagnosis and should not be inferred from leaf-only orange images. Keep this label empty pending expert-verified local collection.

### 5.3 Local Manipur collection (recommended for ground truth)

| Source | Contact / Location | What to photograph |
|--------|-------------------|-------------------|
| Tamenglong orange orchards | Tamenglong district farms | HLB mottling, canker lesions, powdery mildew |
| KVK Tamenglong / nearby KVKs | Krishi Vigyan Kendra | Verified citrus disease specimens |
| CAU Imphal | Horticulture dept. | Healthy vs diseased orange leaves/fruit |
| Dept. of Agriculture / State Horticulture Mission, Govt. of Manipur | Imphal | Citrus crop health records |

**Target:** ≥200–300 verified images per class, each <5 MB.

**Photo angles (suggested):**
- `leaf` — leaf surface showing mottling/canker/powder (HLB, canker, mildew)
- `fruit` — fruit surface showing canker spots or greening symptoms
- `twig_base` — base of twig/trunk near soil (root rot)

---

## 6. Other Crops (Extension Plan — Future)

Manipur also grows these crops. You can extend Module A crop-by-crop later using the same pipeline.

| Crop | Importance | Key diseases | Public data |
|------|-----------|--------------|-------------|
| Bird's Eye Chilli (Umorok — GI-tagged) | High-value export from hills | Anthracnose, Leaf curl virus, Blight | PlantVillage (pepper), Kaggle |
| Banana | Valley-grown, widely consumed | Sigatoka leaf spot, Panama disease, Bunchy top | Kaggle, GitHub |
| Maize | Common upland crop | Northern leaf blight, Downy mildew | PlantVillage (corn), Kaggle |
| Ginger & Turmeric | Hill rhizome crops | Soft rot, Rhizome rot, Leaf blotch | Limited publicly; collect locally |
| Tea | Some plantation areas | Blister blight, Red rust, Armillaria root rot | Academic/research repos |

---

## 7. Download and Prepare the Verified Sources

From the repository root, run:

```bash
python3 -m pip install Pillow
python3 scripts/prepare_public_datasets.py --crop all
```

The all-crop run downloads the two pineapple archives (~7.6 GB), selected rice images (~0.7 GB based on the source file listing), and original sweet-orange archive (~5.0 GB). It exports RGB 224×224 JPEGs, records image source and license, retains pineapple specimen IDs, and leaves rice/orange split assignment unassigned when specimen IDs are unavailable. Source archives are removed after conversion. Use `--crop pineapple`, `--crop rice`, or `--crop orange` to prepare one crop. `--workers` controls concurrent rice downloads.

The pineapple metadata CSV is stored at `data/provenance/pineapple_metadata.csv` and retains the source specimen IDs. Never present source images from Kerala or Bangladesh as Manipur field samples.

---

## 8. Data Guidelines (match your inference spec)

| Parameter | Value |
|-----------|-------|
| Image size | 224 × 224 px (bilinear resize, center crop) |
| Max file size | < 5 MB per image |
| MIME types | image/jpeg, image/png |
| Normalization | Channel-wise z-score (ImageNet standard) |
| Classes (pineapple) | `healthy`, `heart_rot`, `black_rot`, `mealybug_wilt` |
| Classes (rice) | `healthy`, `blast`, `bacterial_leaf_blight`, `sheath_blight`, `tungro` |
| Classes (orange) | `healthy`, `citrus_greening_hlb`, `citrus_canker`, `powdery_mildew`, `root_rot` |
| Split strategy | **Specimen-level split** where source IDs exist; otherwise remain unassigned until groups are verified |
| Demo/synthetic tagging | `is_simulated = TRUE` in DB; never mixed into production training |
| Target metrics | Top-1 accuracy ≥ 88%; Heart Rot macro recall ≥ 92% |

---

## 9. Suggested Pipeline

1. Run `python3 scripts/prepare_public_datasets.py --crop all` to download the listed licensed sources and export 224×224 RGB JPEGs into lowercase `data/training/` class folders.
2. Review `data/provenance/image_manifest.csv`; keep source DOI, image identity, license, specimen ID, and split state with each image.
3. Create train/validation/test splits only after specimen/group identifiers are established. PLDD supports this for pineapple healthy and mealybug wilt; rice and orange remain unassigned until reviewed.
4. Collect and expert-label Manipur-specific pineapple heart rot/black rot, Tamenglong orange root rot, and local validation images. Do not fill these classes with visually similar diseases or generic web images.
5. Normalize tensors with ImageNet channel statistics in the model input pipeline; do not bake normalized values into JPEGs.
6. Train only on labels with documented provenance and verify on separate Manipur field data before presenting accuracy as local performance.

---

## 10. Suggested Directory Layout

```
data/
├── demo/                 # Synthetic/test scenarios (tagged is_simulated=TRUE)
│   └── sample_images/
├── training/
│   ├── pineapple/
│   │   ├── healthy/
│   │   ├── heart_rot/          # empty until locally verified
│   │   ├── black_rot/          # empty until locally verified
│   │   └── mealybug_wilt/
│   ├── rice/
│   │   ├── healthy/
│   │   ├── blast/
│   │   ├── bacterial_leaf_blight/
│   │   ├── sheath_blight/
│   │   └── tungro/
│   ├── orange/
│   │   ├── healthy/
│   │   ├── citrus_greening_hlb/
│   │   ├── citrus_canker/
│   │   ├── powdery_mildew/
│   │   └── root_rot/           # empty until locally verified
│   └── ...               # future crops: chilli, banana, maize, etc.
├── provenance/
│   ├── image_manifest.csv     # source/license/specimen/split per prepared image
│   ├── sources.json           # dataset record and license details
│   └── pineapple_metadata.csv # source specimen metadata
└── models/               # Exported model weights (.pt files)
```

---

## 11. Competition Defensibility Checklist (for judges)

- [ ] Pineapple `Healthy` + `Mealybug Wilt` from Zenodo PLDD (DOI: 10.5281/zenodo.21893516)
- [ ] Pineapple `Heart Rot` + `Black Rot` from verified Manipur field collection (KVK/CAU/farms)
- [ ] Rice classes from the cited CC BY dataset + verified Manipur field collection
- [ ] Orange classes from the cited CC BY dataset + verified Tamenglong orchard collection
- [ ] Every image < 5 MB, resized to 224×224
- [ ] Specimen-level train/test split (no leakage)
- [ ] All demo records tagged `is_simulated = TRUE`
- [ ] Model version + confidence logged per inference (`model_version` field in `disease_assessments`)

---

**Owner:** Member 1 (AI / ML Engineer) — `intelligence_layer/module_a_disease/`  
**Last updated:** Oct 2026
