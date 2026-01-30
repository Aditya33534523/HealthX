from config import Config
from flask import Flask, jsonify
from flask_cors import CORS
from routes.chat import chat_bp
from routes.drugs import drugs_bp
from routes.whatsapp import whatsapp_bp
from routes.users import users_bp
from utils.db_init import initialize_drug_database
from utils.ollama_client import OllamaClient

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, origins=Config.CORS_ORIGINS)

# Initialize database
print("🔄 Initializing database...")
initialize_drug_database()

# Check Ollama connection
ollama = OllamaClient()
if ollama.check_health():
    print("✅ Ollama is running and ready!")
else:
    print("⚠️  Warning: Ollama is not ready yet. It may still be starting up.")

# Register blueprints
app.register_blueprint(chat_bp, url_prefix="/api")
app.register_blueprint(drugs_bp, url_prefix="/api")
app.register_blueprint(whatsapp_bp, url_prefix="/api")
app.register_blueprint(users_bp, url_prefix="/api")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    ollama_status = ollama.check_health()

    return jsonify(
        {
            "status": "healthy",
            "message": "PharmaCare Backend API",
            "ollama_status": "connected" if ollama_status else "disconnected",
            "ollama_model": Config.OLLAMA_MODEL,
        }
    ), 200


@app.route("/", methods=["GET"])
def home():
    """Root endpoint"""
    return jsonify(
        {
            "message": "PharmaCare Backend API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/health",
                "chat": "/api/chat",
                "drugs": "/api/drugs",
                "banned_drugs": "/api/banned-drugs",
                "whatsapp_send": "/api/whatsapp/send",
                "whatsapp_broadcast": "/api/whatsapp/broadcast-safety-alert",
                "whatsapp_subscribe": "/api/whatsapp/subscribe",
            },
        }
    ), 200


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🏥 PharmaCare Backend API (Python Only)")
    print("=" * 60)
    print("📍 Server: http://0.0.0.0:5000")
    print("🔗 Health: http://0.0.0.0:5000/health")
    print(f"🤖 AI Model: {Config.OLLAMA_MODEL}")
    print("💬 WhatsApp: Enabled (if configured)")
    print("=" * 60 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=(Config.FLASK_ENV == "development"))