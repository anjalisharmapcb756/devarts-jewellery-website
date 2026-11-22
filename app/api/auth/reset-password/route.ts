import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  const { email, token, password } = await req.json().catch(() => ({}));
  if (!email || !token || !password) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  await connectDB();
  const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const user = await User.findOne({ email: String(email).toLowerCase().trim(), resetTokenHash: hash, resetTokenExpires: { $gt: new Date() } });
  if (!user) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  user.passwordHash = await bcrypt.hash(String(password), 12);
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  await user.save();
  return NextResponse.json({ ok: true });
}
