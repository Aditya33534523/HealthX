from datetime import datetime

from models.database import drugs_collection


def initialize_drug_database():
    """Initialize database with sample drug data"""
    if drugs_collection.count_documents({}) == 0:
        sample_drugs = [
            {
                "name": "Aspirin",
                "generic_name": "Acetylsalicylic Acid",
                "withdrawal_alerts": [
                    "Risk of bleeding if stopped abruptly in cardiac patients",
                    "Consult physician before discontinuation",
                ],
                "safety_alerts": [
                    "Avoid in children under 12 due to Reye's syndrome risk",
                    "Use with caution in patients with ulcers",
                ],
                "adr_alerts": [
                    "Common: Stomach upset, heartburn",
                    "Serious: GI bleeding, allergic reactions",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "No restrictions",
                },
                "timing": ["Morning with food"],
                "interactions": ["Warfarin", "Ibuprofen"],
                "created_at": datetime.utcnow(),
            },
            {
                "name": "Metformin",
                "generic_name": "Metformin Hydrochloride",
                "withdrawal_alerts": [
                    "Gradual tapering recommended",
                    "Monitor blood glucose levels",
                ],
                "safety_alerts": [
                    "Monitor kidney function regularly",
                    "Risk of lactic acidosis",
                ],
                "adr_alerts": ["Common: Nausea, diarrhea", "Rare: Lactic acidosis"],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "First-line for Type 2 Diabetes",
                },
                "timing": ["Morning with meal", "Evening with meal"],
                "interactions": ["Contrast dye", "Alcohol"],
                "created_at": datetime.utcnow(),
            },
            {
                "name": "Ranitidine",
                "generic_name": "Ranitidine Hydrochloride",
                "withdrawal_alerts": ["Alternative H2 blockers available"],
                "safety_alerts": [
                    "⚠️ RECALLED by FDA in 2020",
                    "Do not use any remaining stock",
                ],
                "adr_alerts": [
                    "Common: Headache, constipation",
                    "Rare: Liver problems",
                ],
                "government_status": {
                    "status": "BANNED/RECALLED",
                    "agency": "FDA",
                    "notes": "Market withdrawal due to NDMA (April 2020)",
                    "date_banned": "2020-04-01",
                },
                "timing": ["Evening before bedtime"],
                "interactions": ["Ketoconazole"],
                "created_at": datetime.utcnow(),
            },
        ]
        drugs_collection.insert_many(sample_drugs)
        print("✅ Sample drug data inserted!")
    else:
        print("ℹ️  Drug database already initialized")
