import mongoose, { Schema } from "mongoose";

const WishlistSchema = new Schema({ user_id: { type: String, index: true }, product_id: { type: String } }, { timestamps: true });
WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

const CartSchema = new Schema({ user_id: { type: String, index: true }, product_id: { type: String }, quantity: { type: Number, default: 1 }, selection: { type: Schema.Types.Mixed, default: {} }, unit_price: { type: Number, default: 0 } }, { timestamps: true });
export const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
