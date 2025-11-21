from fastapi import APIRouter, HTTPException, Query
from ..models.schemas import (
    RecommendationResponse,
    ViewEventCreate,
    ProductRecommendation,
)
from ..services.recommender import RecommenderService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50)
):
    """
    Get personalized product recommendations for a user.
    """
    try:
        recommendations, source = await RecommenderService.get_recommendations_for_user(
            user_id, limit
        )
        return RecommendationResponse(
            recommendations=recommendations,
            source=source
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/similar/{product_id}", response_model=RecommendationResponse)
async def get_similar_products(
    product_id: int,
    limit: int = Query(default=10, ge=1, le=50)
):
    """
    Get products similar to a given product.
    """
    try:
        recommendations = await RecommenderService.get_similar_products(
            product_id, limit
        )
        return RecommendationResponse(
            recommendations=recommendations,
            source="similar"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/views")
async def record_view(event: ViewEventCreate):
    """
    Record a product view event.
    """
    try:
        success = await RecommenderService.record_view(
            event.user_id, event.product_id
        )
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
