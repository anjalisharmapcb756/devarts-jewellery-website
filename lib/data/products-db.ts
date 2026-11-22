import { connectDB } from "@/lib/mongodb";
import { Category, Gemstone, MetalVariant } from "@/lib/models/Catalog";
import { Product as ProductModel, ProductImage } from "@/lib/models/Product";
import type { Gemstone as GemstoneT, MetalType, Product, ProductReview, ProductSpecifications } from "@/types/product";
import { products as mockProducts } from "@/lib/data/products";

type DbRow = Record<string, any>;
function isMongoConfigured() { return Boolean(process.env.MONGODB_URI); }
function asGemstone(v: string | null | undefined): GemstoneT { const allowed: GemstoneT[] = ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"]; return allowed.includes(v as GemstoneT) ? (v as GemstoneT) : "Diamond"; }
function asMetal(v: string | null | undefined): MetalType { const allowed: MetalType[] = ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"]; return allowed.includes(v as MetalType) ? (v as MetalType) : "Yellow Gold"; }

function mapProduct(row: DbRow): Product {
  const category = row.categories?.name ?? row.category_name ?? "Rings";
  const images: DbRow[] = row.product_images ?? [];
  const sortedImages = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primary = sortedImages.find((i) => i.is_primary) ?? sortedImages[0];
  const hover = sortedImages.find((i) => i.is_hover) ?? sortedImages[1];
  const gallery = sortedImages.map((i) => i.url).filter(Boolean);
  const options: DbRow[] = row.product_customization_options ?? [];
  const activeOpts = options.filter((o) => o.is_active !== false);
  const metals = activeOpts.filter((o) => o.option_type === "metal").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const gems = activeOpts.filter((o) => o.option_type === "gemstone").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const sizes = activeOpts.filter((o) => o.option_type === "gemstone_size").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const ringSizes = activeOpts.filter((o) => o.option_type === "ring_size").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const optionPricing = {
    metals: Object.fromEntries(metals.map((o) => [o.label, Number(o.price_delta_inr ?? 0)])) as Partial<Record<MetalType, number>>,
    gemstones: Object.fromEntries(gems.map((o) => [o.label, Number(o.price_delta_inr ?? 0)])) as Partial<Record<GemstoneT, number>>,
    gemstoneSizes: Object.fromEntries(sizes.map((o) => [o.label, Number(o.price_delta_inr ?? 0)])) as Record<string, number>,
  };
  const reviews: ProductReview[] = (row.reviews ?? []).filter((r: DbRow) => r.is_approved !== false).map((r: DbRow) => ({ id: String(r.id || r._id), author: r.author_name ?? r.profiles?.full_name ?? "Vara Customer", rating: Number(r.rating ?? 5), title: r.title ?? "Beautiful piece", content: r.content ?? "", date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "", verified: Boolean(r.is_verified_purchase) }));
  const specs: ProductSpecifications = { metalPurity: row.metal_purity ?? "18K", metalWeight: row.metal_weight ?? "—", gemstoneWeight: row.gemstone_weight ?? "—", gemstoneQuality: row.gemstone_quality ?? "—", setting: row.setting ?? "—", certification: row.certification ?? "Vara Certified" };
  return {
    id: String(row.id || row._id), slug: row.slug, name: row.name, description: row.description ?? "", details: row.details ?? undefined,
    price: Number(row.price_inr ?? 0), originalPrice: row.original_price_inr != null ? Number(row.original_price_inr) : undefined,
    currency: row.currency ?? "INR", category: category as any, jewelleryType: category as any,
    gemstone: asGemstone(row.default_gemstone?.name ?? row.gemstones?.name), metal: asMetal(row.default_metal?.name ?? row.metal_variants?.name),
    occasion: (row.occasion ?? "Everyday") as any, image: primary?.url ?? "/images/references/1.jpg", hoverImage: hover?.url ?? primary?.url,
    images: gallery.length ? gallery : [primary?.url ?? "/images/references/1.jpg"], inStock: row.is_in_stock ?? (Number(row.stock_quantity ?? 0) > 0),
    badge: row.badge ?? undefined, rating: Number(row.rating ?? 0), reviewCount: Number(row.review_count ?? 0), specifications: specs,
    availableMetals: metals.length ? metals.map((m) => asMetal(m.label)) : ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"],
    availableGemstones: gems.length ? gems.map((g) => asGemstone(g.label)) : ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"],
    gemstoneSizes: sizes.length ? sizes.map((s) => s.label) : ["0.50 ct", "1.00 ct", "1.50 ct", "2.00 ct"],
    ringSizes: ringSizes.length ? ringSizes.map((s) => s.label) : undefined, optionPricing, reviews,
  };
}

async function getMongoProducts(): Promise<Product[]> {
  await connectDB();
  const [rows, cats, gems, mets, imgs] = await Promise.all([
    ProductModel.find({ is_active: true }).sort({ createdAt: 1 }).lean(),
    Category.find().lean(), Gemstone.find().lean(), MetalVariant.find().lean(), ProductImage.find().lean(),
  ]);
  const catMap = Object.fromEntries(cats.map((c: any) => [String(c._id), c]));
  const gemMap = Object.fromEntries(gems.map((g: any) => [String(g._id), g]));
  const metMap = Object.fromEntries(mets.map((m: any) => [String(m._id), m]));
  const imgsByProduct: Record<string, any[]> = {};
  for (const im of imgs as any[]) { const k = String(im.product_id); (imgsByProduct[k] ||= []).push(im); }
  return (rows as any[]).map((r) => mapProduct({
    ...r, id: String(r._id),
    categories: catMap[String(r.category_id)] ? { name: catMap[String(r.category_id)].name, slug: catMap[String(r.category_id)].slug } : null,
    default_gemstone: gemMap[String(r.default_gemstone_id)] ? { name: gemMap[String(r.default_gemstone_id)].name } : null,
    default_metal: metMap[String(r.default_metal_id)] ? { name: metMap[String(r.default_metal_id)].name } : null,
    product_images: imgsByProduct[String(r._id)] || [],
    product_customization_options: [], reviews: [],
  }));
}

export async function getProductsAsync(): Promise<Product[]> {
  if (isMongoConfigured()) { try { const list = await getMongoProducts(); return list.length ? list : mockProducts; } catch { return mockProducts; } }
  return mockProducts;
}

export async function getProductBySlugAsync(slug: string): Promise<Product | undefined> {
  if (isMongoConfigured()) { try { const list = await getMongoProducts(); return list.find((p) => p.slug === slug) || mockProducts.find((p) => p.slug === slug); } catch { return mockProducts.find((p) => p.slug === slug); } }
  return mockProducts.find((p) => p.slug === slug);
}

export async function getRelatedProductsAsync(product: Product, all?: Product[]): Promise<Product[]> {
  const list = all ?? (await getProductsAsync());
  return list.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
}
