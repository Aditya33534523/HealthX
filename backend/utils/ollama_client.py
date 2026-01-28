import requests
from config import Config


class OllamaClient:
    def __init__(self):
        self.host = Config.OLLAMA_HOST
        self.model = Config.OLLAMA_MODEL

    def generate(self, prompt, system_prompt="", context=""):
        """Generate response using Ollama"""
        try:
            full_prompt = (
                f"{system_prompt}\n\nContext: {context}\n\nUser: {prompt}\n\nAssistant:"
            )

            response = requests.post(
                f"{self.host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                    },
                },
                timeout=60,
            )

            if response.status_code == 200:
                return response.json()["response"]
            else:
                return f"⚠️ Ollama API returned status code: {response.status_code}"

        except requests.exceptions.ConnectionError:
            return (
                "⚠️ Cannot connect to Ollama. Please ensure Ollama service is running."
            )
        except requests.exceptions.Timeout:
            return "⚠️ Ollama request timed out. The model might be loading."
        except Exception as e:
            return f"⚠️ Error: {str(e)}"

    def check_health(self):
        """Check if Ollama is running"""
        try:
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
