import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, OrderItem } from "@/lib/models/Order";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const orders = await Order.find({ user_id: session.sub }).sort({ placed_at: -1, createdAt: -1 }).lean();
  const ids = orders.map((o: any) => o._id);
  const items = await OrderItem.find({ order_id: { $in: ids } }).lean();
  const itemsByOrder: Record<string, any[]> = {};
  for (const it of items as any[]) { const k = String(it.order_id); (itemsByOrder[k] ||= []).push(it); }
  return NextResponse.json({ orders: orders.map((o: any) => ({
    id: String(o._id), orderNumber: o.order_number, date: o.placed_at || o.createdAt, total: Number(o.total_inr || 0),
    status: o.payment_status === "paid" ? o.status : o.payment_status, paymentStatus: o.payment_status,
    items: (itemsByOrder[String(o._id)] || []).map((i: any) => i.product_name),
  })) });
}
