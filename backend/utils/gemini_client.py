import google.generativeai as genai
from config import Config


class GeminiClient:
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        self.model_name = Config.GEMINI_MODEL
        
        if not self.api_key:
            print("⚠️ GEMINI_API_KEY not set! Please add it to .env file")
            self.model = None
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            print(f"✅ Gemini AI initialized with model: {self.model_name}")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {e}")
            self.model = None

    def generate(self, prompt, system_prompt="", context=""):
        """Generate response using Gemini AI"""
        if not self.model:
            return "⚠️ Gemini AI is not configured. Please add GEMINI_API_KEY to .env file."
        
        try:
            # Combine prompts
            full_prompt = f"""{system_prompt}

Context: {context}

User Query: {prompt}

Please provide a helpful, accurate response focused on pharmaceutical information."""

            # Generate response
            response = self.model.generate_content(full_prompt)
            
            if response and response.text:
                return response.text
            else:
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            error_msg = str(e)
            
            # Handle rate limiting
            if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                return "⚠️ Rate limit reached. Please try again in a moment."
            
            # Handle safety filters
            if "safety" in error_msg.lower():
                return "I apologize, but I cannot provide a response to this query due to safety guidelines."
            
            # Generic error
            return f"⚠️ Error generating response: {error_msg}"

    def check_health(self):
        """Check if Gemini AI is accessible"""
        if not self.model:
            return False
        
        try:
            # Try a simple generation
            response = self.model.generate_content("Hello")
            return bool(response and response.text)
        except:
            return False