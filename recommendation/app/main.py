from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import get_pool, close_pool
from .routers import recommendations
from .models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database pool
    print("🚀 Starting Recommendation Service...")
    await get_pool()
    print("✅ Database connected")
    yield
    # Shutdown: Close database pool
    print("🛑 Shutting down Recommendation Service...")
    await close_pool()


app = FastAPI(
    title="Recommendation Service",
    description="Product recommendation microservice for Amazon Clone",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recommendations.router, prefix="/api")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return HealthResponse(status="healthy", database="connected")
    except Exception as e:
        return HealthResponse(status="unhealthy", database=str(e))


@app.get("/")
async def root():
    return {
        "service": "Recommendation Service",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/api/recommendations/{user_id}",
            "similar": "/api/recommendations/similar/{product_id}",
            "record_view": "/api/recommendations/views",
            "health": "/health"
        }
    }
