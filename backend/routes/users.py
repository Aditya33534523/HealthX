from flask import Blueprint, jsonify, session
from models.user import get_user_chats  # <-- FIXED

user_bp = Blueprint('user', __name__)

@user_bp.route("/history", methods=["GET"])
def history():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"}), 401
    chats = get_user_chats(user_id)
    return jsonify({"success": True, "chats": chats})

@user_bp.route("/login-history", methods=["GET"])
def login_history():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"}), 401
    
    from models.log import get_login_history
    history = get_login_history(user_id)
    return jsonify({"success": True, "history": history})

@user_bp.route("/user", methods=["GET"])
def current_user():
    return jsonify({
        "success": True,
        "logged_in": "user_id" in session,
        "is_admin": session.get("is_admin", False)
    })