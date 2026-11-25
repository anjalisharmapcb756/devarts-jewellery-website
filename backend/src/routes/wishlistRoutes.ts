import { Router } from "express";
import { z } from "zod";
import { Wishlist } from "../models/Cart.js";
import { requireUser } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

const wishlistInput = z.object({
  items: z.array(z.string().trim().min(1).max(200)).max(100),
});

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user_id: req.userAuth!.sub }).lean();
  res.json({ items: [...new Set(items.map((item: any) => String(item.product_id)))] });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const parsed = wishlistInput.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid wishlist.", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  const ids = [...new Set(parsed.data.items)];
  await Wishlist.deleteMany({ user_id: req.userAuth!.sub });
  if (ids.length) {
    await Wishlist.insertMany(ids.map((product_id) => ({ user_id: req.userAuth!.sub, product_id })));
  }
  res.json({ ok: true });
}));

export default router;
