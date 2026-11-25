import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Provider webhooks are authenticated by signature, not cookies, and arrive
// without an Origin header. Add a path here if/when a webhook is implemented.
const WEBHOOK_PATHS = new Set(["/api/checkout/razorpay-webhook", "/api/webhooks/razorpay"]);

/**
 * Defence-in-depth for cookie-authenticated state changes. Browsers are also
 * restricted by CORS; this rejects a cross-site Origin even when a non-browser
 * client supplies one. Requests without an Origin (curl, server-to-server,
 * webhooks) are allowed.
 */
export function verifyOrigin(req: Request, _res: Response, next: NextFunction) {
  if (!STATE_CHANGING_METHODS.has(req.method)) return next();
  if (WEBHOOK_PATHS.has(req.path)) return next();

  const origin = req.headers.origin;
  if (typeof origin !== "string" || !origin) return next();

  let allowed = false;
  try {
    allowed = env.corsOrigins.includes(new URL(origin).origin);
  } catch {
    allowed = false;
  }
  if (!allowed) {
    return next(new ApiError(403, "Origin not allowed", { code: "ORIGIN_NOT_ALLOWED" }));
  }
  next();
}
