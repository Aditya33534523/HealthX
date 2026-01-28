import time

from config import Config
from pymongo import MongoClient


def get_database():
    """Get MongoDB database connection with retry logic"""
    max_retries = 5
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            print("✅ MongoDB connection successful!")
            return client["pharma_chatbot"]
        except Exception as e:
            if attempt < max_retries - 1:
                print(
                    f"⚠️  MongoDB connection attempt {attempt + 1} failed. Retrying in {retry_delay}s..."
                )
                time.sleep(retry_delay)
            else:
                print(f"❌ MongoDB connection failed after {max_retries} attempts: {e}")
                raise


# Initialize database
db = get_database()

# Collections
drugs_collection = db["drugs"]
chat_history_collection = db["chat_history"]
reminders_collection = db["reminders"]
users_collection = db["users"]
