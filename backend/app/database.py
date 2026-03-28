import asyncpg
from .config import settings

pool: asyncpg.Pool | None = None

async def create_pool():
    global pool
    pool = await asyncpg.create_pool(settings.database_url, min_size=2, max_size=10)
    return pool

async def close_pool():
    global pool
    if pool:
        await pool.close()

def get_pool() -> asyncpg.Pool:
    assert pool is not None, "Database pool not initialized"
    return pool
