import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class WhatsAppService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+19346474876")
        
        if not self.account_sid or not self.auth_token:
            print("⚠️ Twilio credentials not configured. WhatsApp features disabled.")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
            print("✅ WhatsApp service initialized")

    def send_message(self, to_number, message):
        """Send WhatsApp message to a single user"""
        if not self.client:
            return {
                "success": False,
                "error": "Twilio not configured"
            }
        
        try:
            # Format number with whatsapp: prefix
            if not to_number.startswith("whatsapp:"):
                to_number = f"whatsapp:{to_number}"
            
            message = self.client.messages.create(
                from_=self.whatsapp_number,
                body=message,
                to=to_number
            )
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status
            }
        
        except TwilioRestException as e:
            print(f"❌ Twilio error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
        except Exception as e:
            print(f"❌ Error sending WhatsApp: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def broadcast_alert(self, users, alert_message):
        """Send broadcast message to multiple users"""
        if not self.client:
            return {
                "success": False,
                "error": "Twilio not configured",
                "sent": 0,
                "failed": 0
            }
        
        results = []
        sent_count = 0
        failed_count = 0
        
        for user in users:
            phone = user.get("phone")
            if not phone:
                continue
            
            result = self.send_message(phone, alert_message)
            results.append({
                "user": user.get("email", "unknown"),
                "phone": phone,
                "result": result
            })
            
            if result["success"]:
                sent_count += 1
            else:
                failed_count += 1
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": failed_count,
            "results": results
        }

    def send_drug_alert(self, to_number, drug_name, alert_type, alert_details):
        """Send formatted drug alert"""
        message = f"""
🏥 *PharmaCare Alert*

⚠️ {alert_type.upper()}
Drug: {drug_name}

{alert_details}

This is an automated alert. Please consult your healthcare provider.
        """.strip()
        
        return self.send_message(to_number, message)

    def send_safety_broadcast(self, users, drug_name, safety_info):
        """Broadcast safety alert to all users"""
        message = f"""
🚨 *SAFETY ALERT* 🚨

Drug: {drug_name}

{safety_info}

⚠️ Action Required:
- Consult your doctor immediately
- Do not stop medication without medical advice
- Report any side effects

PharmaCare Safety Team
        """.strip()
        
        return self.broadcast_alert(users, message)

    def send_recall_notification(self, users, drug_name, reason):
        """Send drug recall notification"""
        message = f"""
🔴 *DRUG RECALL NOTICE* 🔴

Drug Recalled: {drug_name}

Reason: {reason}

⚠️ IMMEDIATE ACTION REQUIRED:
1. Stop using this medication
2. Contact your doctor for alternatives
3. Return unused medication to pharmacy

For questions: Contact your healthcare provider

PharmaCare Alert System
        """.strip()
        
        return self.broadcast_alert(users, message)