from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@postgres:5432/amazon_clone"
    redis_url: str = "redis://redis:6379"

    # Recommendation settings
    max_recommendations: int = 10
    view_history_days: int = 30  # Consider views from last N days

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
