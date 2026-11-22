import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await connectDB();
  await User.findByIdAndUpdate(session.sub, { fullName: String(body.fullName || ""), phone: String(body.phone || "") });
  return NextResponse.json({ ok: true });
}
