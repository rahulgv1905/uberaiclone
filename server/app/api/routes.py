"""
API routes for Uber AI Clone
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.core.gmaps import get_gmaps_service
from app.core.uber_api import get_uber_service
from app.agents.travel_agent import get_weather, get_travel_suggestion

router = APIRouter()

class RideRequest(BaseModel):
    """Request model for booking a ride"""
    source: str
    destination: str
    product_id: Optional[str] = None

class LocationRequest(BaseModel):
    """Request model for location-based queries"""
    latitude: float
    longitude: float

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Uber AI Clone API v1"}

@router.post("/book-ride")
async def book_ride(request: RideRequest):
    """
    Book a ride with AI-powered travel suggestions
    
    Args:
        request: RideRequest with source and destination
    
    Returns:
        dict: Ride details, weather info, and AI suggestions
    """
    try:
        # Get Google Maps service
        gmaps = get_gmaps_service()
        
        # Get directions
        directions = gmaps.get_directions(request.source, request.destination)
        if not directions:
            raise HTTPException(
                status_code=404, 
                detail=f"Route not found between {request.source} and {request.destination}"
            )
        
        # Geocode addresses for Uber API
        start_location = gmaps.geocode(request.source)
        end_location = gmaps.geocode(request.destination)
        
        # Get Uber price estimates if coordinates are available
        uber_prices = None
        uber_times = None
        if start_location and end_location:
            uber_service = get_uber_service()
            uber_prices = uber_service.get_price_estimates(
                start_location['lat'],
                start_location['lng'],
                end_location['lat'],
                end_location['lng']
            )
            uber_times = uber_service.get_time_estimates(
                start_location['lat'],
                start_location['lng']
            )
        
        # Get weather for destination
        weather_desc, temp = get_weather(request.destination)
        
        # Get AI travel suggestion
        suggestion = get_travel_suggestion(
            request.source,
            request.destination,
            directions['duration'],
            weather_desc,
            temp
        )
        
        return {
            "ride_details": {
                "distance": directions['distance'],
                "distance_meters": directions['distance_meters'],
                "duration": directions['duration'],
                "duration_seconds": directions['duration_seconds'],
                "start_address": directions['start_address'],
                "end_address": directions['end_address'],
                "polyline": directions['polyline']
            },
            "weather_report": {
                "condition": weather_desc,
                "temperature": temp
            },
            "uber_estimates": {
                "prices": uber_prices or [],
                "times": uber_times or []
            },
            "ai_suggestion": suggestion
        }
    except ValueError as e:
        # API key not set or service not initialized
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error booking ride: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/products")
async def get_products(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate")
):
    """
    Get available Uber products at a location
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
    
    Returns:
        List of available products
    """
    try:
        uber_service = get_uber_service()
        products = uber_service.get_products(latitude, longitude)
        return {"products": products or []}
    except Exception as e:
        print(f"Error getting products: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/price-estimates")
async def get_price_estimates(
    start_latitude: float = Query(..., description="Starting latitude"),
    start_longitude: float = Query(..., description="Starting longitude"),
    end_latitude: float = Query(..., description="Ending latitude"),
    end_longitude: float = Query(..., description="Ending longitude")
):
    """
    Get price estimates for a ride
    
    Args:
        start_latitude: Starting latitude
        start_longitude: Starting longitude
        end_latitude: Ending latitude
        end_longitude: Ending longitude
    
    Returns:
        List of price estimates
    """
    try:
        uber_service = get_uber_service()
        prices = uber_service.get_price_estimates(
            start_latitude,
            start_longitude,
            end_latitude,
            end_longitude
        )
        return {"prices": prices or []}
    except Exception as e:
        print(f"Error getting price estimates: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/time-estimates")
async def get_time_estimates(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate"),
    product_id: Optional[str] = Query(None, description="Optional product ID")
):
    """
    Get time estimates for pickup
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        product_id: Optional product ID
    
    Returns:
        List of time estimates
    """
    try:
        uber_service = get_uber_service()
        times = uber_service.get_time_estimates(latitude, longitude, product_id)
        return {"times": times or []}
    except Exception as e:
        print(f"Error getting time estimates: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/autocomplete")
async def get_autocomplete(
    input_text: str = Query(..., description="Partial address or place name")
):
    """
    Get place autocomplete suggestions
    
    Args:
        input_text: Partial address or place name
    
    Returns:
        List of place suggestions
    """
    try:
        if not input_text or len(input_text) < 2:
            return {"suggestions": []}
        
        gmaps = get_gmaps_service()
        suggestions = gmaps.get_place_autocomplete(input_text)
        return {"suggestions": suggestions}
    except ValueError as e:
        # API key not set or service not initialized
        print(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail="Google Maps API not configured")
    except Exception as e:
        print(f"Error getting autocomplete: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching autocomplete suggestions: {str(e)}"
        )

