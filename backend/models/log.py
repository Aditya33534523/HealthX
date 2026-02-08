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
    """Log an incoming WhatsApp message and subscribe the user"""
    db.whatsapp_logs.insert_one({
        "sender": sender,
        "message": message,
        "source": source,
        "timestamp": datetime.utcnow()
    })
    # Auto-subscribe users who message the bot
    subscribe_user(sender)

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

def subscribe_user(phone):
    """Add a phone number to the subscribers list if not already present"""
    if not phone:
        return
    
    # Ensure phone starts with whatsapp: for Twilio consistency if it looks like a number
    if not phone.startswith("whatsapp:") and (phone.startswith("+") or phone.isdigit()):
        phone = f"whatsapp:{phone}"
        
    db.subscribers.update_one(
        {"phone": phone},
        {"$set": {"last_seen": datetime.utcnow()}, "$setOnInsert": {"subscribed_at": datetime.utcnow()}},
        upsert=True
    )

def get_subscribers():
    """Get all subscribed WhatsApp numbers"""
    subscribers = db.subscribers.find()
    return [s for s in subscribers]

def get_unique_senders_count():
    """Get total count of unique WhatsApp members"""
    return db.subscribers.count_documents({})
