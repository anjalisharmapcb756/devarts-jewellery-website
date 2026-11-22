import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAdmin, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAdmin);

const ADMIN_ROLES = ["super_admin"] as const;

router.get("/dashboard", requireRole(...ADMIN_ROLES), asyncHandler(async (_req, res) => {
  const db = mongoose.connection.db;
  if (!db) return res.json({ products: 0, orders: 0, customers: 0, revenueInr: 0 });
  const [products, orders, customers, revenueAgg] = await Promise.all([
    db.collection("products").countDocuments().catch(() => 0),
    db.collection("orders").countDocuments().catch(() => 0),
    db.collection("users").countDocuments({ role: "customer" }).catch(() => 0),
    db.collection("orders").aggregate([{ $group: { _id: null, total: { $sum: "$total_inr" } } }]).toArray().catch(() => []),
  ]);
  res.json({ products, orders, customers, revenueInr: Number(revenueAgg[0]?.total || 0) });
}));

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get("/products", requireRole(...ADMIN_ROLES), validate({ query: paginationQuery }), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const db = mongoose.connection.db;
  if (!db) return res.json({ items: [], page, limit, total: 0 });
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.collection("products").find({}, { projection: { name: 1, slug: 1, price_inr: 1, is_active: 1, stock_quantity: 1 } }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection("products").countDocuments(),
  ]);
  res.json({ items, page, limit, total });
}));

router.get("/orders", requireRole(...ADMIN_ROLES), validate({ query: paginationQuery }), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const db = mongoose.connection.db;
  if (!db) return res.json({ items: [], page, limit, total: 0 });
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.collection("orders").find({}, { projection: { order_number: 1, status: 1, payment_status: 1, total_inr: 1, placed_at: 1, createdAt: 1 } }).sort({ placed_at: -1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection("orders").countDocuments(),
  ]);
  res.json({ items, page, limit, total });
}));

export default router;
