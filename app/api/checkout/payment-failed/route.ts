import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { PaymentTransaction } from "@/lib/models/Payment";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const user = { id: session.sub };
    const { orderId, razorpay_order_id, reason, code, cancelled } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId required." }, { status: 400 });
    await connectDB();
    const order: any = await Order.findById(orderId).lean();
    if (!order || String(order.user_id) !== String(user.id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.payment_status === "paid") return NextResponse.json({ ok: true, ignored: true });
    await Order.findOneAndUpdate({ _id: orderId, payment_status: "pending" }, { payment_status: "failed", status: cancelled ? "cancelled" : "pending" });
    await PaymentTransaction.create({ order_id: orderId, user_id: user.id, provider: "razorpay", provider_order_id: razorpay_order_id || order.razorpay_order_id, amount_inr: order.total_inr, currency: "INR", status: cancelled ? "cancelled" : "failed", error_code: code || null, error_description: reason || (cancelled ? "Payment cancelled by customer" : "Payment failed") });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to record payment failure." }, { status: 400 });
  }
}
