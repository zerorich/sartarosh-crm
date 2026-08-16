import { redis } from "../config/redis";

export const CACHE_KEYS = {
  settings: "cache:admin-settings",
  salonList: (page: number, limit: number) => `cache:salons:list:${page}:${limit}`,
  salonNearby: (lat: number, lng: number, radius: number) =>
    `cache:salons:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`,
} as const;

export const CACHE_TTL = {
  settings: 300,
  salonPublic: 45,
} as const;

function isRedisReady() {
  return redis.status === "ready";
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisReady()) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!isRedisReady()) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Redis is optional for cache — miss and continue from the database.
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!isRedisReady()) return;
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}
