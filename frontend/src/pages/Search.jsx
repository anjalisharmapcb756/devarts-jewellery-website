import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatPrice } from "../lib/pricing";
import { useStore } from "../context/StoreContext";
import { mergeCatalogue, productFallback } from "../data/catalogue";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const { products } = useStore();
  const catalog = mergeCatalogue(products || []);
  const filtered = q
    ? catalog.filter((p) => `${p.name} ${p.category} ${p.gemstone} ${p.metal}`.toLowerCase().includes(q.toLowerCase()))
    : catalog;
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl">Search</h1>
      <form className="mt-6 flex gap-3" onSubmit={(e) => { e.preventDefault(); setParams(query ? { q: query } : {}); }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jewellery..." className="w-full max-w-md border border-border px-4 py-3 outline-none focus:border-accent" />
        <button className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white hover:bg-accent">Search</button>
      </form>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="block">
            <div className="aspect-[3/4] overflow-hidden bg-surface-muted"><img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id); }} /></div>
            <div className="mt-3 text-sm">{p.name}</div><div className="text-sm text-muted">{formatPrice(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
