from flask import Blueprint, request, jsonify, session
from datetime import datetime
import requests
import re
from utils.ollama_client import OllamaClient
from models.database import drugs_collection, db
from models.user import save_chat

chat_bp = Blueprint('chat', __name__)

ollama_client = OllamaClient()

# Enhanced keyword detection
DRUG_KEYWORDS = ["drug", "medicine", "medication", "pill", "tablet", "capsule", "prescription", "dosage", "side effect", "interaction"]
HOSPITAL_KEYWORDS = ["hospital", "clinic", "doctor", "emergency", "medical center", "near me", "nearby", "find", "locate"]
SPECIALTY_KEYWORDS = {
    "orthopaedic": ["bone", "fracture", "joint", "orthopedic", "orthopaedic"],
    "gynaecology": ["pregnancy", "gynae", "women", "maternity", "obstetr"],
    "cardiology": ["heart", "cardiac", "chest pain", "blood pressure"],
    "dermatology": ["skin", "rash", "acne", "derma"],
}

def detect_intent(message):
    """Detect what the user is asking for"""
    msg_lower = message.lower()
    
    # Check for drug/medication queries
    if any(keyword in msg_lower for keyword in DRUG_KEYWORDS):
        return "drug_info"
    
    # Check for hospital/location queries
    if any(keyword in msg_lower for keyword in HOSPITAL_KEYWORDS):
        return "hospital_search"
    
    # Check for specific medical conditions
    conditions = ["diabetes", "asthma", "hypertension", "fever", "cold", "cough", "headache", "pain"]
    if any(condition in msg_lower for condition in conditions):
        return "medical_advice"
    
    return "general"

