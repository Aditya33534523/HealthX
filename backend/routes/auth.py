from datetime import datetime
from flask import Blueprint, jsonify, request, session
from models.database import users_collection
from config import Config
import requests

auth_bp = Blueprint("auth", __name__)


# Google OAuth
@auth_bp.route("/auth/google", methods=["GET"])
def google_login():
    """Initiate Google OAuth"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={Config.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={Config.GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid email profile"
    )
    return jsonify({"auth_url": google_auth_url})


@auth_bp.route("/auth/google/callback", methods=["GET", "POST"])
def google_callback():
    """Handle Google OAuth callback"""
    try:
        code = request.args.get("code")
        
        # Exchange code for token
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": Config.GOOGLE_CLIENT_ID,
                "client_secret": Config.GOOGLE_CLIENT_SECRET,
                "redirect_uri": Config.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # Get user info
        user_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        
        user_data = user_response.json()
        
        # Save or update user in database
        email = user_data.get("email")
        name = user_data.get("name")
        picture = user_data.get("picture")
        
        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "name": name,
                    "email": email,
                    "picture": picture,
                    "auth_provider": "google",
                    "last_login": datetime.utcnow(),
                }
            },
            upsert=True,
        )
        
        return jsonify({
            "success": True,
            "user": {
                "email": email,
                "name": name,
                "picture": picture,
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})