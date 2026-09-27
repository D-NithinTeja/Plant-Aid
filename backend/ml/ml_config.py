"""Shared constants for the groundnut classifier training pipeline (Docs/plan.md).

Kept free of torch imports so prepare_data.py runs in a minimal environment.
"""

from pathlib import Path

# Six filename-derived classes measured in the dataset audit (Docs/plan.md §2).
# Sorted order fixes the model's class indices across runs and machines.
CLASS_ALLOWLIST = [
    "early_leaf_spot",
    "early_rust",
    "healthy_leaf",
    "late_leaf_spot",
    "nutrition_deficiency",
    "rust",
]

CLASS_TO_IDX = {name: idx for idx, name in enumerate(CLASS_ALLOWLIST)}
HEALTHY_CLASS = "healthy_leaf"
PLANT_SPECIES = "Groundnut (Arachis hypogaea)"

# Human-readable names for the UI. `disease_id` is 1-based and must match the
# seed rows of data store D2 (diseases table) used by the Module 0.4 remedy lookup.
# This is the single source of truth for the class catalogue: export.py emits it to
# labels.json and the inference engine reads it directly (ml_engine.py).
CLASS_DISPLAY = {
    "early_leaf_spot": {
        "disease_id": 1,
        "disease_name": "Groundnut Early Leaf Spot",
        "scientific_name": "Cercospora arachidicola",
        "is_healthy": False,
    },
    "early_rust": {
        "disease_id": 2,
        "disease_name": "Groundnut Early Rust",
        "scientific_name": "Puccinia arachidis",
        "is_healthy": False,
    },
    "healthy_leaf": {
        "disease_id": 3,
        "disease_name": "Healthy Leaf",
        "scientific_name": "Arachis hypogaea",
        "is_healthy": True,
    },
    "late_leaf_spot": {
        "disease_id": 4,
        "disease_name": "Groundnut Late Leaf Spot",
        "scientific_name": "Phaeoisariopsis personata",
        "is_healthy": False,
    },
    "nutrition_deficiency": {
        "disease_id": 5,
        "disease_name": "Nutrition Deficiency",
        "scientific_name": "Nutritional Chlorosis",
        "is_healthy": False,
    },
    "rust": {
        "disease_id": 6,
        "disease_name": "Groundnut Rust",
        "scientific_name": "Puccinia arachidis Speg.",
        "is_healthy": False,
    },
}

IMG_SIZE = 224
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)

DEFAULT_DATA_DIR = Path.home() / "Downloads" / "GroundNutDataset" / "input_images"
SEED = 42
