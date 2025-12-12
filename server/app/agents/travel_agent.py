"""
Travel Agent - AI-powered travel assistant using Google Gemini
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
import requests
from app.core.config import Config
from typing import Tuple

def get_weather(city_name: str) -> Tuple[str, float]:
    """
    Get weather information for a city
    
    Args:
        city_name: Name of the city
    
    Returns:
        tuple: (weather_description, temperature)
    """
    api_key = Config.OPENWEATHER_API_KEY
    if not api_key:
        print("Warning: OPENWEATHER_API_KEY not set. Returning default weather.")
        return "clear sky", 20.0
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get("weather"):
            description = data["weather"][0]["description"]
            temperature = data["main"]["temp"]
            return description, temperature
        return "unknown", 20.0
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather: {e}")
        return "unknown", 20.0
    except Exception as e:
        print(f"Unexpected error getting weather: {e}")
        return "clear sky", 20.0

def get_travel_suggestion(
    source: str,
    destination: str,
    duration: str,
    weather_desc: str,
    temp: float
) -> str:
    """
    Get AI-powered travel suggestion
    
    Args:
        source: Starting location
        destination: Destination location
        duration: Trip duration
        weather_desc: Weather description
        temp: Temperature in Celsius
    
    Returns:
        str: AI-generated travel suggestion
    """
    if not Config.GEMINI_API_KEY:
        return f"Traveling from {source} to {destination} will take {duration}. Weather at destination: {weather_desc}, {temp}°C. Dress appropriately and enjoy your ride! 🚕"
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  # Updated model name
            temperature=0.7,
            google_api_key=Config.GEMINI_API_KEY
        )
        
        template = """
        I am booking a cab from {source} to {destination}. 
        The trip will take {duration}.
        The weather at the destination is {weather_desc} with a temperature of {temp}°C.
        
        Please act as a travel assistant and provide SPECIFIC, ACTIONABLE advice:
        
        1. CLOTHING RECOMMENDATIONS (be specific):
           - If temperature is below 15°C: Recommend wearing a SWEATER or JACKET
           - If temperature is below 5°C: Recommend wearing a WARM COAT or HEAVY JACKET
           - If temperature is above 25°C: Recommend wearing LIGHT CLOTHING or T-SHIRT
           - If weather description contains "rain", "drizzle", "storm": STRONGLY recommend carrying a RAINCOAT or UMBRELLA
           - If weather description contains "snow": Recommend WARM BOOTS and HEAVY COAT
        
        2. ESSENTIAL ITEMS (be specific):
           - If rain is likely: "Carry a RAINCOAT or UMBRELLA"
           - If cold: "Bring a SWEATER or JACKET"
           - If hot: "Wear light, breathable clothing"
        
        3. Give a short, friendly tip for the ride.
        
        Format your response as:
        - First line: Weather-specific clothing recommendation (e.g., "Bring a SWEATER - it's {temp}°C" or "Carry a RAINCOAT - rain expected")
        - Second line: Additional tip or advice
        - Keep it concise (2-3 sentences, under 60 words)
        - Be direct and specific, not generic
        """
        
        prompt = PromptTemplate(
            input_variables=["source", "destination", "duration", "weather_desc", "temp"],
            template=template
        )
        
        chain = prompt | llm
        response = chain.invoke({
            "source": source,
            "destination": destination,
            "duration": duration,
            "weather_desc": weather_desc,
            "temp": temp
        })
        return response.content
    except Exception as e:
        print(f"Error getting AI suggestion: {e}")
        return f"Traveling from {source} to {destination} will take {duration}. Weather at destination: {weather_desc}, {temp}°C. Dress appropriately and enjoy your ride! 🚕"