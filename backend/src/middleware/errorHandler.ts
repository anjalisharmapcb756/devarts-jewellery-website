import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : "Internal server error";
  const details = err instanceof ApiError ? err.details : undefined;

  if (env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === "development" && !(err instanceof ApiError) ? { stack: (err as Error).stack } : {}),
    },
  });
}
