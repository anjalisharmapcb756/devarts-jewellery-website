import { Router } from "express";
import { requireUser } from "../middleware/customerAuth.js";
import { Order, OrderItem } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

function serializeOrder(o: any, items: any[] = []) {
  return {
    id: String(o._id),
    orderNumber: o.order_number,
    date: o.placed_at || o.createdAt,
    total: Number(o.total_inr || 0),
    status: o.payment_status === "paid" || o.payment_method === "cod" ? o.status : o.payment_status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method || "razorpay",
    items: items.map((i: any) => typeof i === "string" ? i : i.product_name),
  };
}

router.get("/", requireUser, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.userAuth!.sub }).sort({ placed_at: -1, createdAt: -1 }).lean();
  const ids = orders.map((o: any) => o._id);
  const items = await OrderItem.find({ order_id: { $in: ids } }).lean();
  const itemsByOrder: Record<string, any[]> = {};
  for (const it of items as any[]) { const k = String(it.order_id); (itemsByOrder[k] ||= []).push(it); }
  res.json({ orders: orders.map((o: any) => serializeOrder(o, itemsByOrder[String(o._id)] || [])) });
}));

router.get("/:id", requireUser, asyncHandler(async (req, res) => {
  const id = String(req.params.id || "");
  if (!/^[0-9a-fA-F]{24}$/.test(id)) throw new ApiError(404, "Order not found.");
  const order: any = await Order.findOne({ _id: id, user_id: req.userAuth!.sub }).lean();
  if (!order) throw new ApiError(404, "Order not found.");
  const items = await OrderItem.find({ order_id: order._id }).lean();
  res.json({ order: serializeOrder(order, items as any[]) });
}));

export default router;
