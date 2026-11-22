import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wishlist } from "@/lib/models/Cart";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] }, { status: 401 });
  await connectDB();
  const items = await Wishlist.find({ user_id: session.sub }).lean();
  return NextResponse.json({ items: items.map((i: any) => String(i.product_id)) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.items) ? body.items.map(String) : [];
  await connectDB();
  await Wishlist.deleteMany({ user_id: session.sub });
  if (ids.length) {
    await Wishlist.insertMany(ids.map((product_id: string) => ({ user_id: session.sub, product_id })));
  }
  return NextResponse.json({ ok: true });
}
