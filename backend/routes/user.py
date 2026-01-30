from datetime import datetime
from flask import Blueprint, jsonify, request
from models.database import users_collection

users_bp = Blueprint("users", __name__)


@users_bp.route("/users/register", methods=["POST"])
def register_user():
    """Register new user"""
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        whatsapp_alerts = data.get("whatsapp_alerts", False)

        if not all([name, email, phone]):
            return jsonify({
                "success": False,
                "error": "Name, email, and phone are required"
            }), 400

        # Check if user already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({
                "success": False,
                "error": "User already exists"
            }), 409

        # Create user
        user_data = {
            "name": name,
            "email": email,
            "phone": phone,
            "whatsapp_alerts": whatsapp_alerts,
            "created_at": datetime.utcnow()
        }

        users_collection.insert_one(user_data)

        return jsonify({
            "success": True,
            "message": "User registered successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@users_bp.route("/users/<email>", methods=["GET"])
def get_user(email):
    """Get user by email"""
    try:
        user = users_collection.find_one({"email": email}, {"_id": 0})
        
        if user:
            return jsonify({
                "success": True,
                "user": user
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500