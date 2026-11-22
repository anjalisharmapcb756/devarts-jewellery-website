import mongoose, { Schema, models } from "mongoose";
const CategorySchema = new Schema({ name: String, slug: { type: String, index: true }, description: String, image_url: String, display_order: { type: Number, default: 0 }, is_active: { type: Boolean, default: true } }, { timestamps: true });
export const Category = models.Category || mongoose.model("Category", CategorySchema);
const GemstoneSchema = new Schema({ name: String, slug: String, color_hex: String, is_active: { type: Boolean, default: true } }, { timestamps: true });
export const Gemstone = models.Gemstone || mongoose.model("Gemstone", GemstoneSchema);
const MetalSchema = new Schema({ name: String, slug: String, purity: String, is_active: { type: Boolean, default: true } }, { timestamps: true });
export const MetalVariant = models.MetalVariant || mongoose.model("MetalVariant", MetalSchema);
