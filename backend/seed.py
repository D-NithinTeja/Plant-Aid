import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Disease, Remedy

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Full catalogue: 6 Groundnut classes (audited in plan.md / Implementation.md)
        # plus demo crop classes for general leaf compatibility
        diseases_data = [
            # ==========================================
            # GROUNDNUT DISEASE CATALOGUE (6 CLASSES)
            # ==========================================
            {
                "id": "early_leaf_spot",
                "numeric_id": 1,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Groundnut Early Leaf Spot",
                "scientific_name": "Cercospora arachidicola",
                "severity_level": "HIGH",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Neem Seed Kernel Extract & Trichoderma",
                        "description": "Foliar application of 5% cold-pressed Neem Seed Kernel Extract (NSKE) or bio-fungicide formulation containing Trichoderma viride to suppress Cercospora sporulation.",
                        "application_instructions": "Spray 50ml NSKE per 10L water every 10-12 days during warm, humid conditions. Ensure complete coverage of both leaf surfaces.",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Mancozeb 75% WP or Chlorothalonil 75% WP",
                        "description": "Protective contact fungicide to prevent secondary spread of circular reddish-brown leaf spots with bright yellow halos.",
                        "application_instructions": "Dissolve 2g Mancozeb per liter of water (approx. 400g/acre). Begin spraying at 30-35 days after sowing (DAS) or at first spot symptom appearance. Reapply after 14 days if wet weather persists.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Crop Rotation & Spacing Aeration",
                        "description": "Implement a 3-year crop rotation with non-legume crops (maize, pearl millet, or sorghum). Maintain standard 30x10 cm row-to-plant spacing to maximize canopy air circulation and reduce leaf wetness duration.",
                        "application_instructions": "Collect and destroy (burn or deep bury) all post-harvest infected haulms and haulm residue to break the overwintering ascospore cycle.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "early_rust",
                "numeric_id": 2,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Groundnut Early Rust",
                "scientific_name": "Puccinia arachidis Speg.",
                "severity_level": "MEDIUM",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Bacillus subtilis Bio-Protective Spray",
                        "description": "Application of Bacillus subtilis or fermented plant extract (garlic bulb extract 2%) to reduce urediniospore germination on lower leaves.",
                        "application_instructions": "Mix 5g/L bio-fungicide powder in clean water. Spray early in the morning when relative humidity is elevated.",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Hexaconazole 5% EC or Tebuconazole 25.9% EC",
                        "description": "Triazole systemic curative fungicide to suppress developing pustules before widespread chlorosis occurs.",
                        "application_instructions": "Mix 2ml Hexaconazole per liter of water. Apply at the initial appearance of scattered dark brown speckles on lower leaf surfaces.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Early Synchronized Sowing & Volunteer Plant Removal",
                        "description": "Sow early with the onset of monsoon rains to escape peak rust spore release. Destroy self-sown/volunteer groundnut plants that act as continuous green bridges between seasons.",
                        "application_instructions": "Survey field borders weekly; eliminate collateral weed hosts (e.g., wild Arachis species) within 50 meters of the field perimeter.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "healthy_leaf",
                "numeric_id": 3,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Healthy Leaf",
                "scientific_name": "Arachis hypogaea L.",
                "severity_level": "NONE",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Rhizobium Bio-Fertilizer & Mycorrhizae",
                        "description": "Maintain robust root nodules and nutrient uptake using Rhizobium leguminosarum seed inoculants and vesicular arbuscular mycorrhiza (VAM).",
                        "application_instructions": "Inoculate seeds prior to planting; periodic soil drenching with liquid bio-fertilizer enhances natural systemic acquired resistance (SAR).",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Gypsum Application & Balanced NPK Nutrition",
                        "description": "Provide balanced fertilizer (20 kg N : 40 kg P2O5 : 40 kg K2O per hectare) and apply Gypsum at 400 kg/ha at flowering/pegging stage (40-45 DAS) for strong pod and foliage cell wall integrity.",
                        "application_instructions": "Maintain regular weekly crop scouting; avoid drought stress during peg penetration and pod filling stages.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "late_leaf_spot",
                "numeric_id": 4,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Groundnut Late Leaf Spot",
                "scientific_name": "Phaeoisariopsis personata",
                "severity_level": "SEVERE",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Copper Oxychloride & Fermented Whey",
                        "description": "Organic copper-based foliar application combined with fermented cow urine/buttermilk spray to inhibit fungal conidial development on the abaxial leaf surface.",
                        "application_instructions": "Apply Copper Oxychloride 50% WP at 2.5g/L water in rotation with bio-agents at 10-day intervals.",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Carbendazim 12% + Mancozeb 63% WP (Saaf)",
                        "description": "Synergistic systemic and contact combination fungicide to arrest dark, carbon-black cushion-like spots that cause premature defoliation.",
                        "application_instructions": "Dissolve 2g per liter of water (500g in 250L water per acre). Ensure thorough lower-canopy penetration where late leaf spot initiates.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Deep Summer Plowing & Intercropping",
                        "description": "Deep summer plowing (25-30 cm) to bury infected plant debris and fungal sclerotia. Intercrop groundnut with pigeonpea or pearl millet in 4:1 or 6:1 ratios to create physical spore barriers.",
                        "application_instructions": "Avoid flood or overhead sprinkler irrigation in the late afternoon; use furrow or drip irrigation to keep canopy dry overnight.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "nutrition_deficiency",
                "numeric_id": 5,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Nutrition Deficiency",
                "scientific_name": "Nutritional Chlorosis (Fe / Zn / N)",
                "severity_level": "MEDIUM",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Farm Yard Manure & Enriched Compost",
                        "description": "Application of 10-12 tonnes/hectare of well-rotted FYM or vermicompost enriched with micronutrient-solubilizing bacteria (MSB).",
                        "application_instructions": "Incorporate compost into topsoil during field preparation to buffer soil pH and enhance micronutrient availability in calcareous soils.",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Ferrous Sulphate & Zinc Micronutrient Foliar Spray",
                        "description": "Corrective foliar nutrition for iron chlorosis (interveinal yellowing of young leaves) and zinc deficiency.",
                        "application_instructions": "Dissolve 5g Ferrous Sulphate (FeSO4) + 1g Citric Acid per liter of water for iron chlorosis. For zinc deficiency, spray 2g Zinc Sulphate (ZnSO4) per liter of water. Spray twice at 10-day intervals.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Soil pH Management & Aeration Cultivation",
                        "description": "Conduct comprehensive soil test; avoid high alkaline or water-logged soil conditions which induce iron lock-up. Perform light inter-cultivation to aerate the root zone.",
                        "application_instructions": "Apply agricultural sulfur (20-30 kg/ha) if soil pH is above 8.0 to facilitate iron and zinc availability.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "rust",
                "numeric_id": 6,
                "plant_species": "Groundnut (Arachis hypogaea)",
                "disease_name": "Groundnut Rust",
                "scientific_name": "Puccinia arachidis Speg.",
                "severity_level": "HIGH",
                "remedies": [
                    {
                        "remedy_type": "Biological",
                        "title": "Wettable Sulfur & Botanical Extracts",
                        "description": "Fine elemental wettable sulfur (80% WP) or 5% neem leaf extract spray creating a protective surface barrier against rust urediniospores.",
                        "application_instructions": "Mix 3g/L wettable sulfur in water. Spray at 10-14 day intervals before severe pustule explosion occurs.",
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Difenoconazole 25% EC or Propiconazole 25% EC",
                        "description": "Highly effective systemic triazole fungicide providing both protective and strong curative kickback action against orange-brown blistered pustules.",
                        "application_instructions": "Apply 1ml per liter of water at first symptom visibility. A second spray 15 days later provides complete canopy protection through pod maturity.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Cultivar Resistance & Strict Field Sanitation",
                        "description": "Grow recognized rust-resistant/tolerant cultivars (such as ICGV 86590, Kadiri-6, or Girnar-3). Keep the field and surroundings weed-free.",
                        "application_instructions": "Ensure rapid drainage of standing water after heavy rains. Never leave crop residues exposed on field margins after harvest.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            # ==========================================
            # ADDITIONAL GENERAL DEMO CLASSES
            # ==========================================
            {
                "id": "TOMATO_LATE_BLIGHT",
                "numeric_id": 101,
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
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Mancozeb or Chlorothalonil Protectant",
                        "description": "Apply broad-spectrum synthetic protectant fungicides to halt water-mold fungal progression.",
                        "application_instructions": "Apply 2g/L water during high moisture or early infection signs.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Pruning & Overhead Irrigation Avoidance",
                        "description": "Prune lower leaves touching soil and switch from overhead sprinklers to drip irrigation to keep leaves dry.",
                        "application_instructions": "Destroy infected plant leaves immediately; do not compost.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "POTATO_EARLY_BLIGHT",
                "numeric_id": 102,
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
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Azoxystrobin or Copper Hydroxide",
                        "description": "Systemic strobilurin fungicide application for targeted Alternaria control.",
                        "application_instructions": "Apply at first notice of concentric bullseye spots on lower leaves.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Crop Rotation & Staking",
                        "description": "Rotate nightshade crops on a 3-year cycle and maintain adequate nitrogen nutrition.",
                        "application_instructions": "Remove crop debris post-harvest.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "APPLE_SCAB",
                "numeric_id": 103,
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
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Myclobutanil or Captan Fungicide",
                        "description": "Fungicide spray for scab control on apple blossoms and leaves.",
                        "application_instructions": "Spray according to tree growth stage guidelines.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Leaf Litter Sanitation",
                        "description": "Rake and burn or deeply bury fallen autumn leaves to eliminate overwintering fungal ascocarps.",
                        "application_instructions": "Perform leaf removal in late autumn.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            },
            {
                "id": "GRAPE_BLACK_ROT",
                "numeric_id": 104,
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
                        "category": "Organic / Biological"
                    },
                    {
                        "remedy_type": "Chemical",
                        "title": "Tebuconazole or Difenoconazole",
                        "description": "Triazole systemic fungicide for curatively suppressing black rot lesions.",
                        "application_instructions": "Apply from pre-bloom to 4 weeks post-bloom.",
                        "category": "Chemical / Fungicide"
                    },
                    {
                        "remedy_type": "Cultural",
                        "title": "Mummified Fruit Removal & Canopy Management",
                        "description": "Remove dried mummified grapes from vines during winter pruning and open canopy for sunlight.",
                        "application_instructions": "Prune excess shoots to maximize airflow.",
                        "category": "Preventive Cultural Practice"
                    }
                ]
            }
        ]

        force_reset = "--force" in sys.argv or "--reset" in sys.argv

        # Insert or update records
        for d_data in diseases_data:
            remedies = d_data.pop("remedies")
            disease_id = d_data["id"]

            disease = db.query(Disease).filter(Disease.id == disease_id).first()
            if not disease:
                disease = Disease(**d_data)
                db.add(disease)
                db.flush()
            else:
                for k, v in d_data.items():
                    setattr(disease, k, v)
                db.flush()

            # Clean and re-add if explicit reset, otherwise idempotently insert missing remedies
            if force_reset:
                db.query(Remedy).filter(Remedy.disease_id == disease_id).delete()
                for r_data in remedies:
                    remedy = Remedy(disease_id=disease.id, **r_data)
                    db.add(remedy)
            else:
                existing_titles = {
                    r[0] for r in db.query(Remedy.title).filter(Remedy.disease_id == disease_id).all()
                }
                for r_data in remedies:
                    if r_data["title"] not in existing_titles:
                        remedy = Remedy(disease_id=disease.id, **r_data)
                        db.add(remedy)

        db.commit()
        print(f"Database successfully seeded with {len(diseases_data)} plant diseases and treatment remedies!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
