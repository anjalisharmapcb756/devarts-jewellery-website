import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
// settings moved to /admin/settings
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCustomers, mongoGetOrders, mongoGetProducts } from "@/lib/admin/mongo-store";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage products, orders, and store content.",
};

export const instant = false;

function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "short" });
}

export default async function AdminDashboardPage() {
  await connection();
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;
  let totalProducts = 0;
  let recentOrders: any[] = [];
  let sales: { label: string; value: number }[] = [];

  if (isMongoConfigured()) {
    try {
      const [orders, prods, customers] = await Promise.all([mongoGetOrders("", ""), mongoGetProducts(""), mongoGetCustomers("")]);
      totalOrders = orders.length;
      totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total_inr ?? 0), 0);
      totalProducts = prods.length;
      totalCustomers = customers.length;
      recentOrders = orders.slice(0, 6);
      const buckets: { label: string; value: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ label: monthLabel(dt), value: 0 }); }
      for (const o of orders) { const dt = new Date(o.placed_at || o.createdAt || Date.now()); const bucket = buckets.find((b) => b.label === monthLabel(dt)); if (bucket) bucket.value += Number(o.total_inr ?? 0); }
      sales = buckets;
    } catch {}
  } else {
    const d = readDemoDB();
    totalOrders = d.orders.length;
    totalRevenue = d.orders.reduce((sum, o) => sum + Number(o.total_inr ?? 0), 0);
    totalProducts = d.products.length;
    totalCustomers = d.customers.length;
    recentOrders = [...d.orders].sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at)).slice(0, 6);
    const buckets: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ label: monthLabel(dt), value: 0 }); }
    for (const o of d.orders) { const dt = new Date(o.placed_at); const bucket = buckets.find((b) => b.label === monthLabel(dt)); if (bucket) bucket.value += Number(o.total_inr ?? 0); }
    sales = buckets;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Overview</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[#292521]">Dashboard</h1>
      </div>

      {!isMongoConfigured() ? (<div className="border border-[#d8c7a7] bg-[#fff8ec] p-5 text-sm text-[#6b5631]">Demo mode: no database configured. Admin data is stored locally in <code>.data/admin-demo.json</code>.</div>) : null}
      {isMongoConfigured() ? (
        <div className="border border-[#cfe0d0] bg-[#f4fbf4] p-5 text-sm text-[#35543a]">
          MongoDB connected. Admin data is being read from MongoDB.
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
            <Link href="/admin/analytics" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">Sales analytics</Link>
            <Link href="/admin/settings" className="border border-[#ddd5ca] px-4 py-3 text-sm text-[#292521] hover:border-[#a88755]">Website settings</Link>
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