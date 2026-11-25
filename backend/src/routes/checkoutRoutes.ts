import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product, ProductImage } from "../models/Product.js";
import { Coupon, PaymentTransaction } from "../models/Payment.js";
import { CustomerAddress, Order, OrderItem } from "../models/Order.js";
import { findCatalogueProduct } from "../data/catalogue.js";

const router = Router();
const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 499;
const RAZORPAY_TIMEOUT_MS = 10_000;
const round2 = (value: number) => Math.round(value * 100) / 100;

/** Process-local reservations for JSON catalogue products. Restart clears them. */
const catalogueReservations = new Map<string, number>();

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

type StockLine = {
  product_source?: unknown;
  product_id?: unknown;
  quantity?: unknown;
};

function getRazorpayCreds() {
  if (!env.razorpayEnabled || !env.razorpayKeyId || !env.razorpayKeySecret) return null;
  return { keyId: env.razorpayKeyId, keySecret: env.razorpayKeySecret };
}

function generateOrderNumber() {
  const now = new Date();
  const date = [
    now.getFullYear().toString().slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `VARA-${date}-${crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;
}

function isObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

function imageFallback(key: string) {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619) >>> 0;
  }
  return `/images/fallback/${(hash % 100) + 1}.svg`;
}

function acceptableImage(value: unknown, key: string) {
  const src = String(value || "").trim();
  return src && !src.includes("/images/references/") && !src.includes("placeholder") ? src : imageFallback(key);
}

function safeEqualHex(left: string, right: string) {
  const a = String(left || "");
  const b = String(right || "");
  if (!/^[0-9a-f]{64}$/i.test(a) || !/^[0-9a-f]{64}$/i.test(b)) return false;
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

async function fetchJson<T = Record<string, any>>(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAZORPAY_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = (await response.json().catch(() => ({}))) as T & { error?: { description?: string } };
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(504, "Payment provider timed out.", { code: "PAYMENT_PROVIDER_TIMEOUT" });
    }
    throw new ApiError(502, "Payment provider is unavailable.", { code: "PAYMENT_PROVIDER_UNAVAILABLE" });
  } finally {
    clearTimeout(timer);
  }
}

function razorpayAuth(creds: { keyId: string; keySecret: string }) {
  return `Basic ${Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64")}`;
}

async function mapDbProduct(product: any): Promise<ResolvedProduct> {
  const image: any = await ProductImage.findOne({ product_id: product._id })
    .sort({ is_primary: -1, sort_order: 1 })
    .lean();
  return {
    source: "database",
    productId: String(product._id),
    slug: String(product.slug || product._id),
    name: String(product.name || "Jewellery"),
    image: acceptableImage(image?.url, String(product.slug || product._id)),
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

function reservationKey(productId: string) {
  return `catalogue:${String(productId).toLowerCase()}`;
}

function availableStock(product: ResolvedProduct) {
  if (product.source !== "catalogue") return product.stock;
  const reserved = catalogueReservations.get(reservationKey(product.productId)) ?? 0;
  return Math.max(0, product.stock - reserved);
}

function lineSource(item: StockLine) {
  const productId = String(item.product_id ?? "");
  if (String(item.product_source ?? "") === "database" || isObjectId(productId)) return "database";
  return "catalogue";
}

async function releaseStockLine(item: StockLine) {
  const quantity = Math.max(1, Number(item.quantity ?? 1));
  const productId = String(item.product_id ?? "");
  if (lineSource(item) === "database" && isObjectId(productId)) {
    await Product.findByIdAndUpdate(productId, { $inc: { stock_quantity: quantity } });
    return;
  }
  const product = findCatalogueProduct(productId);
  if (!product) return;
  const key = reservationKey(product.id);
  const reserved = catalogueReservations.get(key) ?? 0;
  const next = Math.max(0, reserved - quantity);
  if (next === 0) catalogueReservations.delete(key);
  else catalogueReservations.set(key, next);
}

async function consumeStock(items: StockLine[]) {
  const consumed: StockLine[] = [];
  try {
    for (const item of items) {
      const quantity = Math.max(1, Number(item.quantity ?? 1));
      const productId = String(item.product_id ?? "");
      if (lineSource(item) === "database" && isObjectId(productId)) {
        const updated: any = await Product.findOneAndUpdate(
          { _id: productId, is_active: { $ne: false }, is_in_stock: { $ne: false }, stock_quantity: { $gte: quantity } },
          { $inc: { stock_quantity: -quantity } },
          { new: true },
        );
        if (!updated) throw new ApiError(409, "Stock changed while checking out.", { code: "INSUFFICIENT_STOCK" });
        if (Number(updated.stock_quantity) <= 0) {
          await Product.findByIdAndUpdate(productId, { $set: { is_in_stock: false } });
        }
      } else {
        const product = findCatalogueProduct(productId);
        if (!product) throw new ApiError(400, `Product unavailable: ${productId}`, { code: "PRODUCT_UNAVAILABLE" });
        const key = reservationKey(product.id);
        const reserved = catalogueReservations.get(key) ?? 0;
        const available = Number(product.stock_quantity ?? 100) - reserved;
        if (available < quantity) {
          throw new ApiError(409, `Insufficient stock for ${product.name}.`, { code: "INSUFFICIENT_STOCK" });
        }
        catalogueReservations.set(key, reserved + quantity);
      }
      consumed.push(item);
    }
    return consumed;
  } catch (error) {
    for (const item of consumed.reverse()) await releaseStockLine(item).catch(() => undefined);
    throw error;
  }
}

async function releaseStock(items: StockLine[]) {
  for (const item of items) {
    await releaseStockLine(item).catch(() => undefined);
  }
}

async function consumeCoupon(couponId: string | null) {
  if (!couponId) return false;
  const updated = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      is_active: true,
      $or: [
        { usage_limit: { $exists: false } },
        { usage_limit: null },
        { $expr: { $lt: ["$used_count", "$usage_limit"] } },
      ],
    },
    { $inc: { used_count: 1 } },
    { new: true },
  ).lean();
  if (!updated) {
    throw new ApiError(409, "Coupon is no longer available.", { code: "INVALID_COUPON" });
  }
  return true;
}

async function releaseCoupon(couponId: string | null) {
  if (!couponId) return;
  await Coupon.findByIdAndUpdate(couponId, { $inc: { used_count: -1 } }).catch(() => undefined);
}

const checkoutInput = z.object({
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]).transform(String),
    quantity: z.coerce.number().int().positive().max(20),
    selection: z.record(z.unknown()).optional(),
  })).min(1, "Cart is empty.").max(50, "Too many items in cart."),
  couponCode: z.string().trim().max(40).optional().nullable(),
  contact: z.object({
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(8, "Enter a valid phone number.").max(20),
  }),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2, "Enter the recipient name.").max(120),
    line1: z.string().trim().min(3, "Enter the address.").max(200),
    line2: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    state: z.string().trim().min(2, "Enter the state.").max(80),
    postalCode: z.string().trim().min(4, "Enter the postal code.").max(12),
    country: z.string().trim().min(2).max(80).optional().nullable(),
  }),
});

