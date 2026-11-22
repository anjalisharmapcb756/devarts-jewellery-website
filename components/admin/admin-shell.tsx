"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Sales Analytics" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/gemstones", label: "Gemstones" },
  { href: "/admin/metals", label: "Metal Variants" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Website Settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {nav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block px-4 py-3 text-sm tracking-[0.06em] transition ${active ? "bg-[#3a3631] text-[#d9c39a]" : "text-[#d8d2ca] hover:bg-[#332f2a] hover:text-white"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ adminName, adminEmail, isDemo, children }: { adminName?: string | null; adminEmail?: string | null; isDemo?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-[#f6f3ee] text-[#292521]">
      <div className="min-h-full lg:pl-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#3a3631] bg-[#292521] px-4 py-3 text-white lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-2 py-2 text-sm tracking-[0.08em] uppercase" aria-label="Open menu">
            <span className="block h-4 w-5"><span className="block h-px w-5 bg-[#d9c39a]" /><span className="mt-1.5 block h-px w-5 bg-[#d9c39a]" /><span className="mt-1.5 block h-px w-5 bg-[#d9c39a]" /></span>
            Menu
          </button>
          <Link href="/admin" className="font-display text-2xl text-white">Vara</Link>
          <Link href="/" className="text-xs tracking-[0.12em] text-[#c9b28a] uppercase">Store</Link>
        </div>

        {/* Mobile overlay */}
        {open ? <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} /> : null}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#3a3631] bg-[#292521] text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-[#3a3631] px-6 py-7">
            <div>
              <Link href="/admin" onClick={() => setOpen(false)} className="font-display text-3xl tracking-tight text-white">Vara</Link>
              <p className="mt-1 text-[11px] tracking-[0.24em] text-[#c9b28a] uppercase">Admin Dashboard</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 text-[#a89f95] hover:text-white lg:hidden" aria-label="Close menu">✕</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-5"><NavLinks onNavigate={() => setOpen(false)} /></nav>
          <div className="border-t border-[#3a3631] px-6 py-5">
            <p className="text-xs tracking-[0.14em] text-[#a89f95] uppercase">Signed in</p>
            <p className="mt-1 truncate text-sm text-[#efe7dc]">{adminName || "Administrator"}</p>
            <div className="mt-4 flex items-center gap-4 text-xs tracking-[0.12em] uppercase">
              <Link href="/" className="text-[#c9b28a] hover:text-white">View Store</Link>
              <form action={logoutAction}><button type="submit" className="text-[#a89f95] hover:text-white uppercase tracking-[0.12em]">Sign out</button></form>
            </div>
          </div>
        </aside>

        <div className="min-h-screen">
          <header className="border-b border-[#e3ddd4] bg-[#fdfbf8]/90 px-4 py-5 backdrop-blur sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Vara Administration</p>
                <p className="mt-1 text-sm text-[#6e6861]">Manage catalogue, orders, customers, and store operations.</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs tracking-[0.14em] text-[#8a7453] uppercase">{isDemo ? "Demo Admin" : "Admin"}</p>
                <p className="text-sm text-[#292521]">{adminEmail}</p>
              </div>
            </div>
            {isDemo ? <div className="mt-4 border border-[#d8c7a7] bg-[#fff8ec] px-4 py-3 text-xs text-[#6b5631]">Demo mode: database is not configured. Admin data is stored locally.</div> : null}
          </header>
          <main className="px-4 py-6 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
