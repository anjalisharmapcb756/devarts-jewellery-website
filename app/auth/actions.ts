"use server";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "@/lib/auth/session";

function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name) return { error: "Full name is required." };
  if (!validEmail(email)) return { error: "A valid email is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) return { error: "An account with this email already exists." };
  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash, fullName: name, role: "customer" });
  const token = await createSessionToken({ sub: String(user._id), email: user.email, role: user.role, name: user.fullName });
  await setSessionCookie(token);
  return { ok: true };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/account");
  if (!validEmail(email)) return { error: "A valid email is required." };
  if (!password) return { error: "Password is required." };
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return { error: "Invalid email or password." };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };
  const token = await createSessionToken({ sub: String(user._id), email: user.email, role: user.role, name: user.fullName });
  await setSessionCookie(token);
  return { ok: true, next: user.role === "admin" && !next.startsWith("/admin") ? "/admin" : next };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
