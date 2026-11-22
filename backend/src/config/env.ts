import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  ADMIN_JWT_SECRET: z.string().min(16, "ADMIN_JWT_SECRET must be at least 16 characters"),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;
export const env = {
  ...raw,
  corsOrigins: raw.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
};
