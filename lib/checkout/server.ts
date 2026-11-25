import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/lib/models/Payment";
import { Product as ProductModel } from "@/lib/models/Product";
import { getProductsAsync } from "@/lib/data/products-db";
import { getUnitPrice } from "@/lib/pricing";
import type { CartItemSelection, Product } from "@/types/product";

export type CheckoutInputItem = { productId: string; quantity: number; selection: CartItemSelection };
export type AddressInput = { fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country?: string };
export type CheckoutQuote = { items: Array<{ productId: string; slug: string; name: string; image: string; quantity: number; unitPrice: number; lineTotal: number; selection: CartItemSelection; stockQuantity: number }>; subtotal: number; discount: number; couponDiscount: number; couponCode: string | null; couponId: string | null; shipping: number; total: number; currency: "INR" };

const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 499;
function round2(n: number) { return Math.round(n * 100) / 100; }
function isMongoConfigured() { return Boolean(process.env.MONGODB_URI); }

export async function validateCoupon(code: string | null | undefined, subtotal: number) {
  if (!code?.trim()) return { couponId: null, couponCode: null, couponDiscount: 0 };
  const normalized = code.trim().toUpperCase();
  if (isMongoConfigured()) {
    await connectDB();
    const coupon: any = await Coupon.findOne({ code: normalized, is_active: true }).lean();
    if (!coupon) throw new Error("Invalid coupon code.");
    const now = Date.now();
    if (coupon.starts_at && now < new Date(coupon.starts_at).getTime()) throw new Error("Coupon is not active yet.");
    if (coupon.ends_at && now > new Date(coupon.ends_at).getTime()) throw new Error("Coupon has expired.");
    if (coupon.usage_limit != null && Number(coupon.used_count ?? 0) >= Number(coupon.usage_limit)) throw new Error("Coupon usage limit reached.");
    if (subtotal < Number(coupon.min_order_inr ?? 0)) throw new Error(`Coupon requires minimum order of ₹${Number(coupon.min_order_inr).toLocaleString("en-IN")}.`);
    let discount = 0;
    if (coupon.discount_type === "percentage") { discount = (subtotal * Number(coupon.discount_value)) / 100; if (coupon.max_discount_inr != null) discount = Math.min(discount, Number(coupon.max_discount_inr)); } else discount = Number(coupon.discount_value);
    discount = round2(Math.min(discount, subtotal));
    return { couponId: String(coupon._id), couponCode: coupon.code, couponDiscount: discount };
  }
  if (normalized === "VARA10") return { couponId: "demo-coupon", couponCode: "VARA10", couponDiscount: round2(Math.min(subtotal * 0.1, subtotal)) };
  throw new Error("Invalid coupon code.");
}

export async function calculateCheckoutQuote(inputItems: CheckoutInputItem[], couponCode?: string | null): Promise<CheckoutQuote> {
  if (!Array.isArray(inputItems) || inputItems.length === 0) throw new Error("Cart is empty.");
  const products = await getProductsAsync();
  const byId = new Map<string, Product>(products.map((p) => [p.id, p]));
  const items = inputItems.map((item) => {
    if (!item?.productId || !Number.isFinite(item.quantity) || item.quantity < 1) throw new Error("Invalid cart item.");
    const product = byId.get(item.productId);
    if (!product) throw new Error("One or more cart products are unavailable.");
    if (!product.inStock) throw new Error(`${product.name} is out of stock.`);
    const quantity = Math.min(10, Math.floor(item.quantity));
    const selection = item.selection;
    const unitPrice = getUnitPrice(product, selection);
    const original = product.originalPrice ? Math.max(0, product.originalPrice + (unitPrice - product.price)) : unitPrice;
    return { productId: product.id, slug: product.slug, name: product.name, image: product.image, quantity, unitPrice: round2(unitPrice), originalUnitPrice: round2(original), lineTotal: round2(unitPrice * quantity), selection, stockQuantity: 999 };
  });

  try {
    if (isMongoConfigured()) {
      await connectDB();
      for (const item of items) {
        const dbp: any = await ProductModel.findById(item.productId).lean();
        if (!dbp || dbp.is_active === false) throw new Error(`${item.name} is unavailable.`);
        if (Number(dbp.stock_quantity ?? 0) < item.quantity) throw new Error(`Insufficient stock for ${item.name}.`);
        item.stockQuantity = Number(dbp.stock_quantity ?? 0);
      }
    }
  } catch (e) { if (e instanceof Error && (e.message.includes("Insufficient stock") || e.message.includes("unavailable"))) throw e; }

  const subtotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));
  const discount = round2(items.reduce((s, i) => s + Math.max(0, i.originalUnitPrice - i.unitPrice) * i.quantity, 0));
  const { couponId, couponCode: normalizedCode, couponDiscount } = await validateCoupon(couponCode, subtotal);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = round2(Math.max(0, subtotal - couponDiscount + shipping));
  return { items: items.map(({ originalUnitPrice, ...rest }) => rest), subtotal, discount, couponDiscount, couponCode: normalizedCode, couponId, shipping, total, currency: "INR" };
}

export function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `VARA-${y}${m}${d}-${rand}`;
}
