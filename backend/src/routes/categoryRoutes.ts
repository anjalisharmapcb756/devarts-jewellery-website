import { Router } from "express";
import { Category } from "../models/Catalog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(async (_req, res) => {
  const categories = await Category.find({ is_active: { $ne: false } }).sort({ display_order: 1, name: 1 }).lean();
  res.json({ categories: categories.map((c: any) => ({ ...c, id: String(c._id) })) });
}));
export default router;
