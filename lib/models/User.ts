import mongoose, { Schema, type InferSchemaType, models } from "mongoose";
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
}, { timestamps: true });

// Enforce a single Super Admin account in MongoDB.
UserSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: "admin" } });
export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const User = models.User || mongoose.model("User", UserSchema);
