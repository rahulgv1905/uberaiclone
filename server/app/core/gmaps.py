"""
Google Maps API wrapper
"""
import googlemaps
from app.core.config import Config

class GoogleMapsService:
    """Service for interacting with Google Maps API"""
    
    def __init__(self):
        if not Config.GOOGLE_MAPS_API_KEY:
            raise ValueError("GOOGLE_MAPS_API_KEY is not set")
        self.client = googlemaps.Client(key=Config.GOOGLE_MAPS_API_KEY)
    
    def get_directions(self, origin, destination, mode="driving"):
        """
        Get directions between two locations
        
        Args:
            origin: Starting location
            destination: Ending location
            mode: Travel mode (driving, walking, bicycling, transit)
        
        Returns:
            dict: Directions data including distance, duration, and route
        """
        try:
            directions = self.client.directions(
                origin=origin,
                destination=destination,
                mode=mode
            )
            
            if not directions:
                return None
            
            route = directions[0]
            leg = route['legs'][0]
            
            return {
                'distance': leg['distance']['text'],
                'distance_meters': leg['distance']['value'],
                'duration': leg['duration']['text'],
                'duration_seconds': leg['duration']['value'],
                'start_address': leg['start_address'],
                'end_address': leg['end_address'],
                'steps': leg['steps'],
                'polyline': route['overview_polyline']['points']
            }
        except Exception as e:
            print(f"Error getting directions: {e}")
            return None
    
    def geocode(self, address):
        """
        Geocode an address to get coordinates
        
        Args:
            address: Address string
        
        Returns:
            dict: Geocoding result with lat/lng
        """
        try:
            geocode_result = self.client.geocode(address)
            if geocode_result:
                location = geocode_result[0]['geometry']['location']
                return {
                    'lat': location['lat'],
                    'lng': location['lng'],
                    'formatted_address': geocode_result[0]['formatted_address']
                }
            return None
        except Exception as e:
            print(f"Error geocoding address: {e}")
            return None
    
    def get_place_autocomplete(self, input_text):
        """
        Get place autocomplete suggestions
        
        Args:
            input_text: Partial address or place name
        
        Returns:
            list: List of place suggestions
        """
        try:
            if not input_text or len(input_text) < 2:
                return []
            
            # Use places_autocomplete - the method takes input_text as positional arg
            places = self.client.places_autocomplete(input_text)
            
            # Return the places as-is (they already have 'description' field)
            return places if places else []
        except Exception as e:
            print(f"Error getting autocomplete: {e}")
            import traceback
            traceback.print_exc()
            return []

# Singleton instance
_gmaps_service = None

def get_gmaps_service():
    """Get or create Google Maps service instance"""
    global _gmaps_service
    if _gmaps_service is None:
        _gmaps_service = GoogleMapsService()
    return _gmaps_service

