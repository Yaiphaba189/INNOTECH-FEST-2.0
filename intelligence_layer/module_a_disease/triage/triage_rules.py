"""Diagnostic triage decision framework and regional remediation protocols.

Calibrated specifically for Manipur agro-climatic conditions (ICAR / CAU Imphal).
Supports trilingual presentation (English, Bengali Script Manipuri, and Latin transliteration).
"""

from __future__ import annotations

from typing import Any, Dict


# Thresholds per Docs/PART2_AI_BACKEND_IMPLEMENTATION.md Section 2.3
CONFIRMED_THRESHOLD = 0.85
PRELIMINARY_THRESHOLD = 0.50

DISEASE_REMEDIES: Dict[str, Dict[str, Any]] = {
    # ── PINEAPPLE (Flagship Innotech Fest 2.0 Scope) ──
    "heart_rot": {
        "crop": "pineapple",
        "local_name": "মপন শাবা (Heart Rot)",
        "scientific_name": "Phytophthora nicotianae var. parasitica",
        "severity_default": "moderate",
        "symptoms": [
            "Water-soaked soft rot at central leaf base",
            "Brown necrotic leaf margins",
            "Inner whorl leaf detachment with foul odor"
        ],
        "organic": "Dip slips in Trichoderma viride (10g/L) for 15 minutes before planting.",
        "chemical": "Spray Copper Oxychloride (0.25%) or Fosetyl-Aluminium (0.2%) at heart base.",
        "cultural": "Dig 30cm drainage trenches immediately to eliminate stagnant water between ridges."
    },
    "black_rot": {
        "crop": "pineapple",
        "local_name": "হৈনোম অমোৎপা (Black Rot)",
        "scientific_name": "Ceratocystis paradoxa / Thielaviopsis paradoxa",
        "severity_default": "severe",
        "symptoms": [
            "Watery black breakdown of fruit flesh and peduncle stalk",
            "Dark soot-like spore masses along core axis",
            "Fruit softening and collapse under slight pressure"
        ],
        "organic": "Apply neem seed kernel extract (5%) around stalk scars post-harvest.",
        "chemical": "Spray Carbendazim (0.1%) or Propiconazole (0.1%) over affected stems.",
        "cultural": "Avoid harvesting in damp mornings; cure fruits in shade for 2 hours before packing."
    },
    "mealybug_wilt": {
        "crop": "pineapple",
        "local_name": "হৈনোম হিক তাবা (Mealybug Wilt)",
        "scientific_name": "Dysmicoccus brevipes vectoring PMWV virus",
        "severity_default": "mild",
        "symptoms": [
            "Flaccid, reflexed downward curving leaves",
            "Distinct pinkish-bronze coloration at leaf tips",
            "White waxy cottony mealybug colonies at leaf bases"
        ],
        "organic": "Spray fish oil rosin soap (25g/L) or botanical petroleum agricultural oils.",
        "chemical": "Soil drench with Imidacloprid (0.3ml/L) or Chlorpyrifos around root zone.",
        "cultural": "Control attendant ant colonies using sticky barrier bands around plant stands."
    },
    "healthy": {
        "crop": "all",
        "local_name": "হকচাং ফবা (Healthy Stand)",
        "scientific_name": "Normal botanical state",
        "severity_default": "none",
        "symptoms": [
            "Rigid, erect green leaf blades with healthy waxy sheen",
            "Uniform skin development",
            "Intact, upright central structure"
        ],
        "organic": "Continue balanced vermicompost application (2kg per stand).",
        "chemical": "No chemical intervention needed.",
        "cultural": "Maintain regular weeding and ridge aeration."
    },

    # ── RICE (Extension Scope) ──
    "blast": {
        "crop": "rice",
        "local_name": "চেকপোকপা (Rice Blast)",
        "scientific_name": "Magnaporthe oryzae",
        "severity_default": "severe",
        "symptoms": [
            "Spindle/diamond-shaped gray lesions with brown borders",
            "Neck rot causing panicle collapse"
        ],
        "organic": "Foliar spray with Pseudomonas fluorescens (2.5g/L).",
        "chemical": "Spray Tricyclazole 75 WP (0.6g/L) or Isoprothiolane (1.5ml/L).",
        "cultural": "Avoid excessive nitrogen fertilizer; avoid prolonged field inundation."
    },
    "bacterial_leaf_blight": {
        "crop": "rice",
        "local_name": "নাহা শাবা (Bacterial Leaf Blight)",
        "scientific_name": "Xanthomonas oryzae pv. oryzae",
        "severity_default": "moderate",
        "symptoms": [
            "Water-soaked lesions turning yellow to white from leaf tips",
            "Bacterial ooze droplets on leaf surfaces in early morning"
        ],
        "organic": "Spray fresh cow dung supernatant (20%) or neem cake aqueous extract.",
        "chemical": "Spray Streptocycline (1g in 10L) + Copper Oxychloride (25g in 10L).",
        "cultural": "Drain standing water; prune lower affected leaves."
    },
    "sheath_blight": {
        "crop": "rice",
        "local_name": "মখোং শাবা (Sheath Blight)",
        "scientific_name": "Rhizoctonia solani",
        "severity_default": "moderate",
        "symptoms": [
            "Greenish-gray oval lesions with dark brown borders on leaf sheaths near waterline"
        ],
        "organic": "Apply Trichoderma harzianum enriched farmyard manure.",
        "chemical": "Spray Hexaconazole 5% EC (2ml/L) or Validamycin 3% L (2.5ml/L).",
        "cultural": "Maintain optimum plant density to allow solar penetration into canopy."
    },
    "tungro": {
        "crop": "rice",
        "local_name": "অঙাংবা মচিংশিনবা (Rice Tungro)",
        "scientific_name": "Rice tungro bacilliform virus (RTBV)",
        "severity_default": "severe",
        "symptoms": [
            "Yellow to orange-yellow leaf discoloration starting from tips",
            "Stunted growth, delayed flowering, sterile spikelets"
        ],
        "organic": "Neem oil spray (3%) to deter green leafhopper vector.",
        "chemical": "Spray Thiamethoxam 25 WG (0.2g/L) to control leafhopper vector.",
        "cultural": "Rogue and burn infected hills; synchronize planting across community."
    },

    # ── TAMENGLONG MANDARIN / ORANGE (Extension Scope) ──
    "citrus_canker": {
        "crop": "orange",
        "local_name": "হৈব্রু ঘা (Citrus Canker)",
        "scientific_name": "Xanthomonas axonopodis pv. citri",
        "severity_default": "moderate",
        "symptoms": [
            "Raised corky brownish blister lesions surrounded by oily yellow halos"
        ],
        "organic": "Prune infected twigs in dry weather; spray Bordeaux mixture 1%.",
        "chemical": "Spray Copper Oxychloride 50 WP (3g/L) + Streptocycline (100 ppm).",
        "cultural": "Disinfect pruning shears between trees; establish windbreaks."
    },
    "citrus_greening_hlb": {
        "crop": "orange",
        "local_name": "কমলা হালবা (Huanglongbing / HLB)",
        "scientific_name": "Candidatus Liberibacter asiaticus",
        "severity_default": "severe",
        "symptoms": [
            "Asymmetric blotchy leaf mottle with yellow veins",
            "Small, lopsided fruit with aborted seeds and bitter juice"
        ],
        "organic": "Encourage natural predators (ladybird beetles) against citrus psyllids.",
        "chemical": "Spray Dimethoate 30 EC (1.5ml/L) or Imidacloprid (0.3ml/L) to target psyllid.",
        "cultural": "Strict eradication of infected branches; use certified disease-free rootstocks."
    },
    "powdery_mildew": {
        "crop": "orange",
        "local_name": "অঙৌবা খুপপা (Powdery Mildew)",
        "scientific_name": "Oidium tingitaninum",
        "severity_default": "mild",
        "symptoms": [
            "White talcum-like powdery fungal growth on tender leaves and shoots"
        ],
        "organic": "Foliar spray with baking soda (5g/L) + horticultural soap.",
        "chemical": "Spray Wettable Sulphur 80 WP (2.5g/L) or Dinocap (1ml/L).",
        "cultural": "Canopy thinning to improve air circulation and sunlight exposure."
    },
    "root_rot": {
        "crop": "orange",
        "local_name": "মরী শাবা (Citrus Root / Collar Rot)",
        "scientific_name": "Phytophthora nicotianae",
        "severity_default": "severe",
        "symptoms": [
            "Bark splitting and gum exudation near collar base, root decay and leaf chlorosis"
        ],
        "organic": "Soil application of Trichoderma viride enriched compost around basin.",
        "chemical": "Paste trunk with Bordeaux paste (1:1:10) and drench Metalaxyl-M (2.5g/L).",
        "cultural": "Avoid waterlogging around trunk; ensure high-budded planting on raised mounds."
    },

    # ── CHILLI / UMOROK (King Chilli GI Extension Scope) ──
    "anthracnose": {
        "crop": "chilli",
        "local_name": "উ-মোরোক অমোৎপা (Chilli Anthracnose / Fruit Rot)",
        "scientific_name": "Colletotrichum capsici",
        "severity_default": "severe",
        "symptoms": [
            "Sunken circular necrotic black spots with concentric rings on ripe fruit pods",
            "Fruit shriveling and premature pod drop"
        ],
        "organic": "Spray neem oil (3%) or Trichoderma viride formulation (5g/L).",
        "chemical": "Spray Azoxystrobin 23 SC (1ml/L) or Copper Oxychloride 50 WP (2.5g/L).",
        "cultural": "Destroy infected pods; avoid overhead irrigation during flowering/fruiting."
    },
    "leaf_curl": {
        "crop": "chilli",
        "local_name": "উ-মোরোক মনা কুংশিনবা (Chilli Leaf Curl Virus)",
        "scientific_name": "Chilli leaf curl virus (ChiLCV) transmitted by Bemisia tabaci",
        "severity_default": "moderate",
        "symptoms": [
            "Upward curling, puckering, and crinkling of leaves with thickened veins",
            "Stunted internodes resulting in bushy, dwarfed plant architecture"
        ],
        "organic": "Install yellow sticky traps (10 per acre) and spray horticultural insecticidal soap.",
        "chemical": "Spray Diafenthiuron 50 WP (1g/L) or Acetamiprid 20 SP (0.2g/L) to manage whitefly vectors.",
        "cultural": "Plant barrier border crops of maize or sorghum; rogue out early infected plants."
    },
    "bacterial_wilt": {
        "crop": "chilli",
        "local_name": "উ-মোরোক মরা শাবা (Chilli Bacterial Wilt)",
        "scientific_name": "Ralstonia solanacearum",
        "severity_default": "severe",
        "symptoms": [
            "Rapid daytime wilting of entire plant foliage without initial chlorosis",
            "Vascular browning inside stem pith and bacterial stream streaming from cut stem"
        ],
        "organic": "Root zone drench with Pseudomonas fluorescens (10g/L) at transplanting.",
        "chemical": "Soil drench around root zone with Copper Hydroxide (2g/L) + Streptocycline (100 ppm).",
        "cultural": "Rotate with non-solanaceous crops (maize, pulses); construct high raised drainage beds."
    }
}



