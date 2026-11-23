import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export type UserAuthPayload = { sub: string; email: string; role: "customer" | "admin"; name?: string };

declare global {
  namespace Express {
    interface Request {
      userAuth?: UserAuthPayload;
    }
  }
}

function getToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  const cookieToken = (req as any).cookies?.vara_session;
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  return null;
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next(new ApiError(401, "Authentication required"));
  try {
    const secret = process.env.AUTH_SECRET || env.ADMIN_JWT_SECRET;
    const payload = jwt.verify(token, secret) as UserAuthPayload;
    if (!payload?.sub) return next(new ApiError(401, "Invalid token"));
    req.userAuth = payload;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const secret = process.env.AUTH_SECRET || env.ADMIN_JWT_SECRET;
    const payload = jwt.verify(token, secret) as UserAuthPayload;
    if (payload?.sub) req.userAuth = payload;
  } catch {}
  next();
}

export function requireAdminRole(req: Request, _res: Response, next: NextFunction) {
  if (!req.userAuth) return next(new ApiError(401, "Authentication required"));
  if (req.userAuth.role !== "admin") return next(new ApiError(403, "Admin access required"));
  next();
}