const orderIdSchema = z.object({ orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order id.") });

function parseCheckoutInput(body: unknown) {
  const parsed = checkoutInput.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Checkout details are invalid.", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }
  return parsed.data;
}

async function calculateQuote(
  inputItems: Array<{ productId: string; quantity: number; selection?: Record<string, unknown> }>,
  couponCode?: string | null,
) {
  if (!Array.isArray(inputItems) || inputItems.length === 0) {
    throw new ApiError(400, "Cart is empty.", { code: "EMPTY_CART" });
  }

  const items: Array<Record<string, unknown>> = [];
  for (const item of inputItems) {
    const quantity = Math.max(1, Number(item.quantity || 1));
    const product = await resolveProduct(String(item.productId));
    if (!product || !product.active) {
      throw new ApiError(400, `Product unavailable: ${item.productId}`, {
        code: "PRODUCT_UNAVAILABLE",
        details: { productId: String(item.productId) },
      });
    }
    if (!product.inStock || availableStock(product) < quantity) {
      throw new ApiError(409, `Insufficient stock for ${product.name}.`, {
        code: "INSUFFICIENT_STOCK",
        details: { productId: product.productId, productName: product.name, available: availableStock(product) },
      });
    }
    const unitPrice = round2(product.price);
    items.push({
      productId: product.productId,
      productSlug: product.slug,
      productSource: product.source,
      image: product.image,
      name: product.name,
      quantity,
      unitPrice,
      lineTotal: round2(unitPrice * quantity),
      selection: item.selection || {},
      stockQuantity: availableStock(product),
    });
  }

  const subtotal = round2(items.reduce((sum: number, item) => sum + Number(item.lineTotal), 0));
  let couponDiscount = 0;
  let couponId: string | null = null;
  let normalizedCode: string | null = null;

  if (couponCode && String(couponCode).trim()) {
    normalizedCode = String(couponCode).trim().toUpperCase();
    const coupon: any = await Coupon.findOne({ code: normalizedCode, is_active: true }).lean();
    if (!coupon) throw new ApiError(400, "Invalid coupon code.", { code: "INVALID_COUPON" });
    const now = new Date();
    if (coupon.starts_at && now < new Date(coupon.starts_at)) {
      throw new ApiError(400, "Coupon is not active yet.", { code: "INVALID_COUPON" });
    }
    if (coupon.ends_at && now > new Date(coupon.ends_at)) {
      throw new ApiError(400, "Coupon has expired.", { code: "INVALID_COUPON" });
    }
    if (coupon.usage_limit != null && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
      throw new ApiError(409, "Coupon usage limit reached.", { code: "INVALID_COUPON" });
    }
    if (subtotal < Number(coupon.min_order_inr || 0)) {
      throw new ApiError(400, `Coupon requires a minimum order of INR ${coupon.min_order_inr}.`, { code: "INVALID_COUPON" });
    }

    const type = String(coupon.discount_type || "").toLowerCase();
    if (type === "percentage" || type === "percent") {
      couponDiscount = round2((subtotal * Number(coupon.discount_value || 0)) / 100);
    } else {
      couponDiscount = round2(Number(coupon.discount_value || 0));
    }
    if (coupon.max_discount_inr != null) couponDiscount = Math.min(couponDiscount, Number(coupon.max_discount_inr));
    couponDiscount = Math.min(couponDiscount, subtotal);
    couponId = String(coupon._id);
  }

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = round2(Math.max(0, subtotal - couponDiscount + shipping));
  return {
    items,
    subtotal,
    discount: 0,
    couponDiscount,
    couponCode: normalizedCode,
    couponId,
    shipping,
    total,
    currency: "INR" as const,
  };
}

type Quote = Awaited<ReturnType<typeof calculateQuote>>;
type CheckoutInput = ReturnType<typeof parseCheckoutInput>;

async function createOrderRecord(
  userId: string,
  quote: Quote,
  checkout: CheckoutInput,
  paymentMethod: "razorpay" | "cod",
  razorpayOrderId?: string,
) {
  const addressFields = checkout.shippingAddress;
  const address = await CustomerAddress.create({
    user_id: userId,
    label: "Checkout",
    full_name: addressFields.fullName,
    phone: checkout.contact.phone,
    line1: addressFields.line1,
    line2: addressFields.line2 || "",
    city: addressFields.city,
    state: addressFields.state,
    postal_code: addressFields.postalCode,
    country: addressFields.country || "India",
    is_default: false,
  });

  const order = await Order.create({
    order_number: generateOrderNumber(),
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
    shipping_address_id: address._id,
    razorpay_order_id: razorpayOrderId || null,
    placed_at: new Date(),
  });

  await OrderItem.insertMany(quote.items.map((item: any) => ({
    order_id: order._id,
    product_id: item.productId,
    product_source: item.productSource,
    product_slug: item.productSlug,
    product_image: item.image,
    product_name: item.name,
    quantity: item.quantity,
    unit_price_inr: item.unitPrice,
    line_total_inr: item.lineTotal,
    metal: item.selection?.metal,
    gemstone: item.selection?.gemstone,
    gemstone_size: item.selection?.gemstoneSize,
    ring_size: item.selection?.ringSize,
  })));

  return { order, orderNumber: order.order_number, addressId: String(address._id) };
}

async function rollbackOrder(orderId: string, addressId: string) {
  await OrderItem.deleteMany({ order_id: orderId }).catch(() => undefined);
  await Order.findByIdAndDelete(orderId).catch(() => undefined);
  await CustomerAddress.findByIdAndDelete(addressId).catch(() => undefined);
}

async function reserveOrder(orderId: string, quote: Quote) {
  const items = await OrderItem.find({ order_id: orderId }).lean() as StockLine[];
  await consumeStock(items);
  await Order.findByIdAndUpdate(orderId, { $set: { stock_reserved: true, stock_released: false } });

  try {
    if (await consumeCoupon(quote.couponId)) {
      await Order.findByIdAndUpdate(orderId, { $set: { coupon_reserved: true, coupon_released: false } });
    }
  } catch (error) {
    await releaseStock(items);
    await Order.findByIdAndUpdate(orderId, { $set: { stock_released: true } });
    throw error;
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
  let created: Awaited<ReturnType<typeof createOrderRecord>> | null = null;

  try {
    created = await createOrderRecord(req.userAuth!.sub, quote, checkout, "cod");
    await reserveOrder(String(created.order._id), quote);
  } catch (error) {
    if (created) await rollbackOrder(String(created.order._id), created.addressId);
    throw error;
  }

  await PaymentTransaction.create({
    order_id: created.order._id,
    user_id: req.userAuth!.sub,
    provider: "cod",
    amount_inr: quote.total,
    currency: quote.currency,
    status: "pending",
    error_description: "Payable on delivery",
  });

  res.status(201).json({
    orderId: String(created.order._id),
    orderNumber: created.orderNumber,
    quote,
    paymentMethod: "cod",
  });
}));

router.post("/create-razorpay-order", requireUser, asyncHandler(async (req, res) => {
  const creds = getRazorpayCreds();
  if (!creds) {
    throw new ApiError(503, "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.", {
      code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
    });
  }

  const checkout = parseCheckoutInput(req.body);
  const quote = await calculateQuote(checkout.items as any, checkout.couponCode);
  const amountPaise = Math.round(quote.total * 100);
  const receipt = generateOrderNumber();

  const providerOrder = await fetchJson<any>("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: razorpayAuth(creds), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { userId: req.userAuth!.sub },
    }),
  });
  if (!providerOrder.ok || !providerOrder.data?.id) {
    throw new ApiError(502, providerOrder.data?.error?.description || "Failed to create Razorpay order.", {
      code: "PAYMENT_ORDER_CREATION_FAILED",
    });
  }

  let created: Awaited<ReturnType<typeof createOrderRecord>> | null = null;
  try {
    created = await createOrderRecord(req.userAuth!.sub, quote, checkout, "razorpay", providerOrder.data.id);
    await reserveOrder(String(created.order._id), quote);
  } catch (error) {
    if (created) {
      await rollbackOrder(String(created.order._id), created.addressId);
      await fetchJson(`https://api.razorpay.com/v1/orders/${providerOrder.data.id}/cancel`, {
        method: "POST",
        headers: { Authorization: razorpayAuth(creds) },
      }).catch(() => undefined);
    }
    throw error;
  }

  await PaymentTransaction.create({
    order_id: created.order._id,
    user_id: req.userAuth!.sub,
    provider: "razorpay",
    provider_order_id: providerOrder.data.id,
    amount_inr: quote.total,
    currency: "INR",
    status: "created",
  });

  res.json({
    keyId: creds.keyId,
    razorpayOrderId: providerOrder.data.id,
    amount: amountPaise,
    currency: "INR",
    orderId: String(created.order._id),
    orderNumber: created.orderNumber,
    quote,
  });
}));

