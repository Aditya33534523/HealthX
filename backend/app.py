from config import Config
from flask import Flask, jsonify
from flask_cors import CORS
from routes.chat import chat_bp
from routes.drugs import drugs_bp
from routes.whatsapp import whatsapp_bp
from routes.users import users_bp
from routes.auth import auth_bp
from utils.db_init import initialize_drug_database
from utils.gemini_client import GeminiClient

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

# Initialize database
print("🔄 Initializing database...")
initialize_drug_database()

# Check Gemini connection
gemini = GeminiClient()
if gemini.check_health():
    print("✅ Gemini AI is running and ready!")
else:
    print("⚠️  Warning: Gemini AI is not ready. Please check GEMINI_API_KEY in .env")

# Register blueprints
app.register_blueprint(chat_bp, url_prefix="/api")
app.register_blueprint(drugs_bp, url_prefix="/api")
app.register_blueprint(whatsapp_bp, url_prefix="/api")
app.register_blueprint(users_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    gemini_status = gemini.check_health()

    return jsonify(
        {
            "status": "healthy",
            "message": "PharmaCare Backend API",
            "ai_provider": "Google Gemini",
            "ai_status": "connected" if gemini_status else "disconnected",
            "ai_model": Config.GEMINI_MODEL,
        }
    ), 200


@app.route("/", methods=["GET"])
def home():
    """Root endpoint"""
    return jsonify(
        {
            "message": "PharmaCare Backend API",
            "version": "2.0.0",
            "ai_provider": "Google Gemini",
            "endpoints": {
                "health": "/health",
                "chat": "/api/chat",
                "drugs": "/api/drugs",
                "banned_drugs": "/api/banned-drugs",
                "auth_google": "/api/auth/google",
                "whatsapp_send": "/api/whatsapp/send",
                "whatsapp_broadcast": "/api/whatsapp/broadcast-safety-alert",
            },
        }
    ), 200


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🏥 PharmaCare Backend API v2.0")
    print("=" * 60)
    print("📍 Server: http://0.0.0.0:5000")
    print("🔗 Health: http://0.0.0.0:5000/health")
    print(f"🤖 AI Provider: Google Gemini")
    print(f"🤖 AI Model: {Config.GEMINI_MODEL}")
    print("🔐 OAuth: Google")
    print("💬 WhatsApp: Enabled (if configured)")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=(Config.FLASK_ENV == "development"))