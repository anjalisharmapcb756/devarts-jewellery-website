import type { Metadata } from "next";
import { connection } from "next/server";
import { SalesChart } from "@/components/admin/sales-chart";
import { StatCard } from "@/components/admin/stat-card";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetOrders, mongoGetProducts } from "@/lib/admin/mongo-store";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Sales Analytics | Admin" };

export const instant = false;

function monthLabel(d: Date) { return d.toLocaleString("en-US", { month: "short" }); }

export default async function AdminAnalyticsPage() {
  await connection();
  let orders: any[] = [];
  let products: any[] = [];
  if (isMongoConfigured()) {
    try { [orders, products] = await Promise.all([mongoGetOrders("", ""), mongoGetProducts("")]); } catch {}
  } else {
    const d = readDemoDB(); orders = d.orders; products = d.products;
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_inr ?? 0), 0);
  const paidRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total_inr ?? 0), 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;

  const now = new Date();
  const buckets: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ label: monthLabel(dt), value: 0 }); }
  for (const o of orders) { const dt = new Date(o.placed_at || o.createdAt || Date.now()); const bucket = buckets.find((b) => b.label === monthLabel(dt)); if (bucket) bucket.value += Number(o.total_inr ?? 0); }

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => { const k = String(o.status || "unknown"); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const paymentCounts = orders.reduce((acc: Record<string, number>, o) => { const k = String(o.payment_status || "unknown"); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const maxStatus = Math.max(1, ...Object.values(statusCounts) as number[]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Analytics</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[#292521]">Sales Analytics</h1>
        <p className="mt-2 text-sm text-[#6e6861]">Revenue, order, and catalogue performance from backend data.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} hint="All orders" />
        <StatCard label="Paid Revenue" value={formatCurrency(paidRevenue)} hint="Paid orders" />
        <StatCard label="Orders" value={String(orders.length)} hint="Total orders" />
        <StatCard label="Avg. Order Value" value={formatCurrency(avgOrder)} hint={`${products.length} products in catalogue`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SalesChart data={buckets} />
        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">Order Status</p>
          <h2 className="mt-2 font-display text-3xl text-[#292521]">Breakdown</h2>
          <div className="mt-6 space-y-4">
            {Object.keys(statusCounts).length === 0 ? <p className="text-sm text-[#6e6861]">No order data.</p> : Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-xs tracking-[0.08em] text-[#6e6861] uppercase"><span>{status}</span><span>{count}</span></div>
                <div className="h-2 bg-[#f3ede4]"><div className="h-2 bg-[#a88755]" style={{ width: `${(Number(count) / maxStatus) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-[#eee8df] pt-5">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[#8a7453] uppercase">Payment Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(paymentCounts).map(([k, v]) => (
                <span key={k} className="bg-[#f3ede4] px-3 py-2 text-[11px] tracking-[0.1em] text-[#6b5631] uppercase">{k}: {v}</span>
              ))}
              {Object.keys(paymentCounts).length === 0 ? <span className="text-sm text-[#6e6861]">No payment data.</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
