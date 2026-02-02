from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
# This will get the database named in the connection string (pharma_chatbot)
db = client.get_default_database()

# Export common collections for easy access
drugs_collection = db.drugs
users_collection = db.users
chat_history = db.chat_history
whatsapp_logs = db.whatsapp_logs
login_logs = db.login_logs
broadcast_history = db.broadcast_history