def extract_drug_name(message):
    """Try to extract drug name from message"""
    # Common patterns: "what is [drug]", "tell me about [drug]", "information on [drug]"
    patterns = [
        r"what (?:is|are) ([\w\s]+?)(?:\?|$| used| for)",
        r"tell me about ([\w\s]+?)(?:\?|$)",
        r"information (?:on|about) ([\w\s]+?)(?:\?|$)",
        r"([\w]+) (?:drug|medicine|medication|tablet|pill)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, message.lower())
        if match:
            drug_name = match.group(1).strip()
            if len(drug_name) > 2:  # Avoid single letters
                return drug_name
    return None

def search_drug_database(query):
    """Search our drug database"""
    try:
        # Search by name (case-insensitive)
        drug = drugs_collection.find_one(
            {"name": {"$regex": query, "$options": "i"}}
        )
        
        if drug:
            return drug
        
        # Try searching by generic name
        drug = drugs_collection.find_one(
            {"generic_name": {"$regex": query, "$options": "i"}}
        )
        
        return drug
    except Exception as e:
        print(f"Database search error: {e}")
        return None

def format_drug_info(drug):
    """Format drug information for display"""
    response = f"**{drug.get('name')}** ({drug.get('generic_name', 'N/A')})\n\n"
    
    # Government status
    status = drug.get('government_status', {})
    if status.get('status') in ['BANNED', 'RECALLED', 'BANNED/RECALLED']:
        response += f"⚠️ **WARNING: This drug is {status.get('status')}**\n"
        response += f"Reason: {status.get('notes', 'Contact authorities')}\n\n"
    else:
        response += f"✅ Status: {status.get('status', 'Approved')}\n\n"
    
    # Safety alerts
    if drug.get('safety_alerts'):
        response += "**Safety Alerts:**\n"
        for alert in drug.get('safety_alerts', []):
            response += f"- {alert}\n"
        response += "\n"
    
    # ADR (Adverse Drug Reactions)
    if drug.get('adr_alerts'):
        response += "**Possible Side Effects:**\n"
        for adr in drug.get('adr_alerts', []):
            response += f"- {adr}\n"
        response += "\n"
    
    # Timing
    if drug.get('timing'):
        response += f"**When to Take:** {', '.join(drug.get('timing', []))}\n\n"
    
    # Interactions
    if drug.get('interactions'):
        response += f"**Drug Interactions:** Avoid taking with {', '.join(drug.get('interactions', []))}\n\n"
    
    response += "⚠️ **Always consult your doctor before taking any medication.**"
    
    return response

def get_nearby_hospitals_info(lat, lon, specialty=None):
    """Get formatted hospital information"""
    response = f"🏥 **Finding hospitals near you...**\n\n"
    response += "I can show you nearby hospitals on our interactive map. "
    
    if specialty:
        response += f"Looking for {specialty} specialists.\n\n"
    
    response += "**Our Map Feature provides:**\n"
    response += "- Real-time locations with directions\n"
    response += "- Hospital details and contact info\n"
    response += "- Distance and estimated travel time\n"
    response += "- Verified medical facilities\n\n"
    response += "Click the 'Map' button above to explore hospitals visually!"
    
    return response

@chat_bp.route("/chat", methods=["POST"])
def process_chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        user_id = data.get("user_id", session.get("user_id", "default_user"))

        if not user_message:
            return jsonify({"success": False, "error": "No message provided"}), 400

        # Detect user intent
        intent = detect_intent(user_message)
        
        # Location (default Anand)
        lat = data.get("lat", 22.55)
        lon = data.get("lon", 72.95)

        # Handle different intents
        if intent == "drug_info":
            # Try to find drug in our database
            drug_name = extract_drug_name(user_message)
            
            if drug_name:
                drug_info = search_drug_database(drug_name)
                
                if drug_info:
                    # We have the drug in our database!
                    response_text = format_drug_info(drug_info)
                    
                    # Save chat
                    if user_id and user_id != "default_user":
                        try:
                            save_chat(user_id, user_message, response_text)
                        except Exception as e:
                            print(f"Failed to save chat: {e}")
                    
                    return jsonify({
                        "success": True,
                        "response": response_text,
                        "source": "database",
                        "timestamp": datetime.utcnow().isoformat()
                    })
        
        elif intent == "hospital_search":
            # User is looking for hospitals
            response_text = get_nearby_hospitals_info(lat, lon)
            
            if user_id and user_id != "default_user":
                try:
                    save_chat(user_id, user_message, response_text)
                except Exception as e:
                    print(f"Failed to save chat: {e}")
            
            return jsonify({
                "success": True,
                "response": response_text,
                "source": "location_service",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # For general medical questions, use AI with enhanced context
        # Build context from our database
        context = ""
        
        # Add drug database context if relevant
        if any(keyword in user_message.lower() for keyword in DRUG_KEYWORDS):
            banned_drugs = list(drugs_collection.find(
                {"government_status.status": {"$in": ["BANNED", "RECALLED", "BANNED/RECALLED"]}},
                {"name": 1, "government_status": 1}
            ).limit(5))
            
            if banned_drugs:
                context += "\n\nImportant: These drugs are currently banned/recalled: "
                context += ", ".join([d.get("name") for d in banned_drugs])
        
        # Enhanced system prompt
        system_prompt = """You are Lifexia, an intelligent AI health assistant with access to a comprehensive drug database.

Your capabilities:
1. Provide accurate information about medications, their uses, side effects, and interactions
2. Warn users about banned or recalled drugs
3. Offer general health guidance (but always recommend consulting a doctor)
4. Help users find nearby medical facilities

Guidelines:
- Be concise and clear
- Use bullet points for lists
- Always end medical advice with "Consult a healthcare professional"
- If asked about drug availability, suggest checking the Map feature
- For emergencies, emphasize calling emergency services (108 in India)
- Never diagnose or prescribe medications"""

        # Generate AI response
        response_text = ollama_client.generate(
            prompt=user_message,
            system_prompt=system_prompt,
            context=context
        )

        # Save chat
        if user_id and user_id != "default_user":
            try:
                save_chat(user_id, user_message, response_text)
            except Exception as e:
                print(f"Failed to save chat: {e}")

        return jsonify({
            "success": True,
            "response": response_text,
            "source": "ai",
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@chat_bp.route("/history", methods=["GET"])
def get_history():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"}), 401
    
    try:
        from models.user import get_user_chats
        chats = get_user_chats(user_id)
        return jsonify({"success": True, "chats": chats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500