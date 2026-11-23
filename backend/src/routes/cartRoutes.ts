import { Router } from "express";
import { Cart } from "../models/Cart.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const items = await Cart.find({ user_id: req.userAuth!.sub }).lean();
  res.json({ items: items.map((i: any) => ({ key: String(i._id), productId: String(i.product_id), quantity: i.quantity, unitPrice: i.unit_price, selection: i.selection || {} })) });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  await Cart.deleteMany({ user_id: req.userAuth!.sub });
  if (items.length) {
    await Cart.insertMany(items.map((i: any) => ({ user_id: req.userAuth!.sub, product_id: i.productId, quantity: Math.max(1, Number(i.quantity || 1)), selection: i.selection || {}, unit_price: Number(i.unitPrice || 0) })));
  }
  res.json({ ok: true });
}));

export default router;
