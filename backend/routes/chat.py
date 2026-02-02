from flask import Blueprint, request, jsonify, session
from datetime import datetime
import requests
import re
from utils.ollama_client import OllamaClient
from models.database import db  # <-- FIXED: use your actual DB file
from models.user import save_chat  # <-- if you have chat saving

chat_bp = Blueprint('chat', __name__)

ollama_client = OllamaClient()

@chat_bp.route("/chat", methods=["POST"])
def process_chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        user_id = data.get("user_id", session.get("user_id", "default_user"))

        if not user_message:
            return jsonify({"success": False, "error": "No message provided"}), 400

        # Location (default Anand)
        lat = data.get("lat", 22.55)
        lon = data.get("lon", 72.95)

        # Urgent keywords
        urgent_keywords = ["urgent", "emergency", "hospital", "treatment", "doctor", "pain", "chest", "bleeding", "attack", "fever", "injury"]
        is_urgent = any(word in user_message.lower() for word in urgent_keywords)

        extra_info = ""
        if is_urgent:
            try:
                search_url = f"https://nominatim.openstreetmap.org/search?format=json&limit=5&q=hospital+medical&lat={lat}&lon={lon}&zoom=14"
                headers = {"User-Agent": "Lifexia/1.0"}
                resp = requests.get(search_url, headers=headers, timeout=10)
                places = resp.json()
                if places:
                    extra_info = "\n\n**Nearby hospitals (your location):**\n"
                    for p in places:
                        name = p.get("display_name", "Unknown").split(",")[0]
                        dist = round(float(p.get("dist", 999999)) / 1000, 1)
                        extra_info += f"- {name} (~{dist} km)\n"
                    extra_info += "\nCall 108 immediately for emergencies!"
                else:
                    extra_info = "\n\nNo nearby hospitals found."
            except Exception as e:
                extra_info = "\n\nCould not load hospitals (try again later)."

        # Generate response
        response_text = ollama_client.generate(
            prompt=user_message,
            system_prompt="You are Lifexia – an accurate health and drug information assistant. "
                          "Never give medical advice. Always recommend consulting a doctor.",
            context=extra_info
        )

        # Save chat (if logged in)
        if user_id and user_id != "default_user":
            try:
                save_chat(user_id, user_message, response_text)
            except Exception as e:
                print(f"Failed to save chat: {e}")

        return jsonify({
            "success": True,
            "response": response_text,
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