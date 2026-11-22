import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/lib/models/Cart";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] }, { status: 401 });
  await connectDB();
  const items = await Cart.find({ user_id: session.sub }).lean();
  return NextResponse.json({ items: items.map((i: any) => ({ key: String(i._id), productId: String(i.product_id), quantity: i.quantity, unitPrice: i.unit_price, selection: i.selection || {} })) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  await connectDB();
  await Cart.deleteMany({ user_id: session.sub });
  if (items.length) {
    await Cart.insertMany(items.map((i: any) => ({ user_id: session.sub, product_id: i.productId, quantity: Math.max(1, Number(i.quantity || 1)), selection: i.selection || {}, unit_price: Number(i.unitPrice || 0) })));
  }
  return NextResponse.json({ ok: true });
}
