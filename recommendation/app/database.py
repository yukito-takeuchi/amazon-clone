import asyncpg
from typing import Optional
from .config import get_settings

settings = get_settings()

# Connection pool
pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        # Convert postgresql:// to postgres:// for asyncpg
        db_url = settings.database_url.replace("postgresql://", "postgres://")
        pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
    return pool


async def close_pool():
    global pool
    if pool:
        await pool.close()
        pool = None
