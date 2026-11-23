import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";

export default function AccountOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => { if (user) apiFetch("/orders").then((d) => setOrders(d?.orders || [])).catch((e) => setErr(e.message)); }, [user]);
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">My Orders</h1>
      {err && <p className="mt-4 text-sm text-[#8a4b4b]">{err}</p>}
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <Link key={o.id} to={`/account/orders/${o.id}`} className="block border border-border p-5 hover:border-accent transition">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{o.orderNumber || o.id}</div>
                <div className="text-sm text-muted">{new Date(o.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{formatPrice(o.total)}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-muted">{o.status}</div>
              </div>
            </div>
          </Link>
        ))}
        {!orders.length && !err && <p className="text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
