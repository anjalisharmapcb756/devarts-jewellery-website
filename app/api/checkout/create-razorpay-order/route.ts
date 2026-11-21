import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { calculateCheckoutQuote, generateOrderNumber, getDb } from "@/lib/checkout/server";

function getRazorpayCreds() {
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

    const creds = getRazorpayCreds();
    if (!creds) return NextResponse.json({ error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." }, { status: 500 });

    const body = await request.json();
    const { items, couponCode, contact, shippingAddress, billingAddress, notes } = body ?? {};

    if (!contact?.email || !contact?.phone) return NextResponse.json({ error: "Contact information is required." }, { status: 400 });
    if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.postalCode || !shippingAddress?.phone) {
      return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
    }

    const quote = await calculateCheckoutQuote(items, couponCode);
    if (quote.total <= 0) return NextResponse.json({ error: "Invalid order total." }, { status: 400 });

    const amountPaise = Math.round(quote.total * 100);
    const receipt = generateOrderNumber();

    // Create Razorpay order (server-side)
    const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
    const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: { user_id: user.id, email: contact.email },
      }),
    });
    const rzData = await rzRes.json();
    if (!rzRes.ok) {
      return NextResponse.json({ error: rzData?.error?.description || "Failed to create payment order." }, { status: 400 });
    }

    const db = await getDb();

    // Create pending DB order for idempotency and server-side snapshot
    const { data: order, error: orderError } = await db.from("orders").insert({
      user_id: user.id,
      order_number: receipt,
      status: "pending",
      payment_status: "pending",
      currency: "INR",
      subtotal_inr: quote.subtotal,
      discount_inr: quote.couponDiscount,
      shipping_inr: quote.shipping,
      total_inr: quote.total,
      customer_email: contact.email,
      customer_phone: contact.phone,
      shipping_address_snapshot: shippingAddress,
      billing_address_snapshot: billingAddress ?? shippingAddress,
      coupon_id: quote.couponId,
      coupon_code: quote.couponCode,
      coupon_discount_inr: quote.couponDiscount,
      razorpay_order_id: rzData.id,
      notes: notes || null,
    }).select("id, order_number").single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order." }, { status: 500 });
    }

    const orderItems = quote.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
      product_image_url: item.image,
      quantity: item.quantity,
      unit_price_inr: item.unitPrice,
      line_total_inr: item.lineTotal,
      metal: item.selection.metal,
      gemstone: item.selection.gemstone,
      gemstone_size: item.selection.gemstoneSize,
      ring_size: item.selection.ringSize ?? null,
    }));

    const { error: itemsError } = await db.from("order_items").insert(orderItems);
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    await db.from("payment_transactions").insert({
      order_id: order.id,
      user_id: user.id,
      provider: "razorpay",
      provider_order_id: rzData.id,
      amount_inr: quote.total,
      currency: "INR",
      status: "created",
      raw_payload: { quote, contact, shippingAddress, billingAddress: billingAddress ?? shippingAddress },
    });

    return NextResponse.json({
      keyId: creds.keyId,
      razorpayOrderId: rzData.id,
      amount: amountPaise,
      currency: "INR",
      orderId: order.id,
      orderNumber: order.order_number,
      quote,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create payment order." }, { status: 400 });
  }
}