from flask import Blueprint, request, jsonify, session
from models.log import log_whatsapp_message, get_whatsapp_messages
from config import Config

whatsapp_bp = Blueprint('whatsapp', __name__)

@whatsapp_bp.route("/whatsapp/webhook", methods=["POST"])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages from Twilio"""
    try:
        # Twilio sends form-encoded data
        print(f"DEBUG: Webhook hit! Values: {request.values}")
        sender = request.values.get('From', 'Unknown')
        body = request.values.get('Body', '')
        
        print(f"DEBUG: Processing message from {sender}: {body}")
        if body:
            log_whatsapp_message(sender, body, source="Twilio")
            print(f"📩 WhatsApp received from {sender}: {body}")
            
            # Here you would typically reply using Twilio Client
            # For now, we just acknowledge receipt
            return str("PONG")
            
    except Exception as e:
        print(f"Error in webhook: {e}")
        return str("Error"), 500
    
    return str("OK")

@whatsapp_bp.route("/whatsapp/messages", methods=["GET"])
def get_messages():
    """Get all received WhatsApp messages (Admin only)"""
    if not session.get("is_admin"):
        return jsonify({"success": False, "error": "Unauthorized"}), 403
    
    messages = get_whatsapp_messages()
    return jsonify({"success": True, "messages": messages})

# We'll use this for manual testing since we don't have a public URL for Twilio
@whatsapp_bp.route("/whatsapp/test", methods=["POST"])
def test_webhook():
    """Manually test webhook logging"""
    data = request.json
    sender = data.get("sender", "Test User")
    message = data.get("message", "Hello!")
    
    log_whatsapp_message(sender, message, source="Manual Test")
    return jsonify({"success": True, "message": "Logged"})