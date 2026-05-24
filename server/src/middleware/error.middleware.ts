import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

export interface CustomError extends Error {
  status?: number;
  details?: any;
}

export function errorMiddleware(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error Middleware] Error occurred: [${req.method}] ${req.url}`);
  console.error(err.stack || err);

  res.status(status).json({
    status: "ERROR",
    message,
    details: err.details || null,
    ...(config.nodeEnv === "development" && { stack: err.stack })
  });
}
