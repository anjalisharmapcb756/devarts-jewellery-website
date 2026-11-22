import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import { Order, OrderItem } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { PaymentTransaction, Coupon } from "@/lib/models/Payment";

function getSecret() { return process.env.RAZORPAY_KEY_SECRET || ""; }
function getCreds() { const keyId = process.env.RAZORPAY_KEY_ID; const keySecret = process.env.RAZORPAY_KEY_SECRET; if (!keyId || !keySecret) return null; return { keyId, keySecret }; }

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const user = { id: session.sub };
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) return NextResponse.json({ error: "Missing payment verification data." }, { status: 400 });
    const secret = getSecret();
    if (!secret) return NextResponse.json({ error: "Razorpay secret not configured." }, { status: 500 });
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });

    await connectDB();
    const order: any = await Order.findById(orderId).lean();
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (String(order.user_id) !== String(user.id)) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    if (order.payment_status === "paid" && order.razorpay_payment_id === razorpay_payment_id) return NextResponse.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number, alreadyProcessed: true });
    if (order.razorpay_payment_id && order.razorpay_payment_id !== razorpay_payment_id) return NextResponse.json({ error: "Order already has a different payment." }, { status: 409 });

    const creds = getCreds();
    if (creds) {
      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
      const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, { headers: { Authorization: `Basic ${auth}` } });
      const pay = await payRes.json();
      if (!payRes.ok) return NextResponse.json({ error: "Failed to verify payment with Razorpay." }, { status: 400 });
      if (pay.order_id !== razorpay_order_id) return NextResponse.json({ error: "Payment does not match order." }, { status: 400 });
      const expectedAmount = Math.round(Number(order.total_inr) * 100);
      if (Number(pay.amount) !== expectedAmount) return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
      if (!["captured", "authorized"].includes(pay.status)) return NextResponse.json({ error: `Payment not captured (status: ${pay.status}).` }, { status: 400 });
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();
    for (const item of items as any[]) {
      const prod: any = await Product.findById(item.product_id).lean();
      if (!prod || prod.is_active === false) return NextResponse.json({ error: `${item.product_name} is unavailable.` }, { status: 400 });
      if (Number(prod.stock_quantity ?? 0) < Number(item.quantity)) return NextResponse.json({ error: `Insufficient stock for ${item.product_name}.` }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate({ _id: order._id, payment_status: "pending" }, { status: "confirmed", payment_status: "paid", razorpay_payment_id, paid_at: new Date(), payment_method: "razorpay" }, { new: true });
    if (!updated) return NextResponse.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number, alreadyProcessed: true });

    for (const item of items as any[]) { if (!item.product_id) continue; await Product.findByIdAndUpdate(item.product_id, { $inc: { stock_quantity: -Number(item.quantity) } }); }
    await PaymentTransaction.create({ order_id: order._id, user_id: user.id, provider: "razorpay", provider_order_id: razorpay_order_id, provider_payment_id: razorpay_payment_id, provider_signature: razorpay_signature, amount_inr: order.total_inr, currency: "INR", status: "verified" });
    if (order.coupon_id) await Coupon.findByIdAndUpdate(order.coupon_id, { $inc: { used_count: 1 } });
    return NextResponse.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Payment verification failed." }, { status: 400 });
  }
}
