import mongoose, { Schema } from "mongoose";

const AdminSettingSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  siteName: { type: String, required: true, default: "Vara" },
  currency: { type: String, required: true, default: "INR" },
}, { timestamps: true });

export type AdminSettingDoc = {
  key: string;
  siteName: string;
  currency: string;
};

export const AdminSetting = mongoose.models.AdminSetting || mongoose.model("AdminSetting", AdminSettingSchema);
