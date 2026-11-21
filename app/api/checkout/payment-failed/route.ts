import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/checkout/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { orderId, razorpay_order_id, reason, code, cancelled } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId required." }, { status: 400 });

    const db = await getDb();
    const { data: order } = await db.from("orders").select("id,user_id,payment_status,total_inr,razorpay_order_id").eq("id", orderId).maybeSingle();
    if (!order || order.user_id !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (order.payment_status === "paid") return NextResponse.json({ ok: true, ignored: true });

    await db.from("orders").update({ payment_status: cancelled ? "failed" : "failed", status: cancelled ? "cancelled" : "pending" }).eq("id", orderId).eq("payment_status", "pending");
    await db.from("payment_transactions").insert({
      order_id: orderId,
      user_id: user.id,
      provider: "razorpay",
      provider_order_id: razorpay_order_id || order.razorpay_order_id,
      amount_inr: order.total_inr,
      currency: "INR",
      status: cancelled ? "cancelled" : "failed",
      error_code: code || null,
      error_description: reason || (cancelled ? "Payment cancelled by customer" : "Payment failed"),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to record payment failure." }, { status: 400 });
  }
}