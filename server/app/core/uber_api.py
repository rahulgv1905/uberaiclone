"""
Uber API integration
"""
import requests
from typing import Optional, Dict, List
from app.core.config import Config

class UberAPIService:
    """Service for interacting with Uber API"""
    
    def __init__(self):
        self.server_token = Config.UBER_SERVER_TOKEN
        self.client_id = Config.UBER_CLIENT_ID
        self.client_secret = Config.UBER_CLIENT_SECRET
        self.base_url = Config.UBER_API_BASE_URL
        self.auth_url = Config.UBER_AUTH_URL
    
    def _get_headers(self, include_auth: bool = True) -> Dict[str, str]:
        """Get headers for API requests"""
        headers = {
            "Content-Type": "application/json",
            "Accept-Language": "en_US"
        }
        if include_auth and self.server_token:
            headers["Authorization"] = f"Token {self.server_token}"
        return headers
    
    def get_products(self, latitude: float, longitude: float) -> Optional[List[Dict]]:
        """
        Get available Uber products at a location
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
        
        Returns:
            List of available products or None if error
        """
        if not self.server_token:
            print("Warning: UBER_SERVER_TOKEN not set. Returning mock data.")
            return self._get_mock_products()
        
        try:
            url = f"{self.base_url}/products"
            params = {
                "latitude": latitude,
                "longitude": longitude
            }
            
            response = requests.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                return response.json().get("products", [])
            else:
                print(f"Uber API error: {response.status_code} - {response.text}")
                return self._get_mock_products()
        except Exception as e:
            print(f"Error fetching Uber products: {e}")
            return self._get_mock_products()
    
    def get_price_estimates(
        self, 
        start_latitude: float, 
        start_longitude: float,
        end_latitude: float,
        end_longitude: float
    ) -> Optional[List[Dict]]:
        """
        Get price estimates for a ride
        
        Args:
            start_latitude: Starting latitude
            start_longitude: Starting longitude
            end_latitude: Ending latitude
            end_longitude: Ending longitude
        
        Returns:
            List of price estimates or None if error
        """
        if not self.server_token:
            print("Warning: UBER_SERVER_TOKEN not set. Returning mock data.")
            return self._get_mock_price_estimates()
        
        try:
            url = f"{self.base_url}/estimates/price"
            params = {
                "start_latitude": start_latitude,
                "start_longitude": start_longitude,
                "end_latitude": end_latitude,
                "end_longitude": end_longitude
            }
            
            response = requests.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                return response.json().get("prices", [])
            else:
                print(f"Uber API error: {response.status_code} - {response.text}")
                return self._get_mock_price_estimates()
        except Exception as e:
            print(f"Error fetching price estimates: {e}")
            return self._get_mock_price_estimates()
    
    def get_time_estimates(
        self,
        latitude: float,
        longitude: float,
        product_id: Optional[str] = None
    ) -> Optional[List[Dict]]:
        """
        Get time estimates for pickup
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            product_id: Optional product ID to filter
        
        Returns:
            List of time estimates or None if error
        """
        if not self.server_token:
            print("Warning: UBER_SERVER_TOKEN not set. Returning mock data.")
            return self._get_mock_time_estimates()
        
        try:
            url = f"{self.base_url}/estimates/time"
            params = {
                "start_latitude": latitude,
                "start_longitude": longitude
            }
            if product_id:
                params["product_id"] = product_id
            
            response = requests.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                return response.json().get("times", [])
            else:
                print(f"Uber API error: {response.status_code} - {response.text}")
                return self._get_mock_time_estimates()
        except Exception as e:
            print(f"Error fetching time estimates: {e}")
            return self._get_mock_time_estimates()
    
    def _get_mock_products(self) -> List[Dict]:
        """Return mock products when API is not configured"""
        return [
            {
                "product_id": "mock-uberx",
                "display_name": "UberX",
                "description": "Affordable, everyday rides",
                "capacity": 4,
                "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png"
            },
            {
                "product_id": "mock-uberxl",
                "display_name": "UberXL",
                "description": "Room for groups up to 6",
                "capacity": 6,
                "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberxl.png"
            },
            {
                "product_id": "mock-comfort",
                "display_name": "Comfort",
                "description": "Newer cars with extra legroom",
                "capacity": 4,
                "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-comfort.png"
            }
        ]
    
    def _get_mock_price_estimates(self) -> List[Dict]:
        """Return mock price estimates when API is not configured"""
        return [
            {
                "product_id": "mock-uberx",
                "currency_code": "USD",
                "display_name": "UberX",
                "estimate": "$15-20",
                "low_estimate": 15,
                "high_estimate": 20,
                "surge_multiplier": 1.0,
                "duration": 1800,
                "distance": 10.5
            },
            {
                "product_id": "mock-uberxl",
                "currency_code": "USD",
                "display_name": "UberXL",
                "estimate": "$22-28",
                "low_estimate": 22,
                "high_estimate": 28,
                "surge_multiplier": 1.0,
                "duration": 1800,
                "distance": 10.5
            },
            {
                "product_id": "mock-comfort",
                "currency_code": "USD",
                "display_name": "Comfort",
                "estimate": "$18-24",
                "low_estimate": 18,
                "high_estimate": 24,
                "surge_multiplier": 1.0,
                "duration": 1800,
                "distance": 10.5
            }
        ]
    
    def _get_mock_time_estimates(self) -> List[Dict]:
        """Return mock time estimates when API is not configured"""
        return [
            {
                "product_id": "mock-uberx",
                "display_name": "UberX",
                "estimate": 300
            },
            {
                "product_id": "mock-uberxl",
                "display_name": "UberXL",
                "estimate": 420
            },
            {
                "product_id": "mock-comfort",
                "display_name": "Comfort",
                "estimate": 360
            }
        ]

# Singleton instance
_uber_service = None

def get_uber_service():
    """Get or create Uber API service instance"""
    global _uber_service
    if _uber_service is None:
        _uber_service = UberAPIService()
    return _uber_service

