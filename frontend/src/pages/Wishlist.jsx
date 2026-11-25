import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../lib/pricing";
import { mergeCatalogue, productFallback } from "../data/catalogue";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, products } = useStore();
  const catalog = mergeCatalogue(products || []);
  const wishedIds = new Set(wishlist.map((item) => String(typeof item === "string" ? item : item?.productId ?? item?.id ?? item?.slug)));
  const items = catalog.filter((p) => wishedIds.has(String(p.id)) || wishedIds.has(String(p.slug)));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Wishlist</h1>
      {!items.length ? <p className="mt-8 text-muted">Your wishlist is empty.</p> : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="group">
              <Link to={`/products/${p.slug}`} className="block aspect-[3/4] overflow-hidden bg-surface-muted">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id); }} />
              </Link>
              <div className="mt-3 text-sm">{p.name}</div>
              <div className="text-sm text-muted">{formatPrice(p.price)}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => addToCart({ productId: p.id, quantity: 1, unitPrice: p.price })} className="bg-foreground px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-accent">Add to Cart</button>
                <button onClick={() => toggleWishlist(p.id)} className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.14em]">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
