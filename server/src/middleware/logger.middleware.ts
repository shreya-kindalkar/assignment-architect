import { Request, Response, NextFunction } from "express";

/**
 * Structured request logger middleware.
 * Logs method, path, status code, and response time for every request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    console.log(`[${level}] ${method} ${url} → ${status} (${duration}ms)`);
  });

  next();
}
