import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage products, orders, and store content.",
};

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project"));
}

function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "short" });
}

export default async function AdminDashboardPage() {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;
  let totalProducts = 0;
  let recentOrders: any[] = [];
  let sales: { label: string; value: number }[] = [];

  if (isConfigured()) {
    try {
      const supabase = await createClient();
      const [ordersRes, productsRes, customersRes, recentRes, salesRes] = await Promise.all([
        supabase.from("orders").select("total_inr"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("id, order_number, status, payment_status, total_inr, placed_at, profiles:profiles(full_name,email)").order("placed_at", { ascending: false }).limit(6),
        supabase.from("orders").select("total_inr, placed_at").gte("placed_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const orders = ordersRes.data ?? [];
      totalOrders = orders.length;
      totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_inr ?? 0), 0);
      totalProducts = productsRes.count ?? 0;
      totalCustomers = customersRes.count ?? 0;
      recentOrders = recentRes.data ?? [];

      const buckets: { label: string; value: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ label: monthLabel(d), value: 0 });
      }
      for (const o of salesRes.data ?? []) {
        const d = new Date(o.placed_at);
        const label = monthLabel(d);
        const bucket = buckets.find((b) => b.label === label);
        if (bucket) bucket.value += Number(o.total_inr ?? 0);
      }
      sales = buckets;
    } catch {
      // Keep defaults; dashboard shows empty state.
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Overview</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[#292521]">Dashboard</h1>
      </div>

      {!isConfigured() ? (
        <div className="border border-[#d8c7a7] bg-[#fff8ec] p-5 text-sm text-[#6b5631]">
          Supabase is not configured. Add credentials to <code>.env.local</code> to load live admin data.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} hint="All-time order total" />
        <StatCard label="Total Orders" value={String(totalOrders)} hint="Orders placed" />
        <StatCard label="Total Customers" value={String(totalCustomers)} hint="Registered customers" />
        <StatCard label="Total Products" value={String(totalProducts)} hint="Catalogue products" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SalesChart data={sales} />

        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">Quick Actions</p>
          <h2 className="mt-2 font-display text-3xl text-[#292521]">Manage store</h2>
          <div className="mt-6 grid gap-3">
            <Link href="/admin/products" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">Manage products</Link>
            <Link href="/admin/orders" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">View orders</Link>
            <Link href="/admin/customers" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">View customers</Link>
            <Link href="/admin/categories" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">Manage categories & variants</Link>
          </div>
        </div>
      </div>

      <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">Recent Orders</p>
            <h2 className="mt-2 font-display text-3xl text-[#292521]">Latest activity</h2>
          </div>
          <Link href="/admin/orders" className="text-xs tracking-[0.14em] text-[#8a7453] uppercase hover:text-[#292521]">View all</Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase">
              <tr>
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Payment</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td className="py-6 text-[#6e6861]" colSpan={6}>No orders found.</td></tr>
              ) : recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#eee8df]">
                  <td className="py-4 pr-4"><Link href={`/admin/orders/${o.id}`} className="text-[#292521] hover:text-[#8a7453]">{o.order_number || o.id.slice(0, 8)}</Link></td>
                  <td className="py-4 pr-4 text-[#6e6861]">{o.profiles?.full_name || o.profiles?.email || "Customer"}</td>
                  <td className="py-4 pr-4"><span className="inline-block bg-[#f3ede4] px-2 py-1 text-[11px] tracking-[0.1em] text-[#6b5631] uppercase">{o.status}</span></td>
                  <td className="py-4 pr-4"><span className="inline-block bg-[#f3ede4] px-2 py-1 text-[11px] tracking-[0.1em] text-[#6b5631] uppercase">{o.payment_status}</span></td>
                  <td className="py-4 pr-4 text-[#292521]">{formatCurrency(Number(o.total_inr ?? 0))}</td>
                  <td className="py-4 text-[#6e6861]">{o.placed_at ? new Date(o.placed_at).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}