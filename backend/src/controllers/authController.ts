import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
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

function signToken(user: { _id: any; email: string; role: string }) {
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, env.ADMIN_JWT_SECRET, { expiresIn: "8h" });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ token, admin: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) throw new ApiError(401, "Authentication required");
  const user = await AdminUser.findById(req.auth.sub).select("email name role isActive");
  if (!user || !user.isActive) throw new ApiError(401, "Authentication required");
  res.json({ admin: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});