router.post("/verify-payment", requireUser, asyncHandler(async (req, res) => {
  const body = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order id."),
  }).safeParse(req.body ?? {});
  if (!body.success) {
    throw new ApiError(400, "Missing or invalid payment verification data.", {
      code: "VALIDATION_ERROR",
      details: body.error.flatten(),
    });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body.data;

  const secret = env.razorpayKeySecret;
  if (!secret) {
    throw new ApiError(503, "Razorpay secret not configured.", { code: "PAYMENT_PROVIDER_NOT_CONFIGURED" });
  }
  if (!safeEqualHex(
    crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex"),
    razorpay_signature,
  )) {
    throw new ApiError(400, "Invalid payment signature.", { code: "PAYMENT_VERIFICATION_FAILED" });
  }

  const order: any = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.", { code: "NOT_FOUND" });
  if (String(order.user_id) !== String(req.userAuth!.sub)) {
    throw new ApiError(403, "Unauthorized.", { code: "FORBIDDEN" });
  }
  if (order.payment_method !== "razorpay") {
    throw new ApiError(400, "Order is not a Razorpay order.", { code: "PAYMENT_VERIFICATION_FAILED" });
  }
  if (String(order.razorpay_order_id || "") !== razorpay_order_id) {
    throw new ApiError(400, "Payment does not match this order.", { code: "PAYMENT_ORDER_MISMATCH" });
  }

  const existingPayment: any = await PaymentTransaction.findOne({ provider_payment_id: razorpay_payment_id }).lean();
  if (existingPayment) {
    if (String(existingPayment.order_id) === String(order._id) && order.payment_status === "paid") {
      return res.json({
        ok: true,
        orderId: String(order._id),
        orderNumber: order.order_number,
        alreadyProcessed: true,
      });
    }
    throw new ApiError(409, "Payment has already been used.", { code: "PAYMENT_REPLAY_DETECTED" });
  }

  const creds = getRazorpayCreds()!;
  const payment = await fetchJson<any>(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
    headers: { Authorization: razorpayAuth(creds) },
  });
  if (!payment.ok) {
    throw new ApiError(502, "Failed to verify payment with Razorpay.", { code: "PAYMENT_VERIFICATION_FAILED" });
  }
  const pay = payment.data;
  if (String(pay.order_id || "") !== razorpay_order_id) {
    throw new ApiError(400, "Payment does not match this order.", { code: "PAYMENT_ORDER_MISMATCH" });
  }
  if (Number(pay.amount) !== Math.round(Number(order.total_inr) * 100)) {
    throw new ApiError(400, "Payment amount mismatch.", { code: "PAYMENT_AMOUNT_MISMATCH" });
  }
  if (!["captured", "authorized"].includes(String(pay.status))) {
    throw new ApiError(400, `Payment not captured (status: ${pay.status}).`, { code: "PAYMENT_NOT_CAPTURED" });
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, payment_status: "pending", razorpay_order_id },
    {
      $set: {
        status: "confirmed",
        payment_status: "paid",
        razorpay_payment_id,
        paid_at: new Date(),
        payment_method: "razorpay",
      },
    },
    { new: true },
  );
  if (!updated) {
    return res.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number, alreadyProcessed: true });
  }

  try {
    await PaymentTransaction.create({
      order_id: order._id,
      user_id: req.userAuth!.sub,
      provider: "razorpay",
      provider_order_id: razorpay_order_id,
      provider_payment_id: razorpay_payment_id,
      provider_signature: razorpay_signature,
      amount_inr: order.total_inr,
      currency: "INR",
      status: "verified",
      raw_payload: { status: pay.status, method: pay.method || null },
    });
  } catch (error: any) {
    if (error?.code !== 11000) throw error;
  }

  res.json({ ok: true, orderId: String(order._id), orderNumber: order.order_number });
}));

