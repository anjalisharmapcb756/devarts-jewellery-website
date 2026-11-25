import { Router } from "express";
import { z } from "zod";
import { requireStoreAdmin } from "../middleware/storeAdmin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Catalog.js";
import { AdminSetting } from "../models/AdminSetting.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

const router = Router();
router.use(requireStoreAdmin);

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

const productFields = {
  name: z.string().trim().min(1, "Product name is required").max(200),
  slug: z.string().trim().min(1).max(240).regex(slugPattern, "Use letters, numbers and hyphens only").optional(),
  description: z.string().max(5000).optional(),
  details: z.union([z.string().max(10_000), z.array(z.string().max(2_000)).max(50)]).optional(),
  category_id: z.union([objectIdSchema, z.literal("").transform(() => undefined)]).optional(),
  price_inr: z.coerce.number().finite().positive("Price must be greater than zero"),
  original_price_inr: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().finite().nonnegative().optional(),
  ),
  sku: z.string().trim().max(100).optional(),
  stock_quantity: z.coerce.number().finite().int().min(0, "Stock cannot be negative"),
  is_in_stock: z.boolean().optional(),
  badge: z.string().trim().max(80).optional(),
  is_active: z.boolean().optional(),
} as const;

const createProductSchema = z.object(productFields).transform((value) => ({
  ...value,
  slug: value.slug || slugify(value.name),
  description: value.description || "",
  details: value.details || "",
  category_id: value.category_id || undefined,
  sku: value.sku || "",
  badge: value.badge || "",
  is_active: value.is_active ?? true,
  is_in_stock: value.is_in_stock ?? value.stock_quantity > 0,
}));

const updateProductSchema = z.object(productFields).partial().transform((value) => {
  if (value.stock_quantity !== undefined && value.is_in_stock === undefined) {
    return { ...value, is_in_stock: value.stock_quantity > 0 };
  }
  return value;
});

const categoryFields = {
  name: z.string().trim().min(1, "Category name is required").max(120),
  slug: z.string().trim().min(1).max(160).regex(slugPattern, "Use letters, numbers and hyphens only").optional(),
  description: z.string().max(2_000).optional(),
  image_url: z.string().trim().max(2_000).optional(),
  display_order: z.coerce.number().finite().int().min(0).optional(),
  is_active: z.boolean().optional(),
} as const;

const createCategorySchema = z.object(categoryFields).transform((value) => ({
  ...value,
  slug: value.slug || slugify(value.name),
  description: value.description || "",
  image_url: value.image_url || "",
  display_order: value.display_order ?? 0,
  is_active: value.is_active ?? true,
}));

const updateCategorySchema = z.object(categoryFields).partial();

const settingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(120),
  currency: z.string().trim().length(3, "Currency must be a 3-letter code").transform((value) => value.toUpperCase()),
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message || "Invalid request.", {
      code: "VALIDATION_ERROR",
      details: result.error.flatten(),
    });
  }
  return result.data;
}

function parseId(value: string) {
  if (!objectIdSchema.safeParse(value).success) {
    throw new ApiError(400, "Invalid id.", { code: "VALIDATION_ERROR" });
  }
  return value;
}

function searchTerm(value: unknown) {
  return escapeRegex(String(value || "").trim().slice(0, 100));
}

router.get("/dashboard", asyncHandler(async (_req, res) => {
  const [orders, products, customers] = await Promise.all([
    Order.find().sort({ placed_at: -1, createdAt: -1 }).lean(),
    Product.find().lean(),
    User.find({ role: "customer" }).lean(),
  ]);
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.total_inr ?? 0), 0);
  res.json({
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    recentOrders: orders.slice(0, 10),
  });
}));

router.get("/products", asyncHandler(async (req, res) => {
  const q = searchTerm(req.query.q);
  const filter: Record<string, unknown> = q ? { name: { $regex: q, $options: "i" } } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  const cats = await Category.find().lean();
  const catMap = Object.fromEntries(cats.map((cat: any) => [String(cat._id), cat.name]));
  res.json(products.map((product: any) => ({
    ...product,
    id: String(product._id),
    categories: { name: catMap[String(product.category_id)] || "-" },
  })));
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const q = searchTerm(req.query.q);
  const status = String(req.query.status || "").trim().slice(0, 40);
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) filter.order_number = { $regex: q, $options: "i" };
  const orders = await Order.find(filter).sort({ placed_at: -1, createdAt: -1 }).lean();
  res.json(orders.map((order: any) => ({ ...order, id: String(order._id) })));
}));

router.get("/customers", asyncHandler(async (req, res) => {
  const q = searchTerm(req.query.q);
  const filter: Record<string, unknown> = { role: "customer" };
  if (q) filter.$or = [{ fullName: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  res.json(users.map((user: any) => ({
    id: String(user._id),
    full_name: user.fullName,
    email: user.email,
    phone: user.phone || "",
    created_at: user.createdAt,
  })));
}));

router.get("/categories", asyncHandler(async (_req, res) => {
  const cats = await Category.find().sort({ display_order: 1, name: 1 }).lean();
  res.json(cats.map((cat: any) => ({ ...cat, id: String(cat._id) })));
}));

router.get("/analytics", asyncHandler(async (_req, res) => {
  const [orders, products, customers] = await Promise.all([
    Order.find().lean(),
    Product.find().lean(),
    User.find({ role: "customer" }).lean(),
  ]);
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.total_inr ?? 0), 0);
  res.json({
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
  });
}));

router.get("/settings", asyncHandler(async (_req, res) => {
  const settings: any = await AdminSetting.findOne({ key: "storefront" }).lean();
  res.json({
    siteName: settings?.siteName || "Vara",
    currency: settings?.currency || "INR",
  });
}));

router.put("/settings", asyncHandler(async (req, res) => {
  const body = parse(settingsSchema, req.body);
  const settings: any = await AdminSetting.findOneAndUpdate(
    { key: "storefront" },
    { $set: body },
    { new: true, upsert: true, runValidators: true },
  ).lean();
  res.json({ siteName: settings.siteName, currency: settings.currency });
}));

router.post("/products", asyncHandler(async (req, res) => {
  const body = parse(createProductSchema, req.body);
  const product = await Product.create(body);
  res.status(201).json({ ...product.toObject(), id: String(product._id) });
}));

router.put("/products/:id", asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  const body = parse(updateProductSchema, req.body);
  const product = await Product.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, "Product not found.", { code: "NOT_FOUND" });
  res.json({ ...product.toObject(), id: String(product._id) });
}));

router.delete("/products/:id", asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(parseId(String(req.params.id)));
  if (!product) throw new ApiError(404, "Product not found.", { code: "NOT_FOUND" });
  res.json({ ok: true });
}));

router.post("/categories", asyncHandler(async (req, res) => {
  const body = parse(createCategorySchema, req.body);
  const cat = await Category.create(body);
  res.status(201).json({ ...cat.toObject(), id: String(cat._id) });
}));

router.put("/categories/:id", asyncHandler(async (req, res) => {
  const id = parseId(String(req.params.id));
  const body = parse(updateCategorySchema, req.body);
  const cat = await Category.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
  if (!cat) throw new ApiError(404, "Category not found.", { code: "NOT_FOUND" });
  res.json({ ...cat.toObject(), id: String(cat._id) });
}));

router.delete("/categories/:id", asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(parseId(String(req.params.id)));
  if (!cat) throw new ApiError(404, "Category not found.", { code: "NOT_FOUND" });
  res.json({ ok: true });
}));

export default router;
