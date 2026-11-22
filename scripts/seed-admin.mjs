import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.resolve(process.cwd(), file);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}

const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.SEED_ADMIN_PASSWORD;
const fullName = process.env.SEED_ADMIN_NAME?.trim() || "Super Admin";
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}
if (!email || !password) {
  console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
}, { timestamps: true, strict: false });

userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: "admin" } });

const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(mongoUri, { bufferCommands: false });
try {
  await User.syncIndexes().catch(() => undefined);

  const existingAdmin = await User.findOne({ role: "admin" });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existingAdmin) {
    if (existingAdmin.email.toLowerCase() !== email) {
      console.error(
        `A Super Admin already exists (${existingAdmin.email}). Only one Super Admin is allowed. ` +
        "No additional admin was created."
      );
      process.exit(1);
    }
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.fullName = fullName;
    existingAdmin.role = "admin";
    await existingAdmin.save();
    console.log(`Updated existing Super Admin: ${email}`);
  } else {
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      existingByEmail.passwordHash = passwordHash;
      existingByEmail.fullName = fullName;
      existingByEmail.role = "admin";
      await existingByEmail.save();
      console.log(`Promoted existing user to Super Admin: ${email}`);
    } else {
      await User.create({ email, passwordHash, fullName, role: "admin" });
      console.log(`Created Super Admin: ${email}`);
    }
  }
} finally {
  await mongoose.disconnect();
}
