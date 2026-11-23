import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/Product.js";
import { ProductImage } from "../models/Product.js";
import { Coupon, PaymentTransaction } from "../models/Payment.js";
import { CustomerAddress, Order, OrderItem } from "../models/Order.js";
import { findCatalogueProduct } from "../data/catalogue.js";

const router = Router();
const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 499;
const round2 = (n: number) => Math.round(n * 100) / 100;

type ResolvedProduct = {
  source: "database" | "catalogue";
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  active: boolean;
  inStock: boolean;
};

function getRazorpayCreds() {
  if (!env.razorpayEnabled || !env.razorpayKeyId || !env.razorpayKeySecret) return null;
  return { keyId: env.razorpayKeyId, keySecret: env.razorpayKeySecret };
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `VARA-${y}${m}${d}-${rand}`;
}

function isObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

function imageFallback(key: string) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619) >>> 0;
  return `/images/fallback/${(hash % 100) + 1}.svg`;
}

function acceptableImage(value: unknown, key: string) {
  const src = String(value || "").trim();
  return src && !src.includes("/images/references/") && !src.includes("placeholder") ? src : imageFallback(key);
}

async function mapDbProduct(product: any): Promise<ResolvedProduct> {
  const img: any = await ProductImage.findOne({ product_id: product._id }).sort({ is_primary: -1, sort_order: 1 }).lean();
  return {
    source: "database",
    productId: String(product._id),
    slug: String(product.slug || product._id),
    name: String(product.name || "Jewellery"),
    image: acceptableImage(img?.url, String(product.slug || product._id)),
    price: Number(product.price_inr ?? 0),
    stock: Number(product.stock_quantity ?? 0),
    active: product.is_active !== false,
    inStock: product.is_in_stock !== false,
  };
}

async function resolveProduct(idOrSlug: string): Promise<ResolvedProduct | null> {
  const id = String(idOrSlug || "").trim();
  if (!id) return null;

  if (isObjectId(id)) {
    const product: any = await Product.findById(id).lean();
    if (product) return mapDbProduct(product);
  } else {
    const bySlug: any = await Product.findOne({ slug: id }).lean();
    if (bySlug) return mapDbProduct(bySlug);
  }

  const fallback = findCatalogueProduct(id);
  if (!fallback) return null;
  return {
    source: "catalogue",
    productId: fallback.id,
    slug: fallback.slug,
    name: fallback.name,
    image: acceptableImage(fallback.image, fallback.slug),
    price: Number(fallback.price_inr ?? fallback.price ?? 0),
    stock: Number(fallback.stock_quantity ?? 100),
    active: fallback.is_active !== false,
    inStock: fallback.is_in_stock !== false,
  };
}

const checkoutInput = z.object({
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]).transform(String),
    quantity: z.coerce.number().int().positive().max(20),
    selection: z.record(z.unknown()).optional(),
  })).min(1, "Cart is empty."),
  couponCode: z.string().trim().optional().nullable(),
  contact: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(8, "Enter a valid phone number."),
  }),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2, "Enter the recipient name."),
    line1: z.string().trim().min(3, "Enter the address."),
    line2: z.string().trim().optional().nullable(),
    city: z.string().trim().min(2, "Enter the city."),
    state: z.string().trim().min(2, "Enter the state."),
    postalCode: z.string().trim().min(4, "Enter the postal code."),
    country: z.string().trim().min(2).optional().nullable(),
  }),
});

function parseCheckoutInput(body: unknown) {
  const parsed = checkoutInput.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new ApiError(400, first?.message || "Checkout details are invalid.");
  }
  return parsed.data;
}

