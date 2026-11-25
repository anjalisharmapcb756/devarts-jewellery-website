import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema({
  code: { type: String, unique: true, required: true },
  discount_type: { type: String, enum: ["percentage", "flat"], default: "flat" },
  discount_value: { type: Number, required: true },
  min_order_inr: { type: Number, default: 0 },
  max_discount_inr: Number,
  starts_at: Date,
  ends_at: Date,
  usage_limit: Number,
  used_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });
export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

const PaymentTransactionSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: "Order", index: true },
  user_id: String,
  provider: String,
  provider_order_id: String,
  provider_payment_id: { type: String, default: null },
  provider_signature: String,
  amount_inr: Number,
  currency: String,
  status: String,
  error_code: String,
  error_description: String,
  raw_payload: Schema.Types.Mixed,
}, { timestamps: true });

PaymentTransactionSchema.index(
  { provider_payment_id: 1 },
  { unique: true, partialFilterExpression: { provider_payment_id: { $type: "string" } } },
);

export const PaymentTransaction = mongoose.models.PaymentTransaction || mongoose.model("PaymentTransaction", PaymentTransactionSchema);
