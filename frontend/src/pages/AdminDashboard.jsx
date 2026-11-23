import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import AdminNav from "../components/admin/AdminNav";

const EMPTY_PRODUCTS = [
  { id: "r1", name: "Aurora Diamond Ring", category: "Rings", price_inr: 89500 },
  { id: "n1", name: "Celeste Pearl Pendant", category: "Necklaces", price_inr: 64500 },
  { id: "e1", name: "Lumière Drop Earrings", category: "Earrings", price_inr: 72500 },
];
const ORDER_STATUS = ["Confirmed", "Processing", "Shipped", "Delivered"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [d, o, p, c] = await Promise.all([
          apiFetch("/admin/dashboard").catch(() => null),
          apiFetch("/admin/orders").catch(() => []),
          apiFetch("/admin/products").catch(() => []),
          apiFetch("/admin/customers").catch(() => []),
        ]);
        if (!alive) return;
        setData(d);
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) && p.length ? p : EMPTY_PRODUCTS);
        setCustomers(Array.isArray(c) ? c : []);
      } catch (e) {
        if (alive) setErr(e.message || "Unable to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  const stats = useMemo(() => {
    const totalRevenue = data?.totalRevenue ?? orders.reduce((s, o) => s + Number(o.total_inr ?? o.total ?? 0), 0);
    const totalOrders = data?.totalOrders ?? orders.length;
    const totalCustomers = data?.totalCustomers ?? customers.length;
    const totalProducts = data?.totalProducts ?? products.length;
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    const delivered = orders.filter((o) => /delivered/i.test(o.status || "")).length;
    const pending = orders.filter((o) => !/delivered|cancelled|refund/i.test(o.status || "")).length;
    const lowStock = products.filter((p) => Number(p.stock_quantity ?? p.stock ?? 0) > 0 && Number(p.stock_quantity ?? p.stock ?? 0) <= 5).length;
    return { totalRevenue, totalOrders, totalCustomers, totalProducts, avgOrder, delivered, pending, lowStock };
  }, [data, orders, products, customers]);

  const statusData = useMemo(() => ORDER_STATUS.map((status) => ({
    status,
    count: orders.filter((o) => (o.status || "Pending").toLowerCase() === status.toLowerCase()).length,
  })), [orders]);

  const categoryData = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const c = p.categories?.name || p.category || "Other";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [products]);

  const recentOrders = data?.recentOrders?.length ? data.recentOrders : orders.slice(0, 8);
  const maxStatus = Math.max(1, ...statusData.map((s) => s.count));
  const maxCategory = Math.max(1, ...categoryData.map((c) => c.count));

  if (authLoading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-surface-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Store Analytics</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Super Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted">Welcome, {user.name || user.email}. Here’s how your store is performing.</p>
          </div>
        </div>

        <div className="mt-8">
          <AdminNav />
        </div>

        {err && <p className="mt-6 text-sm text-[#8a4b4b]">{err}</p>}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Revenue", loading ? "…" : formatPrice(stats.totalRevenue)],
            ["Total Orders", loading ? "…" : stats.totalOrders],
            ["Customers", loading ? "…" : stats.totalCustomers],
            ["Products", loading ? "…" : stats.totalProducts],
          ].map(([label, value]) => (
            <div key={label} className="border border-border bg-background p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</div>
              <div className="mt-2 text-2xl font-display">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Avg. Order Value", loading ? "…" : formatPrice(stats.avgOrder)],
            ["Delivered Orders", loading ? "…" : stats.delivered],
            ["Pending Orders", loading ? "…" : stats.pending],
            ["Low Stock Items", loading ? "…" : stats.lowStock],
          ].map(([label, value]) => (
            <div key={label} className="border border-border bg-background p-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</div>
              <div className="mt-2 text-xl font-display">{value}</div>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="border border-border bg-background p-6">
            <h2 className="font-display text-2xl">Order Status</h2>
            <div className="mt-6 space-y-4">
              {statusData.map((s) => (
                <div key={s.status}>
                  <div className="flex justify-between text-sm"><span>{s.status}</span><span className="text-muted">{s.count}</span></div>
                  <div className="mt-2 h-2 bg-surface-muted"><div className="h-2 bg-[#8b6f52]" style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border bg-background p-6">
            <h2 className="font-display text-2xl">Products by Category</h2>
            <div className="mt-6 space-y-4">
              {categoryData.length ? categoryData.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="text-muted">{c.count}</span></div>
                  <div className="mt-2 h-2 bg-surface-muted"><div className="h-2 bg-[#8b6f52]" style={{ width: `${(c.count / maxCategory) * 100}%` }} /></div>
                </div>
              )) : <p className="text-sm text-muted">No catalogue data yet.</p>}
            </div>
          </section>
        </div>

        <section className="mt-8 border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-2xl">Recent Orders</h2>
            <Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.14em] text-accent hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left">
                <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Total</th></tr>
              </thead>
              <tbody>
                {recentOrders.length ? recentOrders.map((o) => (
                  <tr key={o._id || o.id} className="border-t border-border">
                    <td className="p-3">{o.order_number || o.id || "—"}</td>
                    <td className="p-3">{o.customer_email || o.email || o.customer_name || "—"}</td>
                    <td className="p-3">{o.status || "Pending"}</td>
                    <td className="p-3">{formatPrice(o.total_inr || o.total || 0)}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="p-6 text-center text-muted">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-2xl">Top Products</h2>
            <Link to="/admin/products" className="text-[11px] uppercase tracking-[0.14em] text-accent hover:underline">Manage Products</Link>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <div key={p.id || p._id} className="border border-border p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{p.categories?.name || p.category || "Jewellery"}</p>
                <p className="mt-1 font-medium">{p.name}</p>
                <p className="mt-2 text-sm text-muted">{formatPrice(p.price_inr || p.price || 0)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
