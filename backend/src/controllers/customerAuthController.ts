import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const COOKIE_NAME = "vara_session";
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(user: { _id: any; email: string; role: string; fullName?: string }) {
  const secret = process.env.AUTH_SECRET || env.ADMIN_JWT_SECRET;
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role, name: user.fullName || "" }, secret, { expiresIn: "7d" });
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(409, "An account with this email already exists.");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: normalizedEmail, passwordHash, fullName: name.trim(), role: "customer" });
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role }, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(401, "Invalid email or password.");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid email or password.");
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role }, token });
});

export const me = asyncHandler(async (req, res) => {
  const auth = (req as any).userAuth;
  if (!auth?.sub) throw new ApiError(401, "Authentication required");
  const user = await User.findById(auth.sub).select("email fullName role phone");
  if (!user) throw new ApiError(401, "Authentication required");
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role, phone: user.phone || "" } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email) throw new ApiError(400, "Email is required");
  const user = await User.findOne({ email });
  if (user) {
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    (user as any).resetTokenHash = hash;
    (user as any).resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const base = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173";
    const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    console.log("[vara] Password reset link:", link);
  }
  res.json({ ok: true, message: "If an account exists for this email, a reset link has been generated." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body ?? {};
  if (!email || !token || !password) throw new ApiError(400, "Missing required fields");
  if (String(password).length < 8) throw new ApiError(400, "Password must be at least 8 characters");
  const crypto = await import("crypto");
  const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const user = await User.findOne({ email: String(email).toLowerCase().trim(), resetTokenHash: hash, resetTokenExpires: { $gt: new Date() } });
  if (!user) throw new ApiError(400, "Invalid or expired reset link");
  user.passwordHash = await bcrypt.hash(String(password), 12);
  (user as any).resetTokenHash = null;
  (user as any).resetTokenExpires = null;
  await user.save();
  res.json({ ok: true });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const auth = (req as any).userAuth;
  if (!auth?.sub) throw new ApiError(401, "Authentication required");
  const { name, phone } = req.body ?? {};
  const user = await User.findById(auth.sub);
  if (!user) throw new ApiError(404, "User not found");
  if (typeof name === "string") user.fullName = name.trim();
  if (typeof phone === "string") (user as any).phone = phone.trim();
  await user.save();
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role, phone: (user as any).phone || "" } });
});
