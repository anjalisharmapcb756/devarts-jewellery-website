import "server-only";
import fs from "node:fs";
import path from "node:path";
import { products as mockProducts } from "@/lib/data/products";

export function isDemoMode() { return !process.env.MONGODB_URI; }

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  freeShippingThreshold: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Vara",
  supportEmail: "support@vara.example.com",
  supportPhone: "+91 00000 00000",
  announcement: "Complimentary insured shipping on orders above ₹50,000",
  freeShippingThreshold: "50000",
};

type DemoDB = {
  categories: any[];
  gemstones: any[];
  metals: any[];
  products: any[];
  productImages: any[];
  orders: any[];
  orderItems: any[];
  customers: any[];
  addresses: any[];
  settings?: StoreSettings;
};

const DATA_PATH = path.join(process.cwd(), ".data", "admin-demo.json");
function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }

function seed(): DemoDB {
  const categories = [
    { id: "cat_rings", name: "Rings", slug: "rings", description: "Rings", image_url: null, display_order: 1, is_active: true },
    { id: "cat_earrings", name: "Earrings", slug: "earrings", description: "Earrings", image_url: null, display_order: 2, is_active: true },
    { id: "cat_necklaces", name: "Necklaces", slug: "necklaces", description: "Necklaces", image_url: null, display_order: 3, is_active: true },
    { id: "cat_bracelets", name: "Bracelets", slug: "bracelets", description: "Bracelets", image_url: null, display_order: 4, is_active: true },
    { id: "cat_engagement", name: "Engagement Rings", slug: "engagement-rings", description: "Engagement Rings", image_url: null, display_order: 5, is_active: true },
    { id: "cat_wedding", name: "Wedding Jewellery", slug: "wedding-jewellery", description: "Wedding Jewellery", image_url: null, display_order: 6, is_active: true },
    { id: "cat_mens", name: "Men's Jewellery", slug: "mens-jewellery", description: "Men's Jewellery", image_url: null, display_order: 7, is_active: true },
  ];
  const gemstones = [
    { id: "gem_diamond", name: "Diamond", slug: "diamond", color_hex: "#dbe4ee", is_active: true },
    { id: "gem_emerald", name: "Emerald", slug: "emerald", color_hex: "#4f8a6b", is_active: true },
    { id: "gem_ruby", name: "Ruby", slug: "ruby", color_hex: "#a34d5d", is_active: true },
    { id: "gem_sapphire", name: "Sapphire", slug: "sapphire", color_hex: "#4f6ea8", is_active: true },
    { id: "gem_pearl", name: "Pearl", slug: "pearl", color_hex: "#efe7da", is_active: true },
  ];
  const metals = [
    { id: "met_yg", name: "Yellow Gold", slug: "yellow-gold", purity: "18K", is_active: true },
    { id: "met_wg", name: "White Gold", slug: "white-gold", purity: "18K", is_active: true },
    { id: "met_rg", name: "Rose Gold", slug: "rose-gold", purity: "18K", is_active: true },
    { id: "met_pt", name: "Platinum", slug: "platinum", purity: "950", is_active: true },
  ];
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const gemByName = Object.fromEntries(gemstones.map((g) => [g.name, g.id]));
  const metByName = Object.fromEntries(metals.map((m) => [m.name, m.id]));
  const products = mockProducts.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description, details: p.details || null,
    category_id: catByName[p.category] || catByName["Rings"],
    default_gemstone_id: gemByName[p.gemstone] || null,
    default_metal_id: metByName[p.metal] || null,
    occasion: p.occasion || "Everyday", price_inr: p.price, original_price_inr: p.originalPrice ?? null,
    sku: `VARA-${p.id.toUpperCase()}`, stock_quantity: p.inStock ? 10 : 0, is_in_stock: p.inStock,
    badge: p.badge || null, metal_purity: p.specifications?.metalPurity || null,
    metal_weight: p.specifications?.metalWeight || null, gemstone_weight: p.specifications?.gemstoneWeight || null,
    gemstone_quality: p.specifications?.gemstoneQuality || null, setting: p.specifications?.setting || null,
    certification: p.specifications?.certification || null, shipping_info: p.shippingInfo || null,
    return_policy: p.returnPolicy || null, is_active: true,
    created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
  }));
  const productImages = mockProducts.flatMap((p) => [
    { id: uid("img"), product_id: p.id, url: p.image, alt_text: p.name, sort_order: 0, is_primary: true, is_hover: false },
    { id: uid("img"), product_id: p.id, url: p.hoverImage || p.image, alt_text: `${p.name} alternate`, sort_order: 1, is_primary: false, is_hover: true },
  ]);
  const customers = [
    { id: "cust_1", full_name: "Aarav Mehta", email: "aarav@example.com", phone: "+91 9876543210", role: "customer", created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
    { id: "cust_2", full_name: "Isha Kapoor", email: "isha@example.com", phone: "+91 9876501234", role: "customer", created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  ];
  const addresses = [
    { id: "addr_1", user_id: "cust_1", label: "Home", full_name: "Aarav Mehta", line1: "12 Park Street", line2: "Andheri West", city: "Mumbai", state: "Maharashtra", postal_code: "400053", country: "India", phone: "+91 9876543210", is_default: true, created_at: new Date().toISOString() },
  ];
  const now = Date.now();
  const orders = [
    { id: "ord_1", order_number: "VARA-1001", user_id: "cust_1", status: "delivered", payment_status: "paid", subtotal_inr: 89500, discount_inr: 0, shipping_inr: 0, total_inr: 89500, placed_at: new Date(now - 12 * 86400000).toISOString(), shipping_address_id: "addr_1", customer_addresses: addresses[0], profiles: { full_name: "Aarav Mehta", email: "aarav@example.com", phone: "+91 9876543210" } },
    { id: "ord_2", order_number: "VARA-1002", user_id: "cust_2", status: "processing", payment_status: "paid", subtotal_inr: 64500, discount_inr: 0, shipping_inr: 0, total_inr: 64500, placed_at: new Date(now - 3 * 86400000).toISOString(), shipping_address_id: null, customer_addresses: null, profiles: { full_name: "Isha Kapoor", email: "isha@example.com", phone: "+91 9876501234" } },
  ];
  const orderItems = [
    { id: "oi_1", order_id: "ord_1", product_id: "p1", product_name: "Aurora Diamond Ring", quantity: 1, unit_price_inr: 89500, line_total_inr: 89500, metal: "Yellow Gold", gemstone: "Diamond", gemstone_size: "1.0 ct", ring_size: "14" },
    { id: "oi_2", order_id: "ord_2", product_id: "p2", product_name: "Celeste Pearl Pendant", quantity: 1, unit_price_inr: 64500, line_total_inr: 64500, metal: "Yellow Gold", gemstone: "Pearl", gemstone_size: "7 mm", ring_size: null },
  ];
  return { categories, gemstones, metals, products, productImages, orders, orderItems, customers, addresses, settings: { ...DEFAULT_SETTINGS } };
}

export function readDemoDB(): DemoDB {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as DemoDB;
      db.settings = { ...DEFAULT_SETTINGS, ...(db.settings || {}) };
      return db;
    }
  } catch {}
  const db = seed(); writeDemoDB(db); return db;
}
export function writeDemoDB(db: DemoDB) { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf8"); }
export function nextId(prefix: string) { return uid(prefix); }