def synthesize_triage(
    predicted_class: str,
    confidence_score: float,
    user_override_severity: str | None = None
) -> Dict[str, Any]:
    """Applies the diagnostic triage rules based on model confidence score."""
    clean_class = predicted_class.lower().strip()
    remedy_info = DISEASE_REMEDIES.get(clean_class, DISEASE_REMEDIES["healthy"])

    # 1. Determine Diagnostic Status & Protocol
    if confidence_score >= CONFIRMED_THRESHOLD:
        diagnostic_status = "confirmed"
        triage_action = "Display validated chemical and organic remedy protocols."
        is_healthy = clean_class == "healthy"
        severity = "none" if is_healthy else (user_override_severity or remedy_info["severity_default"])
        # Severe conditions trigger KVK referral option
        refer_to_expert = (severity == "severe" or clean_class == "heart_rot")
    elif confidence_score >= PRELIMINARY_THRESHOLD:
        diagnostic_status = "preliminary"
        triage_action = "Provisional alert. Advise re-scan in 48 hours and monitor stand."
        severity = "mild" if clean_class != "healthy" else "none"
        refer_to_expert = False
    else:
        diagnostic_status = "inconclusive"
        triage_action = "Inconclusive result. Capture new photo under brighter sunlight or request officer inspection."
        severity = "unknown"
        refer_to_expert = True

    return {
        "diagnostic_status": diagnostic_status,
        "predicted_class": clean_class,
        "local_name": remedy_info["local_name"],
        "scientific_name": remedy_info["scientific_name"],
        "confidence_score": round(confidence_score, 4),
        "severity_rating": severity,
        "refer_to_expert": refer_to_expert,
        "triage_action": triage_action,
        "symptoms_detected": remedy_info.get("symptoms", []),
        "recommended_actions": {
            "organic": remedy_info["organic"],
            "chemical": remedy_info["chemical"],
            "cultural": remedy_info["cultural"]
        }
    }
