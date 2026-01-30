import os
import requests
from flask import Flask, jsonify, redirect, render_template, request, session, url_for, flash

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

# Load backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:5000")


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
            session["user_name"] = email.split("@")[0]
            return redirect(url_for("chat"))
    return render_template("login.html")


@app.route("/signup", methods=["POST"])
def signup():
    try:
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        whatsapp_alerts = request.form.get("whatsapp_alerts") == "on"

        if not all([name, email, phone]):
            flash("All fields are required", "error")
            return redirect(url_for("login"))

        # Register user in backend
        response = requests.post(
            f"{BACKEND_URL}/api/users/register",
            json={
                "name": name,
                "email": email,
                "phone": phone,
                "whatsapp_alerts": whatsapp_alerts
            },
            timeout=10
        )

        if response.status_code == 200:
            # Subscribe to WhatsApp alerts if enabled
            if whatsapp_alerts:
                requests.post(
                    f"{BACKEND_URL}/api/whatsapp/subscribe",
                    json={"email": email, "phone": phone},
                    timeout=10
                )

            # Auto login
            session["user_id"] = email
            session["user_name"] = name
            session["phone"] = phone
            return redirect(url_for("chat"))
        else:
            flash("Signup failed. Please try again.", "error")
            return redirect(url_for("login"))

    except Exception as e:
        flash(f"Error: {str(e)}", "error")
        return redirect(url_for("login"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/chat")
def chat():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("chat.html", 
                         user_id=session["user_id"],
                         user_name=session.get("user_name", "User"),
                         phone=session.get("phone", ""))


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


@app.route("/api/whatsapp/send-drug-info", methods=["POST"])
def send_drug_info_whatsapp():
    """Send drug info via WhatsApp"""
    try:
        data = request.json
        phone = session.get("phone") or data.get("phone")
        drug_name = data.get("drug_name")

        if not phone:
            return jsonify({
                "success": False,
                "error": "Phone number not found. Please update your profile."
            }), 400

        response = requests.post(
            f"{BACKEND_URL}/api/whatsapp/send-drug-info",
            json={"phone": phone, "drug_name": drug_name},
            timeout=30
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health")
def health():
    return jsonify({"status": "frontend running"}), 200


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🌐 PharmaCare Frontend (Python Flask)")
    print("=" * 60)
    print(f"📍 Server: http://0.0.0.0:3000")
    print(f"🔗 Backend: {BACKEND_URL}")
    print("💬 WhatsApp: Enabled")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=3000, debug=True)