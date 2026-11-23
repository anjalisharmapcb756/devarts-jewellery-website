import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../lib/pricing";
import { CATALOGUE, productFallback } from "../data/catalogue";

export default function Cart() {
  const { cart, products, removeFromCart, updateCartQuantity } = useStore();
  const subtotal = cart.reduce((s, i) => s + Number(i.unitPrice || 0) * i.quantity, 0);

  const findProduct = (id) => CATALOGUE.find((p) => p.id === id || p.slug === id)
    || (products || []).find((p) => String(p.id) === String(id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Cart</h1>
      {!cart.length ? (
        <p className="mt-8 text-muted">Your cart is empty. <Link to="/products" className="text-accent hover:underline">Shop now</Link></p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.map((item) => {
              const product = findProduct(item.productId);
              const fallback = productFallback(item.productId);
              const selection = Object.entries(item.selection || {})
                .filter(([, value]) => value)
                .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`)
                .join(" · ");
              return (
                <div key={item.key} className="flex gap-4 border border-border bg-white p-4">
                  <Link to={`/products/${product?.slug || item.productId}`} className="h-28 w-24 shrink-0 overflow-hidden bg-surface-muted">
                    <img
                      src={product?.image || fallback}
                      alt={product?.name || "Cart item"}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${product?.slug || item.productId}`} className="text-sm hover:text-accent">{product?.name || `Product ${item.productId}`}</Link>
                    {selection && <p className="mt-1 text-xs text-muted">{selection}</p>}
                    <p className="mt-1 text-sm text-muted">{formatPrice(item.unitPrice)} each</p>
                    <div className="mt-3 flex items-center gap-3">
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateCartQuantity(item.key, Number(e.target.value))} className="w-20 border border-border px-2 py-1" aria-label="Quantity" />
                      <button onClick={() => removeFromCart(item.key)} className="text-sm text-[#8a4b4b] hover:underline">Remove</button>
                    </div>
                  </div>
                  <span className="text-sm">{formatPrice(Number(item.unitPrice || 0) * item.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="h-fit border border-border bg-white p-6">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <p className="mt-2 text-xs text-muted">Shipping and discounts are calculated at checkout.</p>
            <Link to="/checkout" className="mt-6 block bg-foreground px-8 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
