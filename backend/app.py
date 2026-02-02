from flask import Flask, session
from flask_cors import CORS
from routes.chat import chat_bp
from routes.auth import auth_bp
from routes.broadcast import broadcast_bp
from routes.users import user_bp
from routes.whatsapp import whatsapp_bp
from utils.db_init import initialize_drug_database as init_db

app = Flask(__name__, template_folder='../frontend/templates')
app.secret_key = "super-secret-key-change-in-production-please"
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Register blueprints
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(broadcast_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(whatsapp_bp, url_prefix='/api')

# Init DB on startup
with app.app_context():
    init_db()

@app.route('/health')
def health():
    return {"status": "ok"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)