async function calculateQuote(inputItems: Array<{ productId: string; quantity: number; selection?: Record<string, unknown> }>, couponCode?: string | null) {
  if (!Array.isArray(inputItems) || inputItems.length === 0) throw new ApiError(400, "Cart is empty.");
  const items: Array<any> = [];
  for (const it of inputItems) {
    const qty = Math.max(1, Number(it.quantity || 1));
    const product = await resolveProduct(String(it.productId));
    if (!product || !product.active) throw new ApiError(400, `Product unavailable: ${it.productId}`);
    if (!product.inStock || product.stock < qty) throw new ApiError(400, `Insufficient stock for ${product.name}`);
    const unitPrice = round2(product.price);
    items.push({
      productId: product.productId,
      productSlug: product.slug,
      productSource: product.source,
      image: product.image,
      name: product.name,
      quantity: qty,
      unitPrice,
      lineTotal: round2(unitPrice * qty),
      selection: it.selection || {},
      stockQuantity: product.stock,
    });
  }

  const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));
  let couponDiscount = 0;
  let couponId: string | null = null;
  let normalizedCode: string | null = null;
  if (couponCode && String(couponCode).trim()) {
    normalizedCode = String(couponCode).trim().toUpperCase();
    const coupon: any = await Coupon.findOne({ code: normalizedCode, is_active: true }).lean();
    if (!coupon) throw new ApiError(400, "Invalid coupon code.");
    const now = new Date();
    if (coupon.starts_at && now < new Date(coupon.starts_at)) throw new ApiError(400, "Coupon is not active yet.");
    if (coupon.ends_at && now > new Date(coupon.ends_at)) throw new ApiError(400, "Coupon has expired.");
    if (coupon.usage_limit != null && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) throw new ApiError(400, "Coupon usage limit reached.");
    if (subtotal < Number(coupon.min_order_inr || 0)) throw new ApiError(400, `Coupon requires a minimum order of INR ${coupon.min_order_inr}.`);
    if (coupon.discount_type === "percent") couponDiscount = round2((subtotal * Number(coupon.discount_value || 0)) / 100);
    else couponDiscount = round2(Number(coupon.discount_value || 0));
    if (coupon.max_discount_inr != null) couponDiscount = Math.min(couponDiscount, Number(coupon.max_discount_inr));
    couponDiscount = Math.min(couponDiscount, subtotal);
    couponId = String(coupon._id);
  }
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = round2(Math.max(0, subtotal - couponDiscount + shipping));
  return { items, subtotal, discount: 0, couponDiscount, couponCode: normalizedCode, couponId, shipping, total, currency: "INR" as const };
}

type Quote = Awaited<ReturnType<typeof calculateQuote>>;

async function createOrderRecord(userId: string, quote: Quote, checkout: ReturnType<typeof parseCheckoutInput>, paymentMethod: "razorpay" | "cod") {
  const a = checkout.shippingAddress;
  const shippingAddr = await CustomerAddress.create({
    user_id: userId,
    label: "Checkout",
    full_name: a.fullName,
    phone: checkout.contact.phone,
    line1: a.line1,
    line2: a.line2 || "",
    city: a.city,
    state: a.state,
    postal_code: a.postalCode,
    country: a.country || "India",
    is_default: false,
  });
  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    order_number: orderNumber,
    user_id: userId,
    status: paymentMethod === "cod" ? "confirmed" : "pending",
    payment_status: "pending",
    payment_method: paymentMethod,
    subtotal_inr: quote.subtotal,
    discount_inr: quote.discount,
    coupon_discount_inr: quote.couponDiscount,
    coupon_id: quote.couponId,
    coupon_code: quote.couponCode,
    shipping_inr: quote.shipping,
    total_inr: quote.total,
    currency: quote.currency,
    shipping_address_id: shippingAddr._id,
    placed_at: new Date(),
  });
  await OrderItem.insertMany(quote.items.map((i: any) => ({
    order_id: order._id,
    product_id: i.productId,
    product_source: i.productSource,
    product_slug: i.productSlug,
    product_image: i.image,
    product_name: i.name,
    quantity: i.quantity,
    unit_price_inr: i.unitPrice,
    line_total_inr: i.lineTotal,
    metal: i.selection?.metal,
    gemstone: i.selection?.gemstone,
    gemstone_size: i.selection?.gemstoneSize,
    ring_size: i.selection?.ringSize,
  })));
  return { order, orderNumber };
}

async function decrementStock(items: any[]) {
  for (const item of items || []) {
    const source = String(item.product_source || (isObjectId(String(item.product_id)) ? "database" : "catalogue"));
    if (source !== "database" || !isObjectId(String(item.product_id))) continue;
    await Product.findByIdAndUpdate(item.product_id, { $inc: { stock_quantity: -Math.max(1, Number(item.quantity || 1)) } });
  }
}

router.get("/config", (_req, res) => {
  res.json({
    razorpayEnabled: Boolean(getRazorpayCreds()),
    codEnabled: true,
    currency: "INR",
    freeShippingThreshold: SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
  });
});

router.post("/quote", asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body ?? {};
  const quote = await calculateQuote(items ?? [], couponCode);
  res.json({ quote });
}));

router.post("/create-cod-order", requireUser, asyncHandler(async (req, res) => {
  const checkout = parseCheckoutInput(req.body);
  const quote = await calculateQuote(checkout.items as any, checkout.couponCode);
  const { order, orderNumber } = await createOrderRecord(req.userAuth!.sub, quote, checkout, "cod");
  const items = await OrderItem.find({ order_id: order._id }).lean();
  await decrementStock(items);
  if (quote.couponId) await Coupon.findByIdAndUpdate(quote.couponId, { $inc: { used_count: 1 } });
  await PaymentTransaction.create({
    order_id: order._id,
    user_id: req.userAuth!.sub,
    provider: "cod",
    amount_inr: quote.total,
    currency: quote.currency,
    status: "pending",
    error_description: "Payable on delivery",
  });
  res.status(201).json({ orderId: String(order._id), orderNumber, quote, paymentMethod: "cod" });
}));

