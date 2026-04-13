import redis.asyncio as aioredis
from app.config import get_settings

settings = get_settings()

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def close_redis():
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None


async def set_session(key: str, value: str, ttl: int | None = None) -> None:
    client = await get_redis()
    ttl = ttl or settings.REDIS_SESSION_TTL
    await client.setex(key, ttl, value)


async def get_session(key: str) -> str | None:
    client = await get_redis()
    return await client.get(key)


async def delete_session(key: str) -> None:
    client = await get_redis()
    await client.delete(key)


async def invalidate_token(token: str, ttl: int) -> None:
    client = await get_redis()
    await client.setex(f"blacklist:{token}", ttl, "1")


async def is_token_blacklisted(token: str) -> bool:
    client = await get_redis()
    return await client.exists(f"blacklist:{token}") == 1
