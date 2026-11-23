import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const orderNumber = params.get("orderNumber") || "";
  const orderId = params.get("orderId") || "";
  const method = params.get("method") || "";
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId || !user) return undefined;
    let active = true;
    let attempt = 0;
    const load = () => {
      apiFetch(`/orders/${encodeURIComponent(orderId)}`)
        .then((d) => { if (active) setOrder(d?.order || null); })
        .catch(() => {
          if (!active || attempt >= 2) return;
          attempt += 1;
          window.setTimeout(load, 600);
        });
    };
    load();
    return () => { active = false; };
  }, [orderId, user]);

  const displayNumber = order?.orderNumber || orderNumber;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-accent text-2xl text-accent">✓</div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-accent">Thank You</p>
      <h1 className="mt-3 font-display text-5xl">Order Confirmed</h1>
      <p className="mt-4 text-muted">
        Your order has been received{displayNumber ? ` (${displayNumber})` : ""}. We’ll send updates as it is processed.
      </p>

      {order && (
        <div className="mt-8 border border-border bg-white p-6 text-left text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p><span className="text-muted">Status: </span>{order.status}</p>
            <p><span className="text-muted">Payment: </span>{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentStatus}</p>
            <p><span className="text-muted">Total: </span>{formatPrice(order.total)}</p>
            <p><span className="text-muted">Date: </span>{new Date(order.date).toLocaleDateString()}</p>
          </div>
          {(order.items || []).length > 0 && <p className="mt-4 border-t border-border pt-4 text-muted">{order.items.join(" · ")}</p>}
        </div>
      )}

      {!order && method === "cod" && <p className="mt-4 text-sm text-muted">You can pay in cash when your order arrives.</p>}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/account/orders" className="bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent">View Orders</Link>
        <Link to="/products" className="border border-border px-8 py-3 text-[11px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">Continue Shopping</Link>
      </div>
    </div>
  );
}
