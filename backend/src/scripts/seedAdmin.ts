import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { AdminUser } from "../models/AdminUser.js";

async function seed() {
  const email = env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in environment.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();
  await AdminUser.syncIndexes().catch(() => undefined);

  const existingAdmin = await AdminUser.findOne({ role: "super_admin" });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existingAdmin) {
    if (existingAdmin.email.toLowerCase() !== email) {
      console.error(
        `A Super Admin already exists (${existingAdmin.email}). Only one Super Admin is allowed. ` +
        "No additional admin was created."
      );
      await disconnectDB();
      process.exit(1);
    }
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.name = "Super Admin";
    existingAdmin.isActive = true;
    await existingAdmin.save();
    console.log(`Updated existing Super Admin: ${email}`);
  } else {
    await AdminUser.create({
      email,
      passwordHash,
      name: "Super Admin",
      role: "super_admin",
      isActive: true,
    });
    console.log(`Seeded Super Admin: ${email}`);
  }

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error("Seed failed", err);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
