import { Router } from "express";
import { requireUser, requireAdminRole } from "../middleware/customerAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Catalog.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

const router = Router();
router.use(requireUser, requireAdminRole);

router.get("/dashboard", asyncHandler(async (_req, res) => {
  const [orders, products, customers] = await Promise.all([
    Order.find().sort({ placed_at: -1, createdAt: -1 }).lean(),
    Product.find().lean(),
    User.find({ role: "customer" }).lean(),
  ]);
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_inr ?? 0), 0);
  res.json({ totalRevenue, totalOrders: orders.length, totalCustomers: customers.length, totalProducts: products.length, recentOrders: orders.slice(0, 10) });
}));

router.get("/products", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  const cats = await Category.find().lean();
  const catMap = Object.fromEntries(cats.map((c: any) => [String(c._id), c.name]));
  res.json(products.map((p: any) => ({ ...p, id: String(p._id), categories: { name: catMap[String(p.category_id)] || "-" } })));
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const status = String(req.query.status || "");
  const filter: any = {};
  if (status) filter.status = status;
  if (q) filter.order_number = { $regex: q, $options: "i" };
  const orders = await Order.find(filter).sort({ placed_at: -1, createdAt: -1 }).lean();
  res.json(orders.map((o: any) => ({ ...o, id: String(o._id) })));
}));

router.get("/customers", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const filter: any = { role: "customer" };
  if (q) filter.$or = [{ fullName: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  res.json(users.map((u: any) => ({ id: String(u._id), full_name: u.fullName, email: u.email, phone: u.phone || "", created_at: u.createdAt })));
}));

router.get("/categories", asyncHandler(async (_req, res) => {
  const cats = await Category.find().sort({ display_order: 1, name: 1 }).lean();
  res.json(cats.map((c: any) => ({ ...c, id: String(c._id) })));
}));

router.get("/analytics", asyncHandler(async (_req, res) => {
  const [orders, products, customers] = await Promise.all([Order.find().lean(), Product.find().lean(), User.find({ role: "customer" }).lean()]);
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_inr ?? 0), 0);
  res.json({ totalRevenue, totalOrders: orders.length, totalCustomers: customers.length, totalProducts: products.length });
}));

router.get("/settings", asyncHandler(async (_req, res) => {
  res.json({ siteName: "Vara", currency: "INR" });
}));

router.post("/products", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const product = await Product.create({
    name: body.name, slug: body.slug || String(body.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: body.description || "", details: body.details || "", category_id: body.category_id || undefined,
    price_inr: Number(body.price_inr ?? body.price ?? 0), original_price_inr: body.original_price_inr ?? null,
    sku: body.sku || "", stock_quantity: Number(body.stock_quantity ?? 0), is_in_stock: body.is_in_stock ?? Number(body.stock_quantity ?? 0) > 0,
    badge: body.badge || "", is_active: body.is_active ?? true,
  });
  res.status(201).json({ ...product.toObject(), id: String(product._id) });
}));

router.put("/products/:id", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ...product.toObject(), id: String(product._id) });
}));

router.delete("/products/:id", asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
}));

router.post("/categories", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const cat = await Category.create({ name: body.name, slug: body.slug || String(body.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), description: body.description || "", image_url: body.image_url || "", display_order: Number(body.display_order ?? 0), is_active: body.is_active ?? true });
  res.status(201).json({ ...cat.toObject(), id: String(cat._id) });
}));

router.put("/categories/:id", asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
  if (!cat) return res.status(404).json({ error: "Category not found" });
  res.json({ ...cat.toObject(), id: String(cat._id) });
}));

router.delete("/categories/:id", asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  res.json({ ok: true });
}));

export default router;
