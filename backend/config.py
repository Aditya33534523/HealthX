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

    # Ollama Configuration
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")

    # CORS Settings
    CORS_ORIGINS = ["http://localhost:3000", "http://frontend:3000"]
