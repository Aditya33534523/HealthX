from datetime import datetime
from models.database import drugs_collection, db
from models.user import create_user
from models.log import subscribe_user
from config import Config


def initialize_drug_database():
    """Initialize database with comprehensive drug data"""
    if drugs_collection.count_documents({}) == 0:
        sample_drugs = [
            # Common Pain Relievers
            {
                "name": "Aspirin",
                "generic_name": "Acetylsalicylic Acid",
                "category": "Pain Reliever / Antiplatelet",
                "uses": "Pain relief, fever reduction, heart attack prevention",
                "withdrawal_alerts": [
                    "Risk of bleeding if stopped abruptly in cardiac patients",
                    "Consult physician before discontinuation",
                ],
                "safety_alerts": [
                    "Avoid in children under 12 due to Reye's syndrome risk",
                    "Use with caution in patients with ulcers",
                    "Can cause stomach bleeding with prolonged use"
                ],
                "adr_alerts": [
                    "Common: Stomach upset, heartburn, nausea",
                    "Serious: GI bleeding, allergic reactions, tinnitus",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "No restrictions",
                },
                "timing": ["Morning with food", "After meals"],
                "interactions": ["Warfarin", "Ibuprofen", "Alcohol"],
                "dosage": "Adults: 325-650mg every 4-6 hours",
                "created_at": datetime.utcnow(),
            },
            {
                "name": "Paracetamol",
                "generic_name": "Acetaminophen",
                "category": "Pain Reliever / Fever Reducer",
                "uses": "Mild to moderate pain, fever reduction",
                "withdrawal_alerts": [
                    "No withdrawal symptoms",
                    "Can stop immediately if needed"
                ],
                "safety_alerts": [
                    "Do not exceed 4000mg per day",
                    "Liver damage risk with overdose",
                    "Avoid alcohol while taking"
                ],
                "adr_alerts": [
                    "Common: Generally well-tolerated",
                    "Serious: Liver damage (with overdose), severe skin reactions",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "Available OTC",
                },
                "timing": ["Every 4-6 hours as needed", "Can take with or without food"],
                "interactions": ["Warfarin", "Alcohol", "Other acetaminophen products"],
                "dosage": "Adults: 500-1000mg every 4-6 hours (max 4000mg/day)",
                "created_at": datetime.utcnow(),
            },
            
            # Diabetes Medications
            {
                "name": "Metformin",
                "generic_name": "Metformin Hydrochloride",
                "category": "Antidiabetic",
                "uses": "Type 2 diabetes management",
                "withdrawal_alerts": [
                    "Gradual tapering recommended",
                    "Monitor blood glucose levels closely",
                ],
                "safety_alerts": [
                    "Monitor kidney function regularly",
                    "Risk of lactic acidosis (rare but serious)",
                    "Stop before surgery or imaging with contrast dye"
                ],
                "adr_alerts": [
                    "Common: Nausea, diarrhea, stomach upset, metallic taste",
                    "Rare: Lactic acidosis, vitamin B12 deficiency",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "First-line for Type 2 Diabetes",
                },
                "timing": ["Morning with meal", "Evening with meal"],
                "interactions": ["Contrast dye", "Alcohol", "Cimetidine"],
                "dosage": "Starting: 500mg twice daily, Max: 2000-2500mg/day",
                "created_at": datetime.utcnow(),
            },
            
            # Antibiotics
            {
                "name": "Amoxicillin",
                "generic_name": "Amoxicillin",
                "category": "Antibiotic (Penicillin)",
                "uses": "Bacterial infections (respiratory, ear, skin, UTI)",
                "withdrawal_alerts": [
                    "Complete full course even if feeling better",
                    "Do not stop early"
                ],
                "safety_alerts": [
                    "Tell doctor if allergic to penicillin",
                    "May reduce effectiveness of birth control pills",
                    "Can cause diarrhea"
                ],
                "adr_alerts": [
                    "Common: Diarrhea, nausea, rash",
                    "Serious: Severe allergic reaction (anaphylaxis), C. difficile infection",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "Prescription only",
                },
                "timing": ["Every 8-12 hours", "Can take with or without food"],
                "interactions": ["Birth control pills", "Warfarin", "Methotrexate"],
                "dosage": "Adults: 250-500mg every 8 hours OR 500-875mg every 12 hours",
                "created_at": datetime.utcnow(),
            },
            
            # Blood Pressure
            {
                "name": "Amlodipine",
                "generic_name": "Amlodipine Besylate",
                "category": "Calcium Channel Blocker",
                "uses": "High blood pressure, chest pain (angina)",
                "withdrawal_alerts": [
                    "Do not stop suddenly",
                    "Gradual tapering required",
                    "Risk of rebound hypertension"
                ],
                "safety_alerts": [
                    "May cause swelling in ankles/feet",
                    "Avoid grapefruit juice",
                    "Monitor blood pressure regularly"
                ],
                "adr_alerts": [
                    "Common: Swelling (edema), dizziness, flushing, fatigue",
                    "Serious: Severe hypotension, heart palpitations",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "Prescription only",
                },
                "timing": ["Once daily, same time each day"],
                "interactions": ["Grapefruit juice", "Simvastatin", "Sildenafil"],
                "dosage": "Starting: 5mg once daily, Max: 10mg once daily",
                "created_at": datetime.utcnow(),
            },
            
            # BANNED DRUG
            {
                "name": "Ranitidine",
                "generic_name": "Ranitidine Hydrochloride",
                "category": "H2 Blocker (Antacid)",
                "uses": "Heartburn, acid reflux, ulcers (DISCONTINUED)",
                "withdrawal_alerts": [
                    "DO NOT USE - Product recalled",
                    "Alternative H2 blockers available (famotidine)"
                ],
                "safety_alerts": [
                    "⚠️ RECALLED by FDA in 2020",
                    "Do not use any remaining stock",
                    "Contains cancer-causing impurity (NDMA)"
                ],
                "adr_alerts": [
                    "Common: Headache, constipation, diarrhea",
                    "Rare: Liver problems",
                    "CARCINOGENIC RISK from NDMA contamination"
                ],
                "government_status": {
                    "status": "BANNED/RECALLED",
                    "agency": "FDA",
                    "notes": "Market withdrawal due to NDMA contamination (April 2020)",
                    "date_banned": "2020-04-01",
                },
                "timing": ["DO NOT USE - RECALLED"],
                "interactions": ["Ketoconazole", "Warfarin"],
                "dosage": "NOT APPLICABLE - BANNED",
                "created_at": datetime.utcnow(),
            },
            
            # Antihistamine
            {
                "name": "Cetirizine",
                "generic_name": "Cetirizine Hydrochloride",
                "category": "Antihistamine",
                "uses": "Allergies, hay fever, hives, itching",
                "withdrawal_alerts": [
                    "Can stop immediately",
                    "No withdrawal effects"
                ],
                "safety_alerts": [
                    "May cause drowsiness",
                    "Avoid driving if drowsy",
                    "Use caution with alcohol"
                ],
                "adr_alerts": [
                    "Common: Drowsiness, dry mouth, fatigue",
                    "Rare: Severe allergic reaction",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "Available OTC",
                },
                "timing": ["Once daily, evening preferred"],
                "interactions": ["Alcohol", "CNS depressants"],
                "dosage": "Adults: 10mg once daily",
                "created_at": datetime.utcnow(),
            },
            
            # Cholesterol
            {
                "name": "Atorvastatin",
                "generic_name": "Atorvastatin Calcium",
                "category": "Statin (Cholesterol)",
                "uses": "High cholesterol, cardiovascular disease prevention",
                "withdrawal_alerts": [
                    "Consult doctor before stopping",
                    "Cholesterol may increase if stopped"
                ],
                "safety_alerts": [
                    "Monitor liver function",
                    "Report muscle pain immediately",
                    "Avoid grapefruit juice"
                ],
                "adr_alerts": [
                    "Common: Muscle pain, joint pain, diarrhea",
                    "Serious: Rhabdomyolysis (muscle breakdown), liver damage",
                ],
                "government_status": {
                    "status": "Approved",
                    "agency": "FDA",
                    "notes": "Prescription only",
                },
                "timing": ["Once daily, evening preferred"],
                "interactions": ["Grapefruit juice", "Gemfibrozil", "Cyclosporine"],
                "dosage": "Starting: 10-20mg once daily, Max: 80mg once daily",
                "created_at": datetime.utcnow(),
            },
        ]
        
        drugs_collection.insert_many(sample_drugs)
        print(f"✅ {len(sample_drugs)} drugs inserted into database!")
    else:
        print("ℹ️  Drug database already initialized")

    # Initialize Admin User
    if not db.users.find_one({"is_admin": True}):
        create_user("admin@lifexia.local", "admin123", is_admin=True)
        print("✅ Admin user created: admin@lifexia.local / admin123")
    else:
        print("ℹ️  Admin user already exists")

    # Auto-subscribe test number if provided
    if Config.TEST_WHATSAPP_TO:
        subscribe_user(Config.TEST_WHATSAPP_TO)
        print(f"✅ Test number {Config.TEST_WHATSAPP_TO} auto-subscribed for broadcasting")