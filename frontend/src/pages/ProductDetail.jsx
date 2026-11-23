import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import { useStore } from "../context/StoreContext";
import { CATALOGUE, METAL_OPTIONS, mergeCatalogue, productFallback } from "../data/catalogue";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fallback = CATALOGUE.find((p) => p.slug === slug) || CATALOGUE.find((p) => p.id === slug) || CATALOGUE[0];
  const [product, setProduct] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [metal, setMetal] = useState(fallback?.metal || METAL_OPTIONS[0]);
  const [size, setSize] = useState(fallback?.sizes?.[0] || "");
  const [added, setAdded] = useState(false);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  useEffect(() => {
    setLoading(true);
    apiFetch(`/products/${slug}`)
      .then((d) => setProduct(d?.product ? mergeCatalogue([d.product])[0] : fallback))
      .catch(() => setProduct(fallback))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) {
      setMetal(product.metal || METAL_OPTIONS[0]);
      setSize(product.sizes?.[0] || "");
    }
  }, [product]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Product not found.</div>;

  const wished = wishlist.some((w) => (typeof w === "string" ? w === product.id : (w?.id || w?.productId) === product.id));
  const cartItem = { productId: product.id, quantity: qty, unitPrice: product.price ?? product.price_inr, selection: { metal, gemstone: product.gemstone, size } };

  const handleAdd = () => { addToCart(cartItem); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  const handleBuyNow = () => { addToCart(cartItem); navigate("/checkout"); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden bg-surface-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(product.id); }} />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent">{product.category}{product.gemstone ? ` · ${product.gemstone}` : ""}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl">{formatPrice(product.price ?? product.price_inr)}</p>
          <p className="mt-1 text-sm text-muted">Inclusive of all taxes</p>
          <p className="mt-6 leading-7 text-muted">{product.description}</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-[0.16em] text-muted block mb-2">Metal</label>
              <div className="flex flex-wrap gap-2">{(product.metalOptions || METAL_OPTIONS).map((m) => <button key={m} onClick={() => setMetal(m)} className={`px-4 py-2 text-sm border ${metal === m ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{m}</button>)}</div>
            </div>
            {(product.sizes?.length > 0 || /ring/i.test(product.category || "")) && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.16em] text-muted block mb-2">Size</label>
                <div className="flex flex-wrap gap-2">{(product.sizes || ["4","5","6","7","8","9"]).map((s) => <button key={s} onClick={() => setSize(s)} className={`w-11 h-11 text-sm border ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{s}</button>)}</div>
              </div>
            )}
            <div>
              <label className="text-[11px] uppercase tracking-[0.16em] text-muted block mb-2">Quantity</label>
              <div className="inline-flex border border-border"><button onClick={() => setQty((v) => Math.max(1, v - 1))} className="w-10 h-10">-</button><span className="w-12 h-10 grid place-items-center border-x border-border">{qty}</span><button onClick={() => setQty((v) => v + 1)} className="w-10 h-10">+</button></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={handleBuyNow} className="flex-1 bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition">Buy Now</button>
            <button onClick={handleAdd} className="flex-1 border border-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] hover:bg-foreground hover:text-white transition">{added ? "Added to Cart" : "Add to Cart"}</button>
            <button onClick={() => toggleWishlist(product.id)} className="border border-border px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent transition">{wished ? "Wishlisted" : "Wishlist"}</button>
          </div>

          <div className="mt-10 border-t border-border pt-6 space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.2em]">Product Details</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm"><dt className="text-muted">Metal</dt><dd>{metal}</dd><dt className="text-muted">Gemstone</dt><dd>{product.gemstone || "—"}</dd><dt className="text-muted">Style</dt><dd>{product.style || "Classic"}</dd><dt className="text-muted">SKU</dt><dd>{String(product.id).toUpperCase()}</dd></dl>
            <ul className="mt-4 space-y-2 text-sm text-muted">{(product.details || ["BIS Hallmarked Gold","Ethically sourced gemstones","Handcrafted by master artisans","Complimentary luxury packaging"]).map((d) => <li key={d} className="flex gap-2"><span className="text-accent">•</span>{d}</li>)}</ul>
          </div>

          <div className="mt-6 border-t border-border pt-6 grid sm:grid-cols-3 gap-4 text-sm text-muted">
            <div><p className="text-foreground font-medium">Free Shipping</p><p>On orders above ₹10,000</p></div>
            <div><p className="text-foreground font-medium">Easy Returns</p><p>15-day return policy</p></div>
            <div><p className="text-foreground font-medium">Certified</p><p>BIS hallmarked jewellery</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
