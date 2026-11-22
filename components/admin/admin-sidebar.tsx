"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/gemstones", label: "Gemstones" },
  { href: "/admin/metals", label: "Metal Variants" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminSidebar({ adminName }: { adminName?: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-[#3a3631] bg-[#292521] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="px-6 py-7 border-b border-[#3a3631]">
        <Link href="/admin" className="font-display text-3xl tracking-tight text-white">Vara</Link>
        <p className="mt-1 text-[11px] tracking-[0.24em] text-[#c9b28a] uppercase">Admin Dashboard</p>
      </div>
      <nav className="flex-1 px-4 py-5">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 text-sm tracking-[0.06em] transition ${active ? "bg-[#3a3631] text-[#d9c39a]" : "text-[#d8d2ca] hover:bg-[#332f2a] hover:text-white"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-[#3a3631] px-6 py-5">
        <p className="text-xs tracking-[0.14em] text-[#a89f95] uppercase">Signed in</p>
        <p className="mt-1 truncate text-sm text-[#efe7dc]">{adminName || "Administrator"}</p>
        <div className="mt-4 flex items-center gap-4 text-xs tracking-[0.12em] uppercase">
          <Link href="/" className="text-[#c9b28a] hover:text-white">View Store</Link>
          <form action={logoutAction}>
            <button type="submit" className="text-[#a89f95] hover:text-white uppercase tracking-[0.12em]">Sign out</button>
          </form>
        </div>
      </div>
    </aside>
  );
}