import os
from datetime import datetime

import requests
from flask import Flask, jsonify, redirect, render_template, request, session, url_for

app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:5000")


@app.route("/")
def index():
    """Landing page - redirect to login"""
    if "user_id" in session:
        return redirect(url_for("chat"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    """Login page"""
    if request.method == "POST":
        # Simple demo login - accept any credentials
        email = request.form.get("email")
        if email:
            session["user_id"] = email
            return redirect(url_for("chat"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    """Logout"""
    session.pop("user_id", None)
    return redirect(url_for("login"))


@app.route("/chat")
def chat():
    """Chat interface"""
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("chat.html", user_id=session["user_id"])


@app.route("/api/send-message", methods=["POST"])
def send_message():
    """Proxy to backend chat API"""
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
        return jsonify(
            {
                "success": False,
                "error": "Request timeout",
                "response": "The AI is taking too long to respond. Please try again.",
            }
        ), 504
    except Exception as e:
        return jsonify(
            {
                "success": False,
                "error": str(e),
                "response": "Unable to connect to backend service.",
            }
        ), 500


@app.route("/api/drugs", methods=["GET"])
def get_drugs():
    """Get all drugs"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs", timeout=10)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health")
def health():
    """Health check"""
    try:
        backend_health = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return jsonify(
            {
                "status": "healthy",
                "frontend": "running",
                "backend": backend_health.json()
                if backend_health.ok
                else "unavailable",
            }
        ), 200
    except:
        return jsonify(
            {"status": "degraded", "frontend": "running", "backend": "unavailable"}
        ), 200


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🌐 PharmaCare Frontend (Python Flask)")
    print("=" * 60)
    print(f"📍 Server: http://0.0.0.0:3000")
    print(f"🔗 Backend: {BACKEND_URL}")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=3000, debug=True)
    app.run(host='0.0.0.0', port=3000, debug=True)
