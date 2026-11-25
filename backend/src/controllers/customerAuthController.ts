import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { signCustomerToken } from "../config/tokens.js";
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

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(1).max(200),
  password: z.string().min(8).max(200),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
});

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid request.", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }
  return parsed.data;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = parseBody(registerSchema, req.body);
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(409, "An account with this email already exists.", { code: "EMAIL_IN_USE" });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: normalizedEmail, passwordHash, fullName: name, role: "customer" });
  // Token is set as an httpOnly cookie only; no raw JWT in the response body.
  res.cookie(COOKIE_NAME, signCustomerToken(user), cookieOptions);
  res.status(201).json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = parseBody(loginSchema, req.body);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, "Invalid email or password.", { code: "INVALID_CREDENTIALS" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid email or password.", { code: "INVALID_CREDENTIALS" });
  res.cookie(COOKIE_NAME, signCustomerToken(user), cookieOptions);
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role } });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.userAuth?.sub) throw new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" });
  const user = await User.findById(req.userAuth.sub).select("email fullName role phone");
  if (!user) throw new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" });
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role, phone: user.phone || "" } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = parseBody(forgotPasswordSchema, req.body);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    (user as any).resetTokenHash = hash;
    (user as any).resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // Delivery is deliberately not implemented: selecting/configuring a real
    // email provider is an external decision and credential. The link must be
    // built with env.frontendUrl (never a localhost fallback) when a provider
    // is chosen; the reset token is never logged or returned in a response.
  }
  res.json({ ok: true, message: "If an account exists for this email, a reset link has been generated." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = parseBody(resetPasswordSchema, req.body);
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetTokenHash: hash,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "Invalid or expired reset link", { code: "INVALID_RESET_TOKEN" });
  user.passwordHash = await bcrypt.hash(password, 12);
  (user as any).resetTokenHash = null;
  (user as any).resetTokenExpires = null;
  await user.save();
  res.json({ ok: true });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.userAuth?.sub) throw new ApiError(401, "Authentication required", { code: "AUTH_REQUIRED" });
  const { name, phone } = parseBody(profileSchema, req.body);
  const user = await User.findById(req.userAuth.sub);
  if (!user) throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  if (name !== undefined) user.fullName = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  res.json({ user: { id: String(user._id), email: user.email, name: user.fullName, role: user.role, phone: user.phone || "" } });
});
