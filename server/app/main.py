"""
Main FastAPI application for Uber AI Clone
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.routes import router
from app.core.config import Config

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Uber AI Clone API",
    description="AI-powered ride booking service with travel suggestions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api", tags=["api"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Uber AI Clone API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/",
            "book_ride": "/api/book-ride",
            "products": "/api/products",
            "price_estimates": "/api/price-estimates",
            "time_estimates": "/api/time-estimates",
            "autocomplete": "/api/autocomplete"
        }
    }

if __name__ == "__main__":
    import uvicorn
    Config.validate()
    uvicorn.run(
        "app.main:app",
        host=Config.SERVER_HOST,
        port=Config.SERVER_PORT,
        reload=True
    )