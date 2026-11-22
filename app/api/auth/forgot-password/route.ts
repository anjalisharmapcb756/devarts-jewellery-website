import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") return NextResponse.json({ error: "Email is required" }, { status: 400 });
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenHash = hash;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    console.log("[vara] Password reset link:", link);
  }
  return NextResponse.json({ ok: true, message: "If an account exists for this email, a reset link has been generated. In development, check the server console." });
}
