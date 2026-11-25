import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";

export default function AccountOrderDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setLoading(true);
    apiFetch(`/orders/${encodeURIComponent(id)}`)
      .then((data) => { if (active) setOrder(data?.order || null); })
      .catch(() => { if (active) setOrder(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, id]);

  if (authLoading || loading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">
        Order not found. <Link to="/account/orders" className="text-accent">Back to orders</Link>
      </div>
    );
  }

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
