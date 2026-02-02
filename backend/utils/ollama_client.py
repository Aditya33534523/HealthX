import requests
from config import Config


class OllamaClient:
    def __init__(self):
        self.host = Config.OLLAMA_HOST
        self.model = "qwen2.5:0.5b"  # ← force it here temporarily
        print(f"✅ Ollama initialized: {self.host} with model {self.model} (HARDCODED)")

    def generate(self, prompt, system_prompt="", context=""):
        """Generate response using Ollama"""
        try:
            full_prompt = f"{system_prompt}\n\nContext: {context}\n\nUser Query: {prompt}\n\nAssistant:"
            print("DEBUG OLLAMA REQUEST:")
            print(f"  URL: {self.host}/api/generate")
            print(f"  Model being sent: {self.model}")
            print(f"  Prompt starts with: {full_prompt[:150]}...")
            response = requests.post(
                f"{self.host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "")
                return result if result else "I apologize, but I couldn't generate a response."
            else:
                return f"⚠️ Error: Unable to generate response (Status: {response.status_code})"
                
        except requests.exceptions.Timeout:
            return "⚠️ Request timed out. The AI model is taking longer than expected. Please try again."
        except requests.exceptions.ConnectionError:
            return "⚠️ Cannot connect to Ollama. Please ensure the service is running."
        except Exception as e:
            return f"⚠️ Error: {str(e)}"

    def check_health(self):
        """Check if Ollama is accessible"""
        try:
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
        