from models.database import db
from datetime import datetime
from bson.objectid import ObjectId

def log_login(user_id, ip_address="Unknown"):
    """Log a user login event"""
    db.login_logs.insert_one({
        "user_id": ObjectId(user_id),
        "ip_address": ip_address,
        "timestamp": datetime.utcnow()
    })

def get_login_history(user_id):
    """Get login history for a user"""
    logs = db.login_logs.find({"user_id": ObjectId(user_id)}).sort("timestamp", -1).limit(10)
    return [
        {
            "ip_address": log.get("ip_address", "Unknown"),
            "timestamp": log["timestamp"].isoformat()
        }
        for log in logs
    ]

def log_whatsapp_message(sender, message, source="User"):
    """Log an incoming WhatsApp message"""
    db.whatsapp_logs.insert_one({
        "sender": sender,
        "message": message,
        "source": source,
        "timestamp": datetime.utcnow()
    })

def get_whatsapp_messages():
    """Get all WhatsApp messages (for admin)"""
    logs = db.whatsapp_logs.find().sort("timestamp", -1).limit(50)
    return [
        {
            "sender": log.get("sender"),
            "message": log.get("message"),
            "source": log.get("source"),
            "timestamp": log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        }
        for log in logs
    ]
