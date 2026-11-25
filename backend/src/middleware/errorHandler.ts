import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found", { code: "NOT_FOUND" }));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : "Internal server error";
  const code = err instanceof ApiError ? err.code : undefined;
  const details = err instanceof ApiError ? err.details : undefined;

  if (env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === "development" && !(err instanceof ApiError) ? { stack: (err as Error).stack } : {}),
    },
  });
}
