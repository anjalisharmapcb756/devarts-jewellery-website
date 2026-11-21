import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  email: string | null;
  role: "admin" | "customer";
  fullName: string | null;
};

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project"));
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  if (!isConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return null;
  return {
    id: profile.id,
    email: profile.email ?? user.email ?? null,
    role: profile.role,
    fullName: profile.full_name ?? null,
  };
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