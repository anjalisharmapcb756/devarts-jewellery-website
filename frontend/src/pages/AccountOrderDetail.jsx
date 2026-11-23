import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";

export default function AccountOrderDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  useEffect(() => { if (user) apiFetch("/orders").then((d) => setOrder((d?.orders || []).find((o) => String(o.id) === String(id)) || null)).catch(() => {}); }, [user, id]);
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!order) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Order not found. <Link to="/account/orders" className="text-accent">Back to orders</Link></div>;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/account/orders" className="text-sm text-muted hover:text-accent">← Back to orders</Link>
      <h1 className="mt-4 font-display text-4xl">Order {order.orderNumber || order.id}</h1>
      <div className="mt-6 border border-border p-6 space-y-2 text-sm">
        <div><span className="text-muted">Date:</span> {new Date(order.date).toLocaleString()}</div>
        <div><span className="text-muted">Status:</span> {order.status}</div>
        <div><span className="text-muted">Payment:</span> {order.paymentStatus}</div>
        <div><span className="text-muted">Total:</span> {formatPrice(order.total)}</div>
        <div><span className="text-muted">Items:</span> {(order.items || []).join(", ")}</div>
      </div>
    </div>
  );
}
