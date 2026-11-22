import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import type { AdminRole } from "../models/AdminUser.js";

export type AuthPayload = { sub: string; email: string; role: AdminRole };

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
  const cookieToken = (req as any).cookies?.admin_token;
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  return null;
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next(new ApiError(401, "Authentication required"));
  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as AuthPayload;
    if (!payload?.sub || !payload?.role) return next(new ApiError(401, "Invalid token"));
    req.auth = payload;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new ApiError(401, "Authentication required"));
    if (!roles.includes(req.auth.role)) return next(new ApiError(403, "Insufficient permissions"));
    next();
  };
}
