import type { NextFunction, Request, Response } from "express";
import { verifyCustomerToken, type CustomerTokenPayload } from "../config/tokens.js";
import { ApiError } from "../utils/ApiError.js";

export type UserAuthPayload = CustomerTokenPayload;

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
  const cookieToken = (req as { cookies?: Record<string, unknown> }).cookies?.vara_session;
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  return null;
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next(new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" }));
  try {
    req.userAuth = verifyCustomerToken(token);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token", { code: "INVALID_TOKEN" }));
  }
}

export function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return next();
  try {
    req.userAuth = verifyCustomerToken(token);
  } catch {
    // An invalid optional token is treated as an anonymous request.
  }
  next();
}

export function requireAdminRole(req: Request, _res: Response, next: NextFunction) {
  if (!req.userAuth) return next(new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" }));
  if (req.userAuth.role !== "admin") return next(new ApiError(403, "Admin access required", { code: "FORBIDDEN" }));
  next();
}
