import { createClient } from "@/lib/supabase/server";
import type { Gemstone, MetalType, Product, ProductReview, ProductSpecifications } from "@/types/product";
import { products as mockProducts } from "@/lib/data/products";

type DbRow = Record<string, any>;

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project"));
}

function asGemstone(v: string | null | undefined): Gemstone {
  const allowed: Gemstone[] = ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"];
  return allowed.includes(v as Gemstone) ? (v as Gemstone) : "Diamond";
}

function asMetal(v: string | null | undefined): MetalType {
  const allowed: MetalType[] = ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"];
  return allowed.includes(v as MetalType) ? (v as MetalType) : "Yellow Gold";
}

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
    gemstones: Object.fromEntries(gems.map((o) => [o.label, Number(o.price_delta_inr ?? 0)])) as Partial<Record<Gemstone, number>>,
    gemstoneSizes: Object.fromEntries(sizes.map((o) => [o.label, Number(o.price_delta_inr ?? 0)])) as Record<string, number>,
  };

  const reviews: ProductReview[] = (row.reviews ?? [])
    .filter((r: DbRow) => r.is_approved !== false)
    .map((r: DbRow) => ({
      id: r.id,
      author: r.author_name ?? r.profiles?.full_name ?? "Vara Customer",
      rating: Number(r.rating ?? 5),
      title: r.title ?? "Beautiful piece",
      content: r.content ?? "",
      date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "",
      verified: Boolean(r.is_verified_purchase),
    }));

  const specs: ProductSpecifications = {
    metalPurity: row.metal_purity ?? "18K",
    metalWeight: row.metal_weight ?? "—",
    gemstoneWeight: row.gemstone_weight ?? "—",
    gemstoneQuality: row.gemstone_quality ?? "—",
    setting: row.setting ?? "—",
    certification: row.certification ?? "Vara Certified",
  };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    details: row.details ?? undefined,
    price: Number(row.price_inr ?? 0),
    originalPrice: row.original_price_inr != null ? Number(row.original_price_inr) : undefined,
    currency: row.currency ?? "INR",
    category: category as any,
    jewelleryType: category as any,
    gemstone: asGemstone(row.default_gemstone?.name ?? row.gemstones?.name),
    metal: asMetal(row.default_metal?.name ?? row.metal_variants?.name),
    occasion: (row.occasion ?? "Everyday") as any,
    image: primary?.url ?? "/images/references/1.jpg",
    hoverImage: hover?.url ?? undefined,
    images: gallery.length ? gallery : [primary?.url ?? "/images/references/1.jpg"],
    inStock: row.is_in_stock ?? (Number(row.stock_quantity ?? 0) > 0),
    badge: row.badge ?? undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    specifications: specs,
    availableMetals: metals.length ? metals.map((m) => asMetal(m.label)) : ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"],
    availableGemstones: gems.length ? gems.map((g) => asGemstone(g.label)) : ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"],
    gemstoneSizes: sizes.length ? sizes.map((s) => s.label) : ["0.50 ct", "1.00 ct", "1.50 ct", "2.00 ct"],
    ringSizes: ringSizes.length ? ringSizes.map((s) => s.label) : undefined,
    optionPricing,
    reviews,
  };
}

const PRODUCT_SELECT = `
  *,
  categories:category_id (name, slug),
  default_gemstone:default_gemstone_id (name, slug),
  default_metal:default_metal_id (name, slug),
  product_images (url, alt_text, sort_order, is_primary, is_hover),
  product_customization_options (option_type, label, value_key, price_delta_inr, sort_order, is_default, is_active),
  reviews (id, rating, title, content, is_verified_purchase, is_approved, created_at)
`;

export async function getProductsAsync(): Promise<Product[]> {
  if (!isConfigured()) return mockProducts;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error || !data?.length) return mockProducts;
    return data.map(mapProduct);
  } catch {
    return mockProducts;
  }
}

export async function getProductBySlugAsync(slug: string): Promise<Product | undefined> {
  if (!isConfigured()) return mockProducts.find((p) => p.slug === slug);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return mockProducts.find((p) => p.slug === slug);
    return mapProduct(data);
  } catch {
    return mockProducts.find((p) => p.slug === slug);
  }
}

export async function getRelatedProductsAsync(product: Product, all?: Product[]): Promise<Product[]> {
  const list = all ?? (await getProductsAsync());
  return list.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
}
