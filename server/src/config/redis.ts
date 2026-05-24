import { Redis } from "ioredis";
import { config } from "./env.js";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

if (config.redisUrl) {
  try {
    console.log(`[Redis Config] Attempting connection to: ${config.redisUrl}`);
    // Disable max retries or use short connection timeout to avoid blocking server bootstrap
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 0,
      retryStrategy: () => null, // disable auto-retry — we use memory fallback
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on("connect", () => {
      console.log("[Redis Config] Successfully connected to Redis server.");
      isRedisAvailable = true;
    });

    redisClient.on("error", () => {
      // Suppress repeated error logs — fallback is already active
      isRedisAvailable = false;
    });

    // Fire connection attempt once
    redisClient.connect().catch((err) => {
      console.warn(`[Redis Config] Redis unavailable (${err.message}). Using in-memory cache fallback.`);
      isRedisAvailable = false;
    });
  } catch (err: any) {
    console.warn("[Redis Config] Redis setup failed, utilizing mock database fallback:", err.message);
    isRedisAvailable = false;
  }
} else {
  console.log("[Redis Config] No REDIS_URL provided. Utilizing memory cache fallback.");
}

// In-Memory Cache Fallback implementation
const memoryCache = new Map<string, string>();

export const cacheService = {
  isAvailable: () => isRedisAvailable,
  
  get: async (key: string): Promise<string | null> => {
    if (isRedisAvailable && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        return memoryCache.get(key) || null;
      }
    }
    return memoryCache.get(key) || null;
  },

  set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
    if (isRedisAvailable && redisClient) {
      try {
        if (ttlSeconds) {
          await redisClient.set(key, value, "EX", ttlSeconds);
        } else {
          await redisClient.set(key, value);
        }
        return;
      } catch {
        // Fallback below
      }
    }
    memoryCache.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => memoryCache.delete(key), ttlSeconds * 1000);
    }
  },

  del: async (key: string): Promise<void> => {
    if (isRedisAvailable && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch {
        // Fallback
      }
    }
    memoryCache.delete(key);
  },

  clear: async (): Promise<void> => {
    if (isRedisAvailable && redisClient) {
      try {
        await redisClient.flushall();
        return;
      } catch {
        // Fallback
      }
    }
    memoryCache.clear();
  }
};

export { redisClient, isRedisAvailable };
