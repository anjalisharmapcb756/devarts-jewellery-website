import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

type RateBucket = { count: number; resetAt: number };

const buckets = new Map<string, RateBucket>();
let lastCleanup = 0;

function clientKey(req: Request, scope: string) {
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = typeof forwarded === "string"
    ? forwarded.split(",")[0]?.trim()
    : req.socket.remoteAddress || "unknown";
  return `${scope}:${rawIp}`;
}

function cleanup(now: number) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Lightweight in-memory limiter; no new dependency and safe for single-instance deploys. */
export function rateLimit(
  scope: string,
  max = env.RATE_LIMIT_MAX,
  windowMs = env.RATE_LIMIT_WINDOW_MS,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!env.RATE_LIMIT_ENABLED || env.NODE_ENV === "test") return next();

    const now = Date.now();
    const key = clientKey(req, scope);
    cleanup(now);
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 1, resetAt: now + windowMs };
      buckets.set(key, bucket);
    } else if (bucket.count >= max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return next(new ApiError(429, "Too many requests. Please try again shortly.", { code: "RATE_LIMITED" }));
    } else {
      bucket.count += 1;
    }

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
    next();
  };
}

export const authRateLimit = rateLimit("auth", env.RATE_LIMIT_AUTH_MAX);
export const checkoutRateLimit = rateLimit("checkout", env.RATE_LIMIT_CHECKOUT_MAX);
export const newsletterRateLimit = rateLimit("newsletter", env.RATE_LIMIT_NEWSLETTER_MAX);
