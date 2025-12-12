"""
Configuration settings for the Uber AI Clone server
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Google Gemini API (AI Studio)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # OpenWeather API
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Uber API Configuration
    # Note: User will provide these keys later
    UBER_CLIENT_ID = os.getenv("UBER_CLIENT_ID", "")
    UBER_CLIENT_SECRET = os.getenv("UBER_CLIENT_SECRET", "")
    UBER_SERVER_TOKEN = os.getenv("UBER_SERVER_TOKEN", "")
    UBER_SANDBOX_MODE = os.getenv("UBER_SANDBOX_MODE", "true").lower() == "true"
    
    # API Base URLs
    UBER_API_BASE_URL = "https://api.uber.com/v1.2" if not UBER_SANDBOX_MODE else "https://sandbox-api.uber.com/v1.2"
    UBER_AUTH_URL = "https://login.uber.com/oauth/v2/token"
    
    # Server Configuration
    SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT = int(os.getenv("SERVER_PORT", "8000"))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    @classmethod
    def validate(cls):
        """Validate that required API keys are present"""
        missing = []
        if not cls.GOOGLE_MAPS_API_KEY:
            missing.append("GOOGLE_MAPS_API_KEY")
        if not cls.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        if not cls.OPENWEATHER_API_KEY:
            missing.append("OPENWEATHER_API_KEY")
        
        # Uber keys are optional until user provides them
        if missing:
            print(f"Warning: Missing API keys: {', '.join(missing)}")
        
        return len(missing) == 0

