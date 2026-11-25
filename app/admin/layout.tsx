import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { robots: noIndex };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell
      adminName={admin.fullName || admin.email}
      adminEmail={admin.email}
      isDemo={admin.isDemo}
    >
      {children}
    </AdminShell>
  );
}
