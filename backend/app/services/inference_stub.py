import random
from typing import Any, Dict


class ModelInferenceStub:
    """
    Mock / Stub ML Inference Engine.
    Simulates real-time PyTorch model output (disease classification + confidence score + bounding box coordinates)
    without running actual CUDA PyTorch model forward pass.
    """

    CANDIDATE_DISEASES = [
        {
            "disease_id": "TOMATO_LATE_BLIGHT",
            "disease_name": "Tomato Late Blight",
            "plant_species": "Tomato (Solanum lycopersicum)",
            "scientific_name": "Phytophthora infestans",
            "confidence_score": 0.94,
            "bounding_box": {
                "x_min": 0.15,
                "y_min": 0.20,
                "x_max": 0.82,
                "y_max": 0.78,
            },
        },
        {
            "disease_id": "POTATO_EARLY_BLIGHT",
            "disease_name": "Potato Early Blight",
            "plant_species": "Potato (Solanum tuberosum)",
            "scientific_name": "Alternaria solani",
            "confidence_score": 0.89,
            "bounding_box": {
                "x_min": 0.10,
                "y_min": 0.15,
                "x_max": 0.75,
                "y_max": 0.85,
            },
        },
        {
            "disease_id": "APPLE_SCAB",
            "disease_name": "Apple Scab",
            "plant_species": "Apple (Malus domestica)",
            "scientific_name": "Venturia inaequalis",
            "confidence_score": 0.91,
            "bounding_box": {
                "x_min": 0.25,
                "y_min": 0.30,
                "x_max": 0.70,
                "y_max": 0.65,
            },
        },
        {
            "disease_id": "GRAPE_BLACK_ROT",
            "disease_name": "Grape Black Rot",
            "plant_species": "Grape (Vitis vinifera)",
            "scientific_name": "Guignardia bidwellii",
            "confidence_score": 0.87,
            "bounding_box": {
                "x_min": 0.18,
                "y_min": 0.22,
                "x_max": 0.80,
                "y_max": 0.75,
            },
        },
        {
            "disease_id": "HEALTHY_LEAF",
            "disease_name": "Healthy Plant Leaf",
            "plant_species": "General Crop",
            "scientific_name": "N/A",
            "confidence_score": 0.98,
            "bounding_box": {
                "x_min": 0.05,
                "y_min": 0.05,
                "x_max": 0.95,
                "y_max": 0.95,
            },
        },
    ]

    def run_inference(self, image_bytes: bytes) -> dict[str, Any]:
        """
        Runs mock inference on raw image bytes.
        """
        # Deterministic or mock choice based on bytes length / pseudo-random
        index = len(image_bytes) % len(self.CANDIDATE_DISEASES)
        result = self.CANDIDATE_DISEASES[index].copy()

        # Add slight score variation
        result["confidence_score"] = round(
            min(
                0.99,
                max(0.80, result["confidence_score"] + random.uniform(-0.03, 0.03)),
            ),
            2,
        )
        return result


inference_stub = ModelInferenceStub()