router.post("/payment-failed", requireUser, asyncHandler(async (req, res) => {
  const body = orderIdSchema.safeParse(req.body ?? {});
  if (!body.success) {
    throw new ApiError(400, "Invalid order id.", { code: "VALIDATION_ERROR" });
  }
  const { orderId } = body.data;
  const raw = z.object({
    razorpay_order_id: z.string().optional(),
    reason: z.string().max(500).optional(),
    code: z.string().max(80).optional(),
    cancelled: z.boolean().optional(),
  }).safeParse(req.body ?? {});
  const details = raw.success ? raw.data : {};

  const order: any = await Order.findById(orderId).lean();
  if (!order || String(order.user_id) !== String(req.userAuth!.sub)) {
    throw new ApiError(404, "Order not found.", { code: "NOT_FOUND" });
  }
  if (order.payment_status === "paid") return res.json({ ok: true, ignored: true });

  if (order.stock_reserved && !order.stock_released) {
    const items = await OrderItem.find({ order_id: orderId }).lean() as StockLine[];
    await releaseStock(items);
    await Coupon.findByIdAndUpdate(order.coupon_id, { $inc: { used_count: -1 } }).catch(() => undefined);
  }
  await Order.findByIdAndUpdate(orderId, {
    $set: {
      payment_status: "failed",
      status: details.cancelled ? "cancelled" : "payment_failed",
      stock_released: true,
      coupon_released: true,
    },
  });

  await PaymentTransaction.create({
    order_id: orderId,
    user_id: req.userAuth!.sub,
    provider: "razorpay",
    provider_order_id: details.razorpay_order_id || order.razorpay_order_id,
    amount_inr: order.total_inr,
    currency: "INR",
    status: details.cancelled ? "cancelled" : "failed",
    error_code: details.code || null,
    error_description: details.reason || (details.cancelled ? "Payment cancelled by customer" : "Payment failed"),
  });

  res.json({ ok: true });
}));

export default router;
