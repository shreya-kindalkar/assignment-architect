import { Request, Response, NextFunction } from "express";
import { RATE_LIMIT } from "../constants/index.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (per IP)
const store = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

function createLimiter(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    const now = Date.now();

    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        success: false,
        error: "Too many requests. Please slow down.",
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

// General API rate limiter: 100 req / 15 min
export const generalRateLimiter = createLimiter(
  RATE_LIMIT.WINDOW_MS,
  RATE_LIMIT.MAX_REQUESTS
);

// Strict limiter for create/regenerate: 10 req / 1 min
export const createRateLimiter = createLimiter(
  RATE_LIMIT.CREATE_WINDOW_MS,
  RATE_LIMIT.CREATE_MAX_REQUESTS
);

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);
