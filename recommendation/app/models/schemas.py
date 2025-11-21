from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ViewEventCreate(BaseModel):
    user_id: str
    product_id: int


class ViewEvent(BaseModel):
    id: int
    user_id: str
    product_id: int
    viewed_at: datetime


class ProductRecommendation(BaseModel):
    id: int
    name: str
    price: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    score: float  # Recommendation score


class RecommendationResponse(BaseModel):
    recommendations: List[ProductRecommendation]
    source: str  # "history", "popular", "category", etc.


class HealthResponse(BaseModel):
    status: str
    database: str
