from flask import Blueprint, request, jsonify, session
from utils.whatsapp_service import WhatsAppService
from models.log import get_subscribers, get_unique_senders_count
from config import Config

broadcast_bp = Blueprint('broadcast', __name__)

@broadcast_bp.route("/broadcast/stats", methods=["GET"])
def get_broadcast_stats():
    """Get stats for broadcasting (Admin only)"""
    if not session.get("is_admin"):
        return jsonify({"success": False, "error": "Unauthorized"}), 403
    
    count = get_unique_senders_count()
    return jsonify({"success": True, "subscriber_count": count})

@broadcast_bp.route("/broadcast", methods=["POST"])
def send_broadcast():
    return jsonify({"success": False, "error": "LIFEXIA_VERSION_2_ACTIVE"}), 500
    if not session.get("is_admin"):
        return jsonify({"success": False, "error": "Admins only"}), 403

    data = request.json
    message = data.get("message")
    source = data.get("source", "Lifexia Safety Team")

    if not message:
        return jsonify({"success": False, "error": "Message required"}), 400

    whatsapp = WhatsAppService()
    subscribers = get_subscribers()
    
    if not subscribers:
        return jsonify({"success": False, "error": "No subscribers found"}), 404

    # Format the message for better readability on WhatsApp
    formatted_message = f"""
🚨 *HEALTH ALERT* 🚨
Source: *{source}*

{message}

⚠️ *Note:* Do NOT take action without consulting a doctor.
    """.strip()

    try:
        # Use simple list for broadcast_alert which expects list of dicts with 'phone'
        results = whatsapp.broadcast_alert(subscribers, formatted_message)
        return jsonify({
            "success": True, 
            "sent_count": results.get("sent", 0),
            "failed_count": results.get("failed", 0),
            "details": results.get("results", [])
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500