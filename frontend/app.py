import os

import requests
from flask import Flask, jsonify, redirect, render_template, request, session, url_for

# 1. Create the Flask app FIRST
app = Flask(__name__)

# 2. Now set properties (secret_key, etc.)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

# Load backend URL from env (used for proxying API calls)
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:5000")


# 3. Routes
@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("chat"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        if email:
            session["user_id"] = email
            return redirect(url_for("chat"))
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("login"))


@app.route("/chat")
def chat():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("chat.html", user_id=session["user_id"])


@app.route("/api/send-message", methods=["POST"])
def send_message():
    try:
        data = request.json
        user_id = session.get("user_id", "default_user")
        response = requests.post(
            f"{BACKEND_URL}/api/chat",
            json={"message": data.get("message"), "user_id": user_id},
            timeout=60,
        )
        return jsonify(response.json()), response.status_code
    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Request timeout"}), 504
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# 4. Health check (optional)
@app.route("/health")
def health():
    return jsonify({"status": "frontend running"}), 200


# 5. Run the app
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🌐 PharmaCare Frontend (Python Flask)")
    print("=" * 60)
    print(f"📍 Server: http://0.0.0.0:3000")
    print(f"🔗 Backend: {BACKEND_URL}")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=3000, debug=True)
