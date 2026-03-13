// server/cache.js
import Redis from "ioredis";

let redis = null;

// Only connect to Redis if REDIS_URL exists
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("error", (err) => {
    console.warn("Redis connection error:", err.message);
  });
}

export { redis };

export function cacheKey({ sourceLang, targetLang, text }) {
  const raw = `${sourceLang}:${targetLang}:${text}`;
  return `translation:${Buffer.from(raw).toString("base64")}`;
}