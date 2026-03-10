// server/cache.js
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL);

export function cacheKey({ sourceLang, targetLang, text }) {
  const raw = `${sourceLang}:${targetLang}:${text}`;
  return `translation:${Buffer.from(raw).toString("base64")}`;
}