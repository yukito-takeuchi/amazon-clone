from typing import List, Optional
from ..database import get_pool
from ..models.schemas import ProductRecommendation
from ..config import get_settings

settings = get_settings()


class RecommenderService:
    """
    Phase 1: Simple recommendation based on:
    1. User's view history (same category products)
    2. Popular products (most viewed)
    """

    @staticmethod
    async def get_recommendations_for_user(
        user_id: str,
        limit: int = 10
    ) -> tuple[List[ProductRecommendation], str]:
        """
        Get personalized recommendations for a user.
        Returns (recommendations, source)
        """
        pool = await get_pool()

        # First, try to get recommendations based on view history
        recommendations = await RecommenderService._get_category_based_recommendations(
            pool, user_id, limit
        )

        if recommendations:
            return recommendations, "category"

        # Fallback to popular products
        recommendations = await RecommenderService._get_popular_products(pool, limit)
        return recommendations, "popular"

    @staticmethod
    async def _get_category_based_recommendations(
        pool,
        user_id: str,
        limit: int
    ) -> List[ProductRecommendation]:
        """
        Get products from categories the user has viewed.
        Excludes products the user has already viewed.
        """
        query = """
            WITH user_categories AS (
                -- Get categories from user's view history
                SELECT DISTINCT p.category_id, COUNT(*) as view_count
                FROM product_views pv
                JOIN products p ON pv.product_id = p.id
                WHERE pv.user_id = $1
                  AND pv.viewed_at > NOW() - INTERVAL '%s days'
                  AND p.category_id IS NOT NULL
                GROUP BY p.category_id
                ORDER BY view_count DESC
                LIMIT 5
            ),
            viewed_products AS (
                -- Get products user has already viewed
                SELECT DISTINCT product_id
                FROM product_views
                WHERE user_id = $1
            )
            SELECT
                p.id,
                p.name,
                p.price,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as image_url,
                p.category_id,
                -- Score based on category popularity and product popularity
                (uc.view_count * 10 + COALESCE(
                    (SELECT COUNT(*) FROM product_views WHERE product_id = p.id), 0
                )) as score
            FROM products p
            JOIN user_categories uc ON p.category_id = uc.category_id
            WHERE p.is_active = TRUE
              AND p.id NOT IN (SELECT product_id FROM viewed_products)
              AND p.stock > 0
            ORDER BY score DESC
            LIMIT $2
        """ % settings.view_history_days

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id, limit)

        return [
            ProductRecommendation(
                id=row["id"],
                name=row["name"],
                price=row["price"],
                image_url=row["image_url"],
                category_id=row["category_id"],
                score=float(row["score"])
            )
            for row in rows
        ]

    @staticmethod
    async def _get_popular_products(
        pool,
        limit: int
    ) -> List[ProductRecommendation]:
        """
        Get most viewed products (popular items).
        """
        query = """
            SELECT
                p.id,
                p.name,
                p.price,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as image_url,
                p.category_id,
                COUNT(pv.id) as view_count
            FROM products p
            LEFT JOIN product_views pv ON p.id = pv.product_id
            WHERE p.is_active = TRUE
              AND p.stock > 0
            GROUP BY p.id
            ORDER BY view_count DESC, p.created_at DESC
            LIMIT $1
        """

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, limit)

        return [
            ProductRecommendation(
                id=row["id"],
                name=row["name"],
                price=row["price"],
                image_url=row["image_url"],
                category_id=row["category_id"],
                score=float(row["view_count"]) if row["view_count"] else 0
            )
            for row in rows
        ]

    @staticmethod
    async def get_similar_products(
        product_id: int,
        limit: int = 10
    ) -> List[ProductRecommendation]:
        """
        Get products similar to a given product (same category).
        """
        pool = await get_pool()

        query = """
            WITH target_product AS (
                SELECT category_id FROM products WHERE id = $1
            )
            SELECT
                p.id,
                p.name,
                p.price,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as image_url,
                p.category_id,
                COALESCE(
                    (SELECT COUNT(*) FROM product_views WHERE product_id = p.id), 0
                ) as score
            FROM products p, target_product tp
            WHERE p.category_id = tp.category_id
              AND p.id != $1
              AND p.is_active = TRUE
              AND p.stock > 0
            ORDER BY score DESC
            LIMIT $2
        """

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, product_id, limit)

        return [
            ProductRecommendation(
                id=row["id"],
                name=row["name"],
                price=row["price"],
                image_url=row["image_url"],
                category_id=row["category_id"],
                score=float(row["score"])
            )
            for row in rows
        ]

    @staticmethod
    async def record_view(user_id: str, product_id: int) -> bool:
        """
        Record a product view event.
        """
        pool = await get_pool()

        query = """
            INSERT INTO product_views (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET viewed_at = NOW(), view_count = product_views.view_count + 1
            RETURNING id
        """

        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, user_id, product_id)

        return result is not None
