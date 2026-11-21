import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/checkout/server";

function getSecret() { return process.env.RAZORPAY_KEY_SECRET || ""; }
function getCreds() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing payment verification data." }, { status: 400 });
    }

    const secret = getSecret();
    if (!secret) return NextResponse.json({ error: "Razorpay secret not configured." }, { status: 500 });

    // 1) Verify signature
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const db = await getDb();

    // 2) Load order and ensure it belongs to user
    const { data: order, error: orderErr } = await db.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle();
    if (orderErr || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.user_id !== user.id) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

    // 3) Idempotency: already paid
    if (order.payment_status === "paid" && order.razorpay_payment_id === razorpay_payment_id) {
      return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.order_number, alreadyProcessed: true });
    }
    if (order.razorpay_payment_id && order.razorpay_payment_id !== razorpay_payment_id) {
      return NextResponse.json({ error: "Order already has a different payment." }, { status: 409 });
    }

    // 4) Verify with Razorpay API (amount/status)
    const creds = getCreds();
    if (creds) {
      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
      const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      const pay = await payRes.json();
      if (!payRes.ok) return NextResponse.json({ error: "Failed to verify payment with Razorpay." }, { status: 400 });
      if (pay.order_id !== razorpay_order_id) return NextResponse.json({ error: "Payment does not match order." }, { status: 400 });
      const expectedAmount = Math.round(Number(order.total_inr) * 100);
      if (Number(pay.amount) !== expectedAmount) return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
      if (!["captured", "authorized"].includes(pay.status)) return NextResponse.json({ error: `Payment not captured (status: ${pay.status}).` }, { status: 400 });
    }

    // 5) Validate stock again before finalizing
    for (const item of order.order_items ?? []) {
      const { data: prod } = await db.from("products").select("stock_quantity, is_active, name").eq("id", item.product_id).maybeSingle();
      if (!prod || prod.is_active === false) return NextResponse.json({ error: `${item.product_name} is unavailable.` }, { status: 400 });
      if (Number(prod.stock_quantity ?? 0) < Number(item.quantity)) return NextResponse.json({ error: `Insufficient stock for ${item.product_name}.` }, { status: 400 });
    }

    // 6) Mark order paid
    const { error: updErr } = await db.from("orders").update({
      status: "confirmed",
      payment_status: "paid",
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
      payment_method: "razorpay",
    }).eq("id", order.id).eq("payment_status", "pending"); // optimistic guard
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // 7) Decrement stock (best-effort with RPC; fallback to direct update)
    for (const item of order.order_items ?? []) {
      if (!item.product_id) continue;
      const { error: rpcErr } = await db.rpc("decrement_product_stock", { p_product_id: item.product_id, p_quantity: Number(item.quantity) });
      if (rpcErr) {
        // fallback: direct update guarded
        await db.from("products").update({ stock_quantity: Math.max(0, Number((await db.from("products").select("stock_quantity").eq("id", item.product_id).single()).data?.stock_quantity ?? 0) - Number(item.quantity)) }).eq("id", item.product_id);
      }
    }

    // 8) Record transaction
    await db.from("payment_transactions").insert({
      order_id: order.id,
      user_id: user.id,
      provider: "razorpay",
      provider_order_id: razorpay_order_id,
      provider_payment_id: razorpay_payment_id,
      provider_signature: razorpay_signature,
      amount_inr: order.total_inr,
      currency: "INR",
      status: "verified",
    });

    // 9) Increment coupon usage
    if (order.coupon_id) {
      const { data: c } = await db.from("coupons").select("used_count").eq("id", order.coupon_id).maybeSingle();
      if (c) await db.from("coupons").update({ used_count: Number(c.used_count ?? 0) + 1 }).eq("id", order.coupon_id);
    }

    return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.order_number });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Payment verification failed." }, { status: 400 });
  }
}