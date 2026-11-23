import { Router } from "express";
import { connectDB } from "../config/db.js";
import { Category, Gemstone, MetalVariant } from "../models/Catalog.js";
import { Product, ProductImage } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

function mapProduct(r: any, catMap: any, gemMap: any, metMap: any, imgs: any[]) {
  const sortedImages = [...imgs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primary = sortedImages.find((i) => i.is_primary) ?? sortedImages[0];
  const hover = sortedImages.find((i) => i.is_hover) ?? sortedImages[1];
  const gallery = sortedImages.map((i) => i.url).filter(Boolean);
  const category = catMap[String(r.category_id)]?.name ?? "Rings";
  return {
    id: String(r._id), slug: r.slug, name: r.name, description: r.description ?? "", details: r.details ?? "",
    price: Number(r.price_inr ?? 0), originalPrice: r.original_price_inr != null ? Number(r.original_price_inr) : undefined,
    currency: "INR", category, jewelleryType: category,
    gemstone: gemMap[String(r.default_gemstone_id)]?.name ?? "Diamond",
    metal: metMap[String(r.default_metal_id)]?.name ?? "Yellow Gold",
    occasion: r.occasion ?? "Everyday",
    image: primary?.url ?? "/images/references/1.jpg", hoverImage: hover?.url ?? primary?.url,
    images: gallery.length ? gallery : [primary?.url ?? "/images/references/1.jpg"],
    inStock: r.is_in_stock ?? (Number(r.stock_quantity ?? 0) > 0),
    badge: r.badge ?? undefined, rating: 0, reviewCount: 0,
    specifications: { metalPurity: r.metal_purity ?? "18K", metalWeight: r.metal_weight ?? "-", gemstoneWeight: r.gemstone_weight ?? "-", gemstoneQuality: r.gemstone_quality ?? "-", setting: r.setting ?? "-", certification: r.certification ?? "Vara Certified" },
    availableMetals: ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"],
    availableGemstones: ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"],
    gemstoneSizes: ["0.50 ct", "1.00 ct", "1.50 ct", "2.00 ct"],
  };
}

async function loadProducts() {
  await connectDB();
  const [rows, cats, gems, mets, imgs] = await Promise.all([
    Product.find({ is_active: true }).sort({ createdAt: 1 }).lean(),
    Category.find().lean(), Gemstone.find().lean(), MetalVariant.find().lean(), ProductImage.find().lean(),
  ]);
  const catMap = Object.fromEntries((cats as any[]).map((c) => [String(c._id), c]));
  const gemMap = Object.fromEntries((gems as any[]).map((g) => [String(g._id), g]));
  const metMap = Object.fromEntries((mets as any[]).map((m) => [String(m._id), m]));
  const imgsByProduct: Record<string, any[]> = {};
  for (const im of imgs as any[]) { const k = String(im.product_id); (imgsByProduct[k] ||= []).push(im); }
  return (rows as any[]).map((r) => mapProduct(r, catMap, gemMap, metMap, imgsByProduct[String(r._id)] || []));
}

router.get("/", asyncHandler(async (_req, res) => {
  const products = await loadProducts();
  res.json({ products });
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const products = await loadProducts();
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
}));

export default router;
