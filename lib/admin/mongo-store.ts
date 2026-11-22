import "server-only";
import { connectDB } from "@/lib/mongodb";
import { Category, Gemstone, MetalVariant } from "@/lib/models/Catalog";
import { Product, ProductImage } from "@/lib/models/Product";
import { CustomerAddress, Order, OrderItem } from "@/lib/models/Order";
import { Setting } from "@/lib/models/Setting";
import { User } from "@/lib/models/User";
import { products as mockProducts } from "@/lib/data/products";

export function isMongoConfigured() { return Boolean(process.env.MONGODB_URI); }

function idOf(doc: any) { return String(doc?._id ?? doc?.id ?? ""); }

async function seedIfEmpty() {
  await connectDB();
  const [catCount, gemCount, metalCount, prodCount] = await Promise.all([Category.countDocuments(), Gemstone.countDocuments(), MetalVariant.countDocuments(), Product.countDocuments()]);
  if (catCount === 0) {
    await Category.insertMany([
      { name: "Rings", slug: "rings", description: "Rings", display_order: 1, is_active: true },
      { name: "Earrings", slug: "earrings", description: "Earrings", display_order: 2, is_active: true },
      { name: "Necklaces", slug: "necklaces", description: "Necklaces", display_order: 3, is_active: true },
      { name: "Bracelets", slug: "bracelets", description: "Bracelets", display_order: 4, is_active: true },
      { name: "Engagement Rings", slug: "engagement-rings", description: "Engagement Rings", display_order: 5, is_active: true },
      { name: "Wedding Jewellery", slug: "wedding-jewellery", description: "Wedding Jewellery", display_order: 6, is_active: true },
      { name: "Men's Jewellery", slug: "mens-jewellery", description: "Men's Jewellery", display_order: 7, is_active: true },
    ]);
  }
  if (gemCount === 0) await Gemstone.insertMany([{ name: "Diamond", slug: "diamond", color_hex: "#dbe4ee", is_active: true }, { name: "Emerald", slug: "emerald", color_hex: "#4f8a6b", is_active: true }, { name: "Ruby", slug: "ruby", color_hex: "#a34d5d", is_active: true }, { name: "Sapphire", slug: "sapphire", color_hex: "#4f6ea8", is_active: true }, { name: "Pearl", slug: "pearl", color_hex: "#efe7da", is_active: true }]);
  if (metalCount === 0) await MetalVariant.insertMany([{ name: "Yellow Gold", slug: "yellow-gold", purity: "18K", is_active: true }, { name: "White Gold", slug: "white-gold", purity: "18K", is_active: true }, { name: "Rose Gold", slug: "rose-gold", purity: "18K", is_active: true }, { name: "Platinum", slug: "platinum", purity: "950", is_active: true }]);
  if (prodCount === 0) {
    const cats = await Category.find().lean();
    const gems = await Gemstone.find().lean();
    const mets = await MetalVariant.find().lean();
    const catByName = Object.fromEntries(cats.map((c: any) => [c.name, c._id]));
    const gemByName = Object.fromEntries(gems.map((g: any) => [g.name, g._id]));
    const metByName = Object.fromEntries(mets.map((m: any) => [m.name, m._id]));
    for (const p of mockProducts) {
      const doc = await Product.create({
        name: p.name, slug: p.slug, description: p.description, details: p.details || null,
        category_id: catByName[p.category] || catByName["Rings"], default_gemstone_id: gemByName[p.gemstone] || null, default_metal_id: metByName[p.metal] || null,
        occasion: p.occasion || "Everyday", price_inr: p.price, original_price_inr: p.originalPrice ?? null, sku: `VARA-${p.id.toUpperCase()}`,
        stock_quantity: p.inStock ? 10 : 0, is_in_stock: p.inStock, badge: p.badge || null,
        metal_purity: p.specifications?.metalPurity || null, metal_weight: p.specifications?.metalWeight || null, gemstone_weight: p.specifications?.gemstoneWeight || null,
        gemstone_quality: p.specifications?.gemstoneQuality || null, setting: p.specifications?.setting || null, certification: p.specifications?.certification || null,
        shipping_info: p.shippingInfo || null, return_policy: p.returnPolicy || null, is_active: true,
      });
      await ProductImage.insertMany([
        { product_id: doc._id, url: p.image, alt_text: p.name, sort_order: 0, is_primary: true, is_hover: false },
        { product_id: doc._id, url: p.hoverImage || p.image, alt_text: `${p.name} alternate`, sort_order: 1, is_primary: false, is_hover: true },
      ]);
    }
  }
}

function mapDoc(doc: any) { if (!doc) return null; const o = { ...doc, id: idOf(doc) }; return o; }

export async function mongoGetCategories() { await seedIfEmpty(); return (await Category.find().sort({ display_order: 1 }).lean()).map(mapDoc); }
export async function mongoGetGemstones() { await seedIfEmpty(); return (await Gemstone.find().sort({ name: 1 }).lean()).map(mapDoc); }
export async function mongoGetMetals() { await seedIfEmpty(); return (await MetalVariant.find().sort({ name: 1 }).lean()).map(mapDoc); }

