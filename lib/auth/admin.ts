import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSession } from "@/lib/auth/session";

export type AdminProfile = {
  id: string;
  email: string | null;
  role: "admin" | "customer";
  fullName: string | null;
  isDemo?: boolean;
};

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "admin") return null;
  await connectDB();
  const user = await User.findById(session.sub).lean();
  if (!user || user.role !== "admin") return null;
  return { id: String(user._id), email: user.email ?? null, role: "admin", fullName: user.fullName ?? null };
}

export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) redirect("/login?next=/admin");
  return profile;
}

export async function assertAdmin() {
  const profile = await getAdminProfile();
  if (!profile) throw new Error("Unauthorized: admin access required.");
  return profile;
}
