import { Router } from "express";
import { z } from "zod";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { findCatalogueProduct } from "../data/catalogue.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

const cartInput = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1).max(200),
    quantity: z.coerce.number().int().min(1).max(20),
    selection: z.record(z.unknown()).optional(),
    unitPrice: z.number().finite().nonnegative().optional(),
  })).max(50),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

async function resolveUnitPrice(productId: string) {
  if (objectIdPattern.test(productId)) {
    const product: any = await Product.findById(productId).lean();
    if (product && product.is_active !== false && product.is_in_stock !== false) {
      return Number(product.price_inr ?? 0);
    }
  }
  const bySlug: any = await Product.findOne({ slug: productId, is_active: { $ne: false } }).lean();
  if (bySlug && bySlug.is_in_stock !== false) return Number(bySlug.price_inr ?? 0);

  const catalogue = findCatalogueProduct(productId);
  if (!catalogue || catalogue.is_active === false || catalogue.is_in_stock === false) return null;
  return Number(catalogue.price_inr ?? catalogue.price ?? 0);
}

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const items = await Cart.find({ user_id: req.userAuth!.sub }).lean();
  res.json({
    items: items.map((item: any) => ({
      key: String(item._id),
      productId: String(item.product_id),
      quantity: Math.max(1, Number(item.quantity || 1)),
      unitPrice: Number(item.unit_price || 0),
      selection: item.selection || {},
    })),
  });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const parsed = cartInput.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid cart.", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  const byKey = new Map<string, { product_id: string; quantity: number; selection: Record<string, unknown>; unit_price: number }>();
  for (const item of parsed.data.items) {
    const unitPrice = await resolveUnitPrice(item.productId);
    if (unitPrice == null || !Number.isFinite(unitPrice)) continue;

    const selection = item.selection || {};
    const key = `${item.productId}|${JSON.stringify(selection)}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.quantity = Math.min(20, existing.quantity + item.quantity);
    } else {
      byKey.set(key, {
        product_id: item.productId,
        quantity: item.quantity,
        selection,
        unit_price: unitPrice,
      });
    }
  }

  await Cart.deleteMany({ user_id: req.userAuth!.sub });
  if (byKey.size) {
    await Cart.insertMany([...byKey.values()].map((item) => ({ ...item, user_id: req.userAuth!.sub })));
  }
  res.json({ ok: true });
}));

export default router;
