import type { NextFunction, Request, Response } from "express";
import {
  verifyAdminToken,
  verifyCustomerToken,
  type AdminTokenPayload,
  type CustomerTokenPayload,
} from "../config/tokens.js";
import { ApiError } from "../utils/ApiError.js";

type StoreAdminRequest = Request & {
  auth?: AdminTokenPayload;
  userAuth?: CustomerTokenPayload;
};

function candidateTokens(req: Request) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  const cookies = (req as { cookies?: Record<string, unknown> }).cookies ?? {};
  const cookieToken = (name: string) => (typeof cookies[name] === "string" ? cookies[name] as string : null);
  return {
    admin: [cookieToken("admin_token"), bearer],
    customer: [cookieToken("vara_session"), bearer],
  };
}

/**
 * The store admin API supports both existing admin sessions: seeded super admins
 * (admin_token) and store admins created through the customer account model.
 * Token classes stay separate; this only accepts either valid class at the boundary.
 */
export function requireStoreAdmin(req: Request, _res: Response, next: NextFunction) {
  const tokens = candidateTokens(req);

  for (const token of tokens.admin) {
    if (!token) continue;
    try {
      (req as StoreAdminRequest).auth = verifyAdminToken(token);
      return next();
    } catch {
      // Try the other token class before rejecting.
    }
  }

  for (const token of tokens.customer) {
    if (!token) continue;
    try {
      const payload = verifyCustomerToken(token);
      if (payload.role === "admin") {
        (req as StoreAdminRequest).userAuth = payload;
        return next();
      }
    } catch {
      // Try the next candidate before rejecting.
    }
  }

  return next(new ApiError(401, "Admin authentication required", { code: "AUTH_REQUIRED" }));
}
