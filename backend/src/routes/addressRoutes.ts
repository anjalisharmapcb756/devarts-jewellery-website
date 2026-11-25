import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../middleware/customerAuth.js";
import { validate } from "../middleware/validate.js";
import { CustomerAddress } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const addressSchema = z.object({
  label: z.string().trim().max(60).optional(),
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().min(4).max(12),
  country: z.string().trim().min(2).max(80).optional(),
  is_default: z.boolean().optional(),
});

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const addresses = await CustomerAddress.find({ user_id: req.userAuth!.sub })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();
  res.json({ addresses });
}));

router.post("/", requireUser, validate({ body: addressSchema }), asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof addressSchema>;
  if (body.is_default) {
    await CustomerAddress.updateMany({ user_id: req.userAuth!.sub }, { $set: { is_default: false } });
  }
  const address = await CustomerAddress.create({
    ...body,
    label: body.label || "Home",
    country: body.country || "India",
    is_default: body.is_default ?? false,
    user_id: req.userAuth!.sub,
  });
  res.status(201).json({ address });
}));

export default router;
