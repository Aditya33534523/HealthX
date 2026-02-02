from models.database import db
import bcrypt

def reset_admin():
    email = "admin@pharmacare.local"
    password = "admin123"
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Try to update existing
    result = db.users.update_one(
        {"email": email},
        {"$set": {"password": hashed, "is_admin": True}}
    )
    
    if result.matched_count > 0:
        print(f"✅ Updated password for {email}")
    else:
        # Create if not exists
        db.users.insert_one({
            "email": email,
            "password": hashed,
            "is_admin": True
        })
        print(f"✅ Created new admin user {email}")

if __name__ == "__main__":
    reset_admin()
