import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, SessionLocal, engine
from app.models import Disease, Remedy


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Disease).count() > 0:
            print("Database already contains disease data. Skipping seeding.")
            return

        diseases_data = [
            {
                "id": "TOMATO_LATE_BLIGHT",
                "plant_species": "Tomato (Solanum lycopersicum)",
                "disease_name": "Tomato Late Blight",
                "scientific_name": "Phytophthora infestans",
                "severity_level": "HIGH",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Copper Spray & Bacillus subtilis",
                        "description": "Apply organic copper-based fungicide or bio-fungicide containing Bacillus subtilis to infected foliage.",
                        "application_instructions": "Spray every 7-10 days early in the morning. Ensure thorough coverage under leaves.",
                        "category": "Organic / Biological",
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Mancozeb or Chlorothalonil Protectant",
                        "description": "Apply broad-spectrum synthetic protectant fungicides to halt water-mold fungal progression.",
                        "application_instructions": "Apply 2g/L water during high moisture or early infection signs.",
                        "category": "Chemical / Fungicide",
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Pruning & Overhead Irrigation Avoidance",
                        "description": "Prune lower leaves touching soil and switch from overhead sprinklers to drip irrigation to keep leaves dry.",
                        "application_instructions": "Destroy infected plant leaves immediately; do not compost.",
                        "category": "Preventive Cultural Practice",
                    },
                ],
            },
            {
                "id": "POTATO_EARLY_BLIGHT",
                "plant_species": "Potato (Solanum tuberosum)",
                "disease_name": "Potato Early Blight",
                "scientific_name": "Alternaria solani",
                "severity_level": "MEDIUM",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Neem Oil Extract Spray",
                        "description": "Foliar application of cold-pressed organic neem oil to inhibit fungal spore germination.",
                        "application_instructions": "Mix 5ml neem oil with 1L water and 1ml mild soap. Spray weekly.",
                        "category": "Organic / Biological",
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Azoxystrobin or Copper Hydroxide",
                        "description": "Systemic strobilurin fungicide application for targeted Alternaria control.",
                        "application_instructions": "Apply at first notice of concentric bullseye spots on lower leaves.",
                        "category": "Chemical / Fungicide",
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Crop Rotation & Staking",
                        "description": "Rotate nightshade crops on a 3-year cycle and maintain adequate nitrogen nutrition.",
                        "application_instructions": "Remove crop debris post-harvest.",
                        "category": "Preventive Cultural Practice",
                    },
                ],
            },
            {
                "id": "APPLE_SCAB",
                "plant_species": "Apple (Malus domestica)",
                "disease_name": "Apple Scab",
                "scientific_name": "Venturia inaequalis",
                "severity_level": "MEDIUM",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Sulfur Wettable Powder",
                        "description": "Organic elemental sulfur spray before rain events during green tip stage.",
                        "application_instructions": "Apply prior to predicted rain during spring leaf emergence.",
                        "category": "Organic / Biological",
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Myclobutanil or Captan Fungicide",
                        "description": "Fungicide spray for scab control on apple blossoms and leaves.",
                        "application_instructions": "Spray according to tree growth stage guidelines.",
                        "category": "Chemical / Fungicide",
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Leaf Litter Sanitation",
                        "description": "Rake and burn or deeply bury fallen autumn leaves to eliminate overwintering fungal ascocarps.",
                        "application_instructions": "Perform leaf removal in late autumn.",
                        "category": "Preventive Cultural Practice",
                    },
                ],
            },
            {
                "id": "GRAPE_BLACK_ROT",
                "plant_species": "Grape (Vitis vinifera)",
                "disease_name": "Grape Black Rot",
                "scientific_name": "Guignardia bidwellii",
                "severity_level": "HIGH",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Bordeaux Mixture Application",
                        "description": "Traditional organic copper sulfate and slaked lime spray for fruit cluster protection.",
                        "application_instructions": "Spray early before fruit set.",
                        "category": "Organic / Biological",
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Tebuconazole or Difenoconazole",
                        "description": "Triazole systemic fungicide for curatively suppressing black rot lesions.",
                        "application_instructions": "Apply from pre-bloom to 4 weeks post-bloom.",
                        "category": "Chemical / Fungicide",
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Mummified Fruit Removal & Canopy Management",
                        "description": "Remove dried mummified grapes from vines during winter pruning and open canopy for sunlight.",
                        "application_instructions": "Prune excess shoots to maximize airflow.",
                        "category": "Preventive Cultural Practice",
                    },
                ],
            },
            {
                "id": "HEALTHY_LEAF",
                "plant_species": "General Crop",
                "disease_name": "Healthy Plant Leaf",
                "scientific_name": "N/A",
                "severity_level": "NONE",
                "remedies": [
                    {
                        "remedy_type": "Cultural",
                        "title": "Balanced Plant Nutrition & Watering",
                        "description": "Maintain balanced N-P-K fertilization, appropriate soil pH, and adequate soil moisture.",
                        "application_instructions": "Monitor weekly for early stress signs.",
                        "category": "Preventive Cultural Practice",
                    }
                ],
            },
        ]

        for d_data in diseases_data:
            remedies = d_data.pop("remedies")
            disease = Disease(**d_data)
            db.add(disease)
            db.flush()

            for r_data in remedies:
                remedy = Remedy(disease_id=disease.id, **r_data)
                db.add(remedy)

        db.commit()
        print(
            "Database successfully seeded with plant diseases and treatment remedies!"
        )
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
