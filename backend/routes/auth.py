from flask import Blueprint, request, jsonify, session
from models.user import create_user, authenticate_user, create_or_get_google_user
import requests

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required"}), 400
    
    if create_user(email, password):
        return jsonify({"success": True, "message": "Registered successfully. Please login."})
    return jsonify({"success": False, "error": "Email already registered"}), 409

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = authenticate_user(data.get("email"), data.get("password"))
    if user:
        session["user_id"] = str(user["_id"])
        session["is_admin"] = user.get("is_admin", False)
        
        # Log the login
        from models.log import log_login
        log_login(session["user_id"], request.remote_addr)
        
        return jsonify({"success": True, "is_admin": session["is_admin"]})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@auth_bp.route("/google-auth", methods=["POST"])
def google_auth():
    """Handle Google OAuth authentication"""
    data = request.json
    credential = data.get("credential")
    
    if not credential:
        return jsonify({"success": False, "error": "No credential provided"}), 400
    
    try:
        # Verify the Google ID token
        google_verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        response = requests.get(google_verify_url, timeout=10)
        
        if response.status_code != 200:
            return jsonify({"success": False, "error": "Invalid Google token"}), 401
        
        token_info = response.json()
        
        # Verify the token is for our app
        expected_client_id = "486846987530-u7jqcgm81trolhe2pg184ss53d8ordmh.apps.googleusercontent.com"
        if token_info.get("aud") != expected_client_id:
            return jsonify({"success": False, "error": "Token not for this application"}), 401
        
        # Get user info from token
        email = token_info.get("email")
        google_id = token_info.get("sub")
        
        if not email:
            return jsonify({"success": False, "error": "Email not provided by Google"}), 400
        
        # Create or get user
        user = create_or_get_google_user(email, google_id)
        
        if user:
            session["user_id"] = str(user["_id"])
            session["is_admin"] = user.get("is_admin", False)
            
            # Log the login
            from models.log import log_login
            log_login(session["user_id"], request.remote_addr)
            
            return jsonify({"success": True, "is_admin": session["is_admin"]})
        
        return jsonify({"success": False, "error": "Failed to create user account"}), 500
        
    except requests.RequestException as e:
        return jsonify({"success": False, "error": "Failed to verify Google token"}), 500
    except Exception as e:
        print(f"Google auth error: {str(e)}")
        return jsonify({"success": False, "error": "Authentication failed"}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})