export async function mongoGetProducts(q = "") { await seedIfEmpty(); const filter: any = {}; if (q) filter.name = { $regex: q, $options: "i" }; const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean(); const cats = await Category.find().lean(); const catMap = Object.fromEntries(cats.map((c: any) => [String(c._id), c.name])); return products.map((p: any) => ({ ...mapDoc(p), categories: { name: catMap[String(p.category_id)] || "—" } })); }

export async function mongoGetProductById(id: string) { await seedIfEmpty(); await connectDB(); const p = await Product.findById(id).lean(); if (!p) return null; const images = await ProductImage.find({ product_id: p._id }).sort({ sort_order: 1 }).lean(); return { product: mapDoc(p), images: images.map(mapDoc) }; }

export async function mongoUpsertCategory(payload: any, id?: string) { await seedIfEmpty(); if (id) await Category.findByIdAndUpdate(id, payload); else await Category.create(payload); }
export async function mongoDeleteCategory(id: string) { await seedIfEmpty(); await Category.findByIdAndDelete(id); }
export async function mongoUpsertGemstone(payload: any, id?: string) { await seedIfEmpty(); if (id) await Gemstone.findByIdAndUpdate(id, payload); else await Gemstone.create(payload); }
export async function mongoDeleteGemstone(id: string) { await seedIfEmpty(); await Gemstone.findByIdAndDelete(id); }
export async function mongoUpsertMetal(payload: any, id?: string) { await seedIfEmpty(); if (id) await MetalVariant.findByIdAndUpdate(id, payload); else await MetalVariant.create(payload); }
export async function mongoDeleteMetal(id: string) { await seedIfEmpty(); await MetalVariant.findByIdAndDelete(id); }

export async function mongoUpsertProduct(payload: any, id?: string, imageUrl?: string, hoverImageUrl?: string) {
  await seedIfEmpty();
  let doc: any;
  if (id) doc = await Product.findByIdAndUpdate(id, payload, { new: true }); else doc = await Product.create(payload);
  const pid = doc._id;
  if (imageUrl) { await ProductImage.deleteMany({ product_id: pid, sort_order: 0 }); await ProductImage.create({ product_id: pid, url: imageUrl, alt_text: payload.name, sort_order: 0, is_primary: true, is_hover: false }); }
  if (hoverImageUrl) { await ProductImage.deleteMany({ product_id: pid, sort_order: 1 }); await ProductImage.create({ product_id: pid, url: hoverImageUrl, alt_text: `${payload.name} alternate`, sort_order: 1, is_primary: false, is_hover: true }); }
  return String(pid);
}

export async function mongoDeleteProduct(id: string) { await seedIfEmpty(); await Product.findByIdAndDelete(id); await ProductImage.deleteMany({ product_id: id }); }

export async function mongoGetOrders(q = "", status = "") { await seedIfEmpty(); const filter: any = {}; if (status) filter.status = status; if (q) filter.order_number = { $regex: q, $options: "i" }; const orders = await Order.find(filter).sort({ placed_at: -1 }).limit(100).lean(); return orders.map((o: any) => ({ ...mapDoc(o), profiles: o.profiles || null })); }
export async function mongoGetOrderById(id: string) { await seedIfEmpty(); const o = await Order.findById(id).lean(); if (!o) return null; const items = await OrderItem.find({ order_id: o._id }).lean(); return { order: mapDoc(o), items: items.map(mapDoc) }; }
export async function mongoUpdateOrderStatus(id: string, status: string, payment_status: string) { await seedIfEmpty(); await Order.findByIdAndUpdate(id, { status, payment_status }); }

export async function mongoGetCustomers(q = "") { await seedIfEmpty(); const filter: any = { role: "customer" }; if (q) filter.$or = [{ fullName: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }]; const users = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean(); return users.map((u: any) => ({ ...mapDoc(u), full_name: u.fullName, email: u.email, phone: u.phone, role: u.role, created_at: u.createdAt })); }
export async function mongoGetCustomerById(id: string) { await seedIfEmpty(); const u = await User.findById(id).lean(); if (!u) return null; const orders = await Order.find({ user_id: u._id }).sort({ placed_at: -1 }).lean(); const addresses = await CustomerAddress.find({ user_id: u._id }).sort({ createdAt: -1 }).lean(); return { customer: { ...mapDoc(u), full_name: u.fullName, email: u.email, phone: u.phone, role: u.role, created_at: u.createdAt }, orders: orders.map(mapDoc), addresses: addresses.map((a: any) => ({ ...mapDoc(a), user_id: String(a.user_id), is_default: a.is_default, postal_code: a.postal_code, full_name: a.full_name })) }; }

const DEFAULT_SETTINGS = {
  storeName: "Vara",
  supportEmail: "support@vara.example.com",
  supportPhone: "+91 00000 00000",
  announcement: "Complimentary insured shipping on orders above ₹50,000",
  freeShippingThreshold: "50000",
};

export async function mongoGetSettings() {
  await seedIfEmpty();
  const doc = await Setting.findOne({ key: "site" }).lean();
  return { ...DEFAULT_SETTINGS, ...((doc?.value as any) || {}) };
}

export async function mongoUpsertSettings(value: any) {
  await seedIfEmpty();
  const safe = { ...DEFAULT_SETTINGS, ...value };
  await Setting.findOneAndUpdate({ key: "site" }, { $set: { value: safe } }, { upsert: true, new: true });
  return safe;
}
