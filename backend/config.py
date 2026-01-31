import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MongoDB Configuration
    MONGO_URI = os.getenv(
        "MONGO_URI",
        "mongodb://admin:pharmacare123@mongodb:27017/pharma_chatbot?authSource=admin",
    )

    # Flask Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    FLASK_ENV = os.getenv("FLASK_ENV", "production")

    # Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")

    # CORS Settings
    CORS_ORIGINS = ["http://localhost:3000", "http://frontend:3000"]