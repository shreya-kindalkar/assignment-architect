// ============================================================
// Shared utility helpers
// ============================================================

/**
 * Wraps an async route handler to forward errors to Express error middleware.
 */
import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Sleeps for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON, returning null on failure.
 */
export function safeJsonParse<T = unknown>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Generates a short random alphanumeric ID.
 */
export function shortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Formats a Date object to a readable string.
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
