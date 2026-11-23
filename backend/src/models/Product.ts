import mongoose, { Schema } from "mongoose";
const ProductSchema = new Schema({
  name: String, slug: { type: String, index: true }, description: String, details: String,
  category_id: { type: Schema.Types.ObjectId, ref: "Category" },
  default_gemstone_id: { type: Schema.Types.ObjectId, ref: "Gemstone", default: null },
  default_metal_id: { type: Schema.Types.ObjectId, ref: "MetalVariant", default: null },
  occasion: { type: String, default: "Everyday" }, price_inr: { type: Number, default: 0 },
  original_price_inr: { type: Number, default: null }, sku: String, stock_quantity: { type: Number, default: 0 },
  is_in_stock: { type: Boolean, default: true }, badge: String, metal_purity: String, metal_weight: String,
  gemstone_weight: String, gemstone_quality: String, setting: String, certification: String,
  shipping_info: String, return_policy: String, is_active: { type: Boolean, default: true },
}, { timestamps: true });
export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const ProductImageSchema = new Schema({ product_id: { type: Schema.Types.ObjectId, ref: "Product", index: true }, url: String, alt_text: String, sort_order: { type: Number, default: 0 }, is_primary: { type: Boolean, default: false }, is_hover: { type: Boolean, default: false } }, { timestamps: true });
export const ProductImage = mongoose.models.ProductImage || mongoose.model("ProductImage", ProductImageSchema);
