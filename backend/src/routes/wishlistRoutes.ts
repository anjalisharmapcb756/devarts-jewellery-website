import { Router } from "express";
import { Wishlist } from "../models/Cart.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user_id: req.userAuth!.sub }).lean();
  res.json({ items: items.map((i: any) => String(i.product_id)) });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.items) ? req.body.items.map(String) : [];
  await Wishlist.deleteMany({ user_id: req.userAuth!.sub });
  if (ids.length) {
    await Wishlist.insertMany(ids.map((product_id: string) => ({ user_id: req.userAuth!.sub, product_id })));
  }
  res.json({ ok: true });
}));

export default router;
