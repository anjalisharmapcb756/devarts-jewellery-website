import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import AdminNav from "../components/admin/AdminNav";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    apiFetch(`/admin/orders?${params}`).then((d) => setOrders(Array.isArray(d) ? d : [])).catch((e) => setErr(e.message));
  }, [status, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Admin</p>
      <h1 className="mt-2 font-display text-4xl">Orders</h1>
      <AdminNav />
      {err && <p className="mt-4 text-sm text-[#8a4b4b]">{err}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order..." className="flex-1 min-w-[240px] border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-border bg-background px-4 py-3 outline-none">
          <option value="">All Statuses</option>{["Confirmed","Processing","Shipped","Delivered","Cancelled","Refunded"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Date</th></tr></thead>
          <tbody>{orders.map((o) => <tr key={o.id || o._id} className="border-t border-border"><td className="p-3">{o.order_number || o.id}</td><td className="p-3">{o.customer_email || o.email || "—"}</td><td className="p-3">{o.status || "Pending"}</td><td className="p-3">{formatPrice(o.total_inr || o.total || 0)}</td><td className="p-3">{o.placed_at ? new Date(o.placed_at).toLocaleDateString() : "—"}</td></tr>)}
            {!orders.length && <tr><td colSpan="5" className="p-6 text-center text-muted">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
