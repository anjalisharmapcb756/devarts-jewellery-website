import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-[#f6f3ee] text-[#292521]">
      <div className="min-h-full lg:pl-72">
        <AdminSidebar adminName={admin.fullName || admin.email} />
        <div className="min-h-screen">
          <header className="border-b border-[#e3ddd4] bg-[#fdfbf8]/90 px-6 py-5 backdrop-blur sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Vara Administration</p>
                <p className="mt-1 text-sm text-[#6e6861]">Manage catalogue, orders, customers, and store operations.</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs tracking-[0.14em] text-[#8a7453] uppercase">Admin</p>
                <p className="text-sm text-[#292521]">{admin.email}</p>
              </div>
            </div>
          </header>
          <main className="px-6 py-8 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}