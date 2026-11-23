import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema({ user_id: { type: Schema.Types.ObjectId, ref: "User", index: true }, label: String, full_name: String, phone: String, line1: String, line2: String, city: String, state: String, postal_code: String, country: { type: String, default: "India" }, is_default: { type: Boolean, default: false } }, { timestamps: true });
export const CustomerAddress = mongoose.models.CustomerAddress || mongoose.model("CustomerAddress", AddressSchema);

const OrderItemSchema = new Schema({ order_id: { type: Schema.Types.ObjectId, ref: "Order", index: true }, product_id: { type: Schema.Types.Mixed, index: true }, product_source: String, product_slug: String, product_image: String, product_name: String, quantity: Number, unit_price_inr: Number, line_total_inr: Number, metal: String, gemstone: String, gemstone_size: String, ring_size: String }, { timestamps: true });
export const OrderItem = mongoose.models.OrderItem || mongoose.model("OrderItem", OrderItemSchema);

const OrderSchema = new Schema({ order_number: String, user_id: { type: Schema.Types.ObjectId, ref: "User", index: true }, status: { type: String, default: "pending" }, payment_status: { type: String, default: "pending" }, subtotal_inr: Number, discount_inr: { type: Number, default: 0 }, coupon_discount_inr: { type: Number, default: 0 }, coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon", default: null }, coupon_code: String, shipping_inr: { type: Number, default: 0 }, total_inr: Number, currency: { type: String, default: "INR" }, shipping_address_id: { type: Schema.Types.ObjectId, ref: "CustomerAddress", default: null }, placed_at: { type: Date, default: Date.now }, paid_at: Date, payment_method: String, razorpay_order_id: String, razorpay_payment_id: String }, { timestamps: true });
export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
