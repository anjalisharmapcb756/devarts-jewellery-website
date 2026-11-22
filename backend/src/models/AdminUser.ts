import mongoose, { Schema, type InferSchemaType } from "mongoose";

const roles = ["super_admin"] as const;
export type AdminRole = (typeof roles)[number];

const adminUserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "" },
  role: { type: String, enum: roles, default: "super_admin" },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

// Enforce only one Super Admin account.
adminUserSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: "super_admin" } });

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema> & { _id: mongoose.Types.ObjectId };
export const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
export const ADMIN_ROLES = roles;
