import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MongoDB Configuration
    MONGO_URI = os.getenv(
        "MONGO_URI",
        "mongodb://admin:lifexia123@mongodb:27017/lifexia_chatbot?authSource=admin",
    )

    # Flask Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    FLASK_ENV = os.getenv("FLASK_ENV", "production")

    # Ollama AI Configuration
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

    # Twilio WhatsApp Configuration
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")

    # CORS Settings
    CORS_ORIGINS = ["http://localhost:3000", "http://frontend:3000"]