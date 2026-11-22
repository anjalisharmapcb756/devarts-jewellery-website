import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  await connectDB();
  const user = await User.findById(session.sub).lean();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: String(user._id), email: user.email, fullName: user.fullName || "", phone: user.phone || "", role: user.role } });
}
