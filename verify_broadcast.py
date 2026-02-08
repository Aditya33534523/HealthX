import sys
import os

# Add backend to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.append(backend_path)

from unittest.mock import MagicMock, patch
from models.log import subscribe_user, get_subscribers, get_unique_senders_count
from models.database import db

def test_subscriber_management():
    print("Testing Subscriber Management...")
    
    # Mock database
    db.subscribers = MagicMock()
    
    # Test subscribing a user
    phone = "+919876543210"
    subscribe_user(phone)
    
    # Verify update_one was called with correctly formatted phone
    db.subscribers.update_one.assert_called()
    call_args = db.subscribers.update_one.call_args[0][0]
    print(f"Subscribed phone: {call_args['phone']}")
    assert call_args['phone'] == f"whatsapp:{phone}"
    
    print("✅ Subscriber management test passed!")

def test_broadcast_logic():
    print("\nTesting Broadcast Logic...")
    
    with patch('utils.whatsapp_service.Client') as mock_client:
        from utils.whatsapp_service import WhatsAppService
        
        # Setup mock client
        mock_instance = mock_client.return_value
        mock_instance.messages.create.return_value = MagicMock(sid="SM123", status="sent")
        
        service = WhatsAppService()
        users = [
            {"phone": "whatsapp:+919876543210", "email": "user1@example.com"},
            {"phone": "whatsapp:+919123456780", "email": "user2@example.com"}
        ]
        
        result = service.broadcast_alert(users, "Test Broadcast Message")
        
        print(f"Broadcast result: {result['sent']} sent, {result['failed']} failed")
        assert result['sent'] == 2
        assert mock_instance.messages.create.call_count == 2
        
    print("✅ Broadcast logic test passed!")

if __name__ == "__main__":
    try:
        test_subscriber_management()
        test_broadcast_logic()
        print("\nAll verification tests passed!")
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        sys.exit(1)
