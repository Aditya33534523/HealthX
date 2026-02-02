from flask import Blueprint, request, jsonify, session
from twilio.rest import Client
from config import Config

broadcast_bp = Blueprint('broadcast', __name__)

@broadcast_bp.route("/broadcast", methods=["POST"])
def send_broadcast():
    if not session.get("is_admin"):
        return jsonify({"success": False, "error": "Admins only"}), 403

    data = request.json
    message = data.get("message")
    source = data.get("source", "Unknown source")

    if not message:
        return jsonify({"success": False, "error": "Message required"}), 400

    client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

    try:
        client.messages.create(
            from_=Config.TWILIO_WHATSAPP_FROM,
            body=f"[ALERT] {message}\nSource: {source}\nDo NOT take action without consulting doctor.",
            to=Config.TEST_WHATSAPP_TO
        )
        return jsonify({"success": True, "sent_to": Config.TEST_WHATSAPP_TO})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500