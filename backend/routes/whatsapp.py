from datetime import datetime
from flask import Blueprint, jsonify, request
from models.database import users_collection, drugs_collection
from utils.whatsapp_service import WhatsAppService

whatsapp_bp = Blueprint("whatsapp", __name__)
whatsapp_service = WhatsAppService()


@whatsapp_bp.route("/whatsapp/send", methods=["POST"])
def send_whatsapp_message():
    """Send WhatsApp message to a single user"""
    try:
        data = request.json
        phone = data.get("phone")
        message = data.get("message")

        if not phone or not message:
            return jsonify({
                "success": False,
                "error": "Phone number and message are required"
            }), 400

        result = whatsapp_service.send_message(phone, message)
        return jsonify(result), 200 if result["success"] else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@whatsapp_bp.route("/whatsapp/broadcast-safety-alert", methods=["POST"])
def broadcast_safety_alert():
    """Broadcast safety alert to all subscribed users"""
    try:
        data = request.json
        drug_name = data.get("drug_name")
        alert_message = data.get("alert_message")

        if not drug_name or not alert_message:
            return jsonify({
                "success": False,
                "error": "Drug name and alert message are required"
            }), 400

        # Get all users with phone numbers and alert subscription
        users = list(users_collection.find(
            {"phone": {"$exists": True, "$ne": ""}, "whatsapp_alerts": True},
            {"phone": 1, "email": 1}
        ))

        if not users:
            return jsonify({
                "success": False,
                "message": "No users subscribed to WhatsApp alerts"
            }), 404

        result = whatsapp_service.send_safety_broadcast(users, drug_name, alert_message)
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@whatsapp_bp.route("/whatsapp/send-drug-recall", methods=["POST"])
def send_drug_recall():
    """Send drug recall notification"""
    try:
        data = request.json
        drug_name = data.get("drug_name")
        reason = data.get("reason")

        if not drug_name or not reason:
            return jsonify({
                "success": False,
                "error": "Drug name and reason are required"
            }), 400

        users = list(users_collection.find(
            {"phone": {"$exists": True, "$ne": ""}, "whatsapp_alerts": True},
            {"phone": 1, "email": 1}
        ))

        if not users:
            return jsonify({
                "success": False,
                "message": "No users subscribed to WhatsApp alerts"
            }), 404

        result = whatsapp_service.send_recall_notification(users, drug_name, reason)
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@whatsapp_bp.route("/whatsapp/send-drug-info", methods=["POST"])
def send_drug_info():
    """Send drug information via WhatsApp"""
    try:
        data = request.json
        phone = data.get("phone")
        drug_name = data.get("drug_name")

        if not phone or not drug_name:
            return jsonify({
                "success": False,
                "error": "Phone number and drug name are required"
            }), 400

        # Get drug information
        drug = drugs_collection.find_one(
            {"name": {"$regex": drug_name, "$options": "i"}},
            {"_id": 0}
        )

        if not drug:
            return jsonify({
                "success": False,
                "error": f"Drug '{drug_name}' not found"
            }), 404

        # Format drug information
        message = f"""
📋 *Drug Information*

*Name:* {drug['name']}
*Generic:* {drug['generic_name']}
*Status:* {drug['government_status']['status']}

⚠️ *Safety Alerts:*
{chr(10).join('• ' + alert for alert in drug['safety_alerts'])}

💊 *Side Effects:*
{chr(10).join('• ' + alert for alert in drug['adr_alerts'])}

🔄 *Interactions:*
{', '.join(drug['interactions'])}

⏰ *Timing:*
{chr(10).join('• ' + time for time in drug['timing'])}

For more details, visit PharmaCare portal.
        """.strip()

        result = whatsapp_service.send_message(phone, message)
        return jsonify(result), 200 if result["success"] else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@whatsapp_bp.route("/whatsapp/subscribe", methods=["POST"])
def subscribe_whatsapp():
    """Subscribe user to WhatsApp alerts"""
    try:
        data = request.json
        email = data.get("email")
        phone = data.get("phone")

        if not email or not phone:
            return jsonify({
                "success": False,
                "error": "Email and phone number are required"
            }), 400

        # Update or create user with WhatsApp subscription
        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "phone": phone,
                    "whatsapp_alerts": True,
                    "subscribed_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        # Send confirmation message
        confirmation = "✅ You've been subscribed to PharmaCare WhatsApp alerts. You'll receive important drug safety notifications."
        whatsapp_service.send_message(phone, confirmation)

        return jsonify({
            "success": True,
            "message": "Successfully subscribed to WhatsApp alerts"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@whatsapp_bp.route("/whatsapp/unsubscribe", methods=["POST"])
def unsubscribe_whatsapp():
    """Unsubscribe user from WhatsApp alerts"""
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({
                "success": False,
                "error": "Email is required"
            }), 400

        users_collection.update_one(
            {"email": email},
            {"$set": {"whatsapp_alerts": False}}
        )

        return jsonify({
            "success": True,
            "message": "Successfully unsubscribed from WhatsApp alerts"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500