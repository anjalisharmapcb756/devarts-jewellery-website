import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const booleanFromEnv = z
  .enum(["true", "false"])
  .default("true")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  // Customer sessions and admin sessions must use different keys.
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  ADMIN_JWT_SECRET: z.string().min(16, "ADMIN_JWT_SECRET must be at least 16 characters"),
  // Required so password-reset links are never built from an unsafe localhost fallback.
  FRONTEND_URL: z.string().url("FRONTEND_URL must be an absolute URL"),
  RAZORPAY_KEY_ID: optionalSecret,
  RAZORPAY_KEY_SECRET: optionalSecret,
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  RATE_LIMIT_ENABLED: booleanFromEnv,
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_CHECKOUT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_NEWSLETTER_MAX: z.coerce.number().int().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;
if (raw.AUTH_SECRET === raw.ADMIN_JWT_SECRET) {
  console.error("Invalid environment variables: AUTH_SECRET and ADMIN_JWT_SECRET must be different values");
  process.exit(1);
}

const razorpayKeyId = raw.RAZORPAY_KEY_ID?.trim() || null;
const razorpayKeySecret = raw.RAZORPAY_KEY_SECRET?.trim() || null;

export const env = {
  ...raw,
  corsOrigins: raw.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  razorpayKeyId,
  razorpayKeySecret,
  razorpayEnabled: Boolean(razorpayKeyId && razorpayKeySecret),
  frontendUrl: raw.FRONTEND_URL.trim().replace(/\/+$/, ""),
};
