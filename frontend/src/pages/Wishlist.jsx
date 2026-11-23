import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [products, setProducts] = useState([]);
  useEffect(() => { apiFetch("/products").then((d) => setProducts(d?.products || [])).catch(() => {}); }, []);
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Wishlist</h1>
      {!items.length ? <p className="mt-8 text-muted">Your wishlist is empty.</p> : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="group">
              <Link to={`/products/${p.slug}`} className="block aspect-[3/4] overflow-hidden bg-surface-muted">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
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
