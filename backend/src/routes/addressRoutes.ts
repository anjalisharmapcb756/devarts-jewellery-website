import { Router } from "express";
import { requireUser } from "../middleware/customerAuth.js";
import { CustomerAddress } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const addresses = await CustomerAddress.find({ user_id: req.userAuth!.sub }).sort({ is_default: -1, createdAt: -1 }).lean();
  res.json({ addresses });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const address = await CustomerAddress.create({ ...body, user_id: req.userAuth!.sub });
  res.status(201).json({ address });
}));

export default router;
