import mongoose, { Schema } from "mongoose";

const SubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: "homepage" },
}, { timestamps: true });

export const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);
