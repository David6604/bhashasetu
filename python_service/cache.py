# python_service/cache.py
import aioredis
import json
import os
import hashlib

redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

def _stable_key(src: str, tgt: str, text: str) -> str:
    """
    Deterministic Redis key based on source/target language and text.
    Uses SHA‑256 to avoid collisions and ensure stability across restarts.
    """
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"trans:{src}:{tgt}:{digest}"

async def get_translation_cache(src, tgt, text):
    key = _stable_key(src, tgt, text)
    raw = await redis.get(key)
    return json.loads(raw) if raw else None

async def set_translation_cache(src, tgt, text, translated):
    key = _stable_key(src, tgt, text)
    await redis.set(key, json.dumps({"translated": translated}), ex=86400)