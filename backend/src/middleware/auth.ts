import type { NextFunction, Request, Response } from "express";
import { verifyAdminToken, type AdminTokenPayload } from "../config/tokens.js";
import type { AdminRole } from "../models/AdminUser.js";
import { ApiError } from "../utils/ApiError.js";

export type AuthPayload = AdminTokenPayload;

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

function getToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  const cookieToken = (req as { cookies?: Record<string, unknown> }).cookies?.admin_token;
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  return null;
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next(new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" }));
  try {
    req.auth = verifyAdminToken(token);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token", { code: "INVALID_TOKEN" }));
  }
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" }));
    if (!roles.includes(req.auth.role)) return next(new ApiError(403, "Insufficient permissions", { code: "FORBIDDEN" }));
    next();
  };
}
