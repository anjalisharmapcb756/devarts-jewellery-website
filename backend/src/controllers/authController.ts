import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { signAdminToken } from "../config/tokens.js";
import { AdminUser } from "../models/AdminUser.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_NAME = "admin_token";
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, "Invalid credentials", { code: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials", { code: "INVALID_CREDENTIALS" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials", { code: "INVALID_CREDENTIALS" });

  user.lastLoginAt = new Date();
  await user.save();

  // The token is delivered only in an httpOnly cookie; never in the response body.
  res.cookie(COOKIE_NAME, signAdminToken(user), cookieOptions);
  res.json({ admin: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" });
  const user = await AdminUser.findById(req.auth.sub).select("email name role isActive");
  if (!user || !user.isActive) throw new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" });
  res.json({ admin: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});