router.post("/create-razorpay-order", requireUser, asyncHandler(async (req, res) => {
  const creds = getRazorpayCreds();
  if (!creds) throw new ApiError(500, "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  const checkout = parseCheckoutInput(req.body);
  const quote = await calculateQuote(checkout.items as any, checkout.couponCode);
  const { order, orderNumber } = await createOrderRecord(req.userAuth!.sub, quote, checkout, "razorpay");
  const amountPaise = Math.round(quote.total * 100);
  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
  const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt: orderNumber, notes: { orderId: String(order._id), userId: req.userAuth!.sub } }),
  });
  const rzOrder = await rzRes.json();
  if (!rzRes.ok) throw new ApiError(400, rzOrder?.error?.description || "Failed to create Razorpay order.");
  order.razorpay_order_id = rzOrder.id;
  await order.save();
  await PaymentTransaction.create({ order_id: order._id, user_id: req.userAuth!.sub, provider: "razorpay", provider_order_id: rzOrder.id, amount_inr: quote.total, currency: "INR", status: "created" });
  res.json({ keyId: creds.keyId, razorpayOrderId: rzOrder.id, amount: amountPaise, currency: "INR", orderId: String(order._id), orderNumber, quote });
}));

router.post("/verify-payment", requireUser, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) throw new ApiError(400, "Missing payment verification data.");
  const secret = env.razorpayKeySecret || "";
  if (!secret) throw new ApiError(500, "Razorpay secret not configured.");
  const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) throw new ApiError(400, "Invalid payment signature.");
  const order: any = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");
  if (String(order.user_id) !== String(req.userAuth!.sub)) throw new ApiError(403, "Unauthorized.");
  if (order.payment_status === "paid" && order.razorpay_payment_id === razorpay_payment_id) return res.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number, alreadyProcessed: true });
  const creds = getRazorpayCreds();
  if (creds) {
    const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, { headers: { Authorization: `Basic ${auth}` } });
    const pay: any = await payRes.json();
    if (!payRes.ok) throw new ApiError(400, "Failed to verify payment with Razorpay.");
    if (pay.order_id !== razorpay_order_id) throw new ApiError(400, "Payment does not match order.");
    const expectedAmount = Math.round(Number(order.total_inr) * 100);
    if (Number(pay.amount) !== expectedAmount) throw new ApiError(400, "Payment amount mismatch.");
    if (!["captured", "authorized"].includes(pay.status)) throw new ApiError(400, `Payment not captured (status: ${pay.status}).`);
  }
  const items: any[] = await OrderItem.find({ order_id: order._id }).lean();
  for (const item of items) {
    const product = await resolveProduct(String(item.product_id));
    if (!product || !product.active) throw new ApiError(400, `${item.product_name} is unavailable.`);
    if (product.stock < Number(item.quantity)) throw new ApiError(400, `Insufficient stock for ${item.product_name}.`);
  }
  const updated = await Order.findOneAndUpdate({ _id: order._id, payment_status: "pending" }, { status: "confirmed", payment_status: "paid", razorpay_payment_id, paid_at: new Date(), payment_method: "razorpay" }, { new: true });
  if (!updated) return res.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number, alreadyProcessed: true });
  await decrementStock(items);
  await PaymentTransaction.create({ order_id: order._id, user_id: req.userAuth!.sub, provider: "razorpay", provider_order_id: razorpay_order_id, provider_payment_id: razorpay_payment_id, provider_signature: razorpay_signature, amount_inr: order.total_inr, currency: "INR", status: "verified" });
  if (order.coupon_id) await Coupon.findByIdAndUpdate(order.coupon_id, { $inc: { used_count: 1 } });
  res.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number });
}));

router.post("/payment-failed", requireUser, asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, reason, code, cancelled } = req.body ?? {};
  if (!orderId) throw new ApiError(400, "orderId required.");
  const order: any = await Order.findById(orderId).lean();
  if (!order || String(order.user_id) !== String(req.userAuth!.sub)) throw new ApiError(404, "Order not found.");
  if (order.payment_status === "paid") return res.json({ ok: true, ignored: true });
  await Order.findOneAndUpdate({ _id: orderId, payment_status: "pending" }, { payment_status: "failed", status: cancelled ? "cancelled" : "pending" });
  await PaymentTransaction.create({ order_id: orderId, user_id: req.userAuth!.sub, provider: "razorpay", provider_order_id: razorpay_order_id || order.razorpay_order_id, amount_inr: order.total_inr, currency: "INR", status: cancelled ? "cancelled" : "failed", error_code: code || null, error_description: reason || (cancelled ? "Payment cancelled by customer" : "Payment failed") });
  res.json({ ok: true });
}));

export default router;
