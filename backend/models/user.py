from models.database import db
from bson.objectid import ObjectId
import bcrypt
from datetime import datetime

def create_user(email, password, is_admin=False):
    if db.users.find_one({"email": email}):
        return False
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    db.users.insert_one({
        "email": email,
        "password": hashed,
        "is_admin": is_admin,
        "auth_provider": "email",
        "created_at": datetime.utcnow()
    })
    return True

def authenticate_user(email, password):
    user = db.users.find_one({"email": email})
    if user and user.get("password") and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return user
    return None

def create_or_get_google_user(email, google_id):
    """Create a new user or get existing user for Google OAuth"""
    # Check if user exists with this email
    user = db.users.find_one({"email": email})
    
    if user:
        # Update google_id if not set
        if not user.get("google_id"):
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"google_id": google_id, "auth_provider": "google"}}
            )
        return user
    
    # Create new user
    result = db.users.insert_one({
        "email": email,
        "google_id": google_id,
        "password": None,  # No password for Google users
        "is_admin": False,
        "auth_provider": "google",
        "created_at": datetime.utcnow()
    })
    
    return db.users.find_one({"_id": result.inserted_id})

def save_chat(user_id, message, response):
    db.chats.insert_one({
        "user_id": ObjectId(user_id),
        "message": message,
        "response": response,
        "timestamp": datetime.utcnow()
    })

def get_user_chats(user_id):
    chats = db.chats.find({"user_id": ObjectId(user_id)}).sort("timestamp", 1)
    return [{"message": c["message"], "response": c["response"], "timestamp": c["timestamp"].isoformat()} for c in chats]