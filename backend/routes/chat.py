from datetime import datetime

from flask import Blueprint, jsonify, request
from models.database import chat_history_collection, drugs_collection
from utils.gemini_client import GeminiClient

chat_bp = Blueprint("chat", __name__)
gemini = GeminiClient()


def find_mentioned_drug(query):
    """Find if any drug is mentioned in query"""
    drug_names = [drug["name"].lower() for drug in drugs_collection.find()]
    query_lower = query.lower()

    for drug_name in drug_names:
        if drug_name in query_lower:
            return drug_name
    return None


def get_drug_context(drug_name):
    """Get drug information for AI context"""
    drug = drugs_collection.find_one({"name": {"$regex": drug_name, "$options": "i"}})

    if not drug:
        return ""

    context = f"""
Drug Information:
- Name: {drug["name"]}
- Generic: {drug["generic_name"]}
- Status: {drug["government_status"]["status"]}

Safety Alerts:
{chr(10).join("- " + alert for alert in drug["safety_alerts"])}

Withdrawal Alerts:
{chr(10).join("- " + alert for alert in drug["withdrawal_alerts"])}

Side Effects:
{chr(10).join("- " + alert for alert in drug["adr_alerts"])}

Interactions: {", ".join(drug["interactions"])}
"""
    return context


@chat_bp.route("/chat", methods=["POST"])
def process_chat():
    """Process chat message with Gemini AI"""
    try:
        data = request.json
        user_message = data.get("message", "")
        user_id = data.get("user_id", "default_user")

        if not user_message:
            return jsonify({"success": False, "error": "Message is required"}), 400

        # Save user message to database
        chat_history_collection.insert_one(
            {
                "user_id": user_id,
                "message": user_message,
                "timestamp": datetime.utcnow(),
                "type": "user",
            }
        )

        # Get conversation history from database
        history = list(
            chat_history_collection.find(
                {"user_id": user_id}, {"_id": 0, "message": 1, "type": 1}
            )
            .sort("timestamp", -1)
            .limit(5)
        )

        history.reverse()

        # Build context from conversation history
        conversation_context = "\n".join(
            [
                f"{'User' if msg['type'] == 'user' else 'Assistant'}: {msg['message']}"
                for msg in history[:-1]
            ]
        )

        # Check for drug mentions
        mentioned_drug = find_mentioned_drug(user_message)
        drug_context = get_drug_context(mentioned_drug) if mentioned_drug else ""

        # System prompt for pharmaceutical assistant
        system_prompt = """You are PharmaCare AI, a knowledgeable pharmaceutical assistant.

Your responsibilities:
- Provide accurate, evidence-based medication information
- Explain drug interactions, side effects, and safety alerts clearly
- Always recommend consulting healthcare professionals for medical decisions
- Be empathetic and patient-focused
- Cite withdrawal alerts and government status when relevant

Important guidelines:
- This is educational information only, not medical advice
- Always encourage users to consult their doctor or pharmacist
- Be clear about drug safety concerns and contraindications
- Use simple, understandable language

Keep responses concise and focused on the user's question."""

        # Generate response using Gemini
        full_context = f"{drug_context}\n\nRecent conversation:\n{conversation_context}"
        response = gemini.generate(
            prompt=user_message, system_prompt=system_prompt, context=full_context
        )

        # Save bot response to database
        chat_history_collection.insert_one(
            {
                "user_id": user_id,
                "message": response,
                "timestamp": datetime.utcnow(),
                "type": "bot",
            }
        )

        return jsonify(
            {
                "success": True,
                "response": response,
                "timestamp": datetime.utcnow().isoformat(),
            }
        ), 200

    except Exception as e:
        return jsonify(
            {
                "success": False,
                "error": str(e),
                "response": "I apologize, but I encountered an error processing your request.",
            }
        ), 500


@chat_bp.route("/chat/history/<user_id>", methods=["GET"])
def get_chat_history(user_id):
    """Get chat history from database"""
    try:
        limit = request.args.get("limit", 50, type=int)

        history = list(
            chat_history_collection.find({"user_id": user_id}, {"_id": 0})
            .sort("timestamp", -1)
            .limit(limit)
        )

        history.reverse()

        return jsonify({"success": True, "history": history}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500