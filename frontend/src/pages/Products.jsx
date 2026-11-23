import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import { useStore } from "../context/StoreContext";
import { CATEGORIES, GEMSTONE_OPTIONS, METAL_OPTIONS, PRICE_OPTIONS, mergeCatalogue, productFallback } from "../data/catalogue";

const SORTS = [
  { label: "Best Match", value: "best" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "new" },
];

const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#8b6f52" : "none"} stroke={filled ? "#8b6f52" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);

function FilterGroup({ title, options, selected, onChange }) {
  return (
    <div className="border-b border-border py-5">
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <label key={opt} className="flex items-center gap-3 text-sm text-muted cursor-pointer hover:text-foreground">
              <input type="checkbox" checked={active} onChange={() => onChange(opt)} className="h-4 w-4 accent-[#8b6f52]" />
              <span className={active ? "text-foreground" : ""}>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ProductCard({ p, wished, onWish }) {
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
        <Link to={`/products/${p.slug}`}>
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id); }} />
        </Link>
        <button onClick={() => onWish(p)} className="absolute top-3 right-3 grid h-9 w-9 place-items-center bg-white/90 hover:bg-white border border-border/60" aria-label="Wishlist">
          <HeartIcon filled={wished} />
        </button>
        {p.badge && <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em]">{p.badge}</span>}
      </div>
      <Link to={`/products/${p.slug}`} className="block pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{p.category}{p.gemstone ? ` · ${p.gemstone}` : ""}</p>
        <h3 className="mt-1 text-[15px] leading-snug line-clamp-2">{p.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span>{formatPrice(p.price ?? p.price_inr)}</span>
          {p.originalPrice ? <span className="text-muted line-through">{formatPrice(p.originalPrice)}</span> : null}
        </div>
      </Link>
    </div>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("best");
  const [mobileFilters, setMobileFilters] = useState(false);
  const { wishlist, toggleWishlist } = useStore();

  const selectedCategories = useMemo(() => (params.get("category") ? params.get("category").split(",").filter(Boolean) : []), [params]);
  const selectedGemstones = useMemo(() => (params.get("gemstone") ? params.get("gemstone").split(",").filter(Boolean) : []), [params]);
  const selectedMetals = useMemo(() => (params.get("metal") ? params.get("metal").split(",").filter(Boolean) : []), [params]);
  const selectedPrices = useMemo(() => (params.get("price") ? params.get("price").split(",").filter(Boolean) : []), [params]);
  const q = (params.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    apiFetch("/products").then((d) => setProducts(d?.products || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const catalog = useMemo(() => mergeCatalogue(products), [products]);

  const toggleParam = (key, value) => {
    const current = (params.get(key) || "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const p = new URLSearchParams(params);
    if (next.length) p.set(key, next.join(",")); else p.delete(key);
    setParams(p);
  };

  const clearAll = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    setParams(p);
  };

  const filtered = useMemo(() => {
    let list = [...catalog];
    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.category));
    if (selectedGemstones.length) list = list.filter((p) => selectedGemstones.includes(p.gemstone));
    if (selectedMetals.length) list = list.filter((p) => selectedMetals.includes(p.metal));
    if (selectedPrices.length) list = list.filter((p) => selectedPrices.some((label) => {
      const ranges = { "Under ₹25,000": [0, 25000], "₹25,000 - ₹50,000": [25000, 50000], "₹50,000 - ₹1,00,000": [50000, 100000], "Above ₹1,00,000": [100000, Infinity] };
      const r = ranges[label];
      const price = Number(p.price ?? p.price_inr ?? 0);
      return r && price >= r[0] && price < r[1];
    }));
    if (q) list = list.filter((p) => `${p.name} ${p.category} ${p.gemstone} ${p.metal} ${p.style}`.toLowerCase().includes(q));
    if (sort === "price-asc") list.sort((a, b) => Number(a.price ?? a.price_inr) - Number(b.price ?? b.price_inr));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price ?? b.price_inr) - Number(a.price ?? a.price_inr));
    if (sort === "new") list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return list;
  }, [catalog, selectedCategories, selectedGemstones, selectedMetals, selectedPrices, q, sort]);

  const activeFilters = [
    ...selectedCategories.map((v) => ({ key: "category", v })),
    ...selectedGemstones.map((v) => ({ key: "gemstone", v })),
    ...selectedMetals.map((v) => ({ key: "metal", v })),
    ...selectedPrices.map((v) => ({ key: "price", v })),
  ];

  const isWished = (p) => {
    const pid = p.id || p.slug;
    return wishlist.some((w) => (typeof w === "string" ? w === pid : (w?.id || w?.productId || w?.slug) === pid));
  };
  const onWish = (p) => toggleWishlist(p.id || p.slug);

  const Filters = (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-sm uppercase tracking-[0.18em]">Filters</h2>
        {activeFilters.length > 0 && <button onClick={clearAll} className="text-xs text-accent underline">Clear All</button>}
      </div>
      <FilterGroup title="Category" options={CATEGORIES} selected={selectedCategories} onChange={(v) => toggleParam("category", v)} />
      <FilterGroup title="Gemstone" options={GEMSTONE_OPTIONS} selected={selectedGemstones} onChange={(v) => toggleParam("gemstone", v)} />
      <FilterGroup title="Metal" options={METAL_OPTIONS} selected={selectedMetals} onChange={(v) => toggleParam("metal", v)} />
      <FilterGroup title="Price" options={PRICE_OPTIONS} selected={selectedPrices} onChange={(v) => toggleParam("price", v)} />
    </>
  );

  return (
    <div>
      <section className="border-b border-border bg-surface-muted/30">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Jewellery</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">All Jewellery</h1>
          <p className="mt-3 max-w-2xl text-muted">Explore handcrafted rings, necklaces, earrings, bracelets, and engagement rings inspired by the world’s finest jewellery catalogues.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5 mb-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden border border-border px-4 py-2 text-xs uppercase tracking-[0.14em]" onClick={() => setMobileFilters(true)}>Filters</button>
            <span className="text-sm text-muted">{loading ? "Loading..." : `${filtered.length} Designs`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Sort By</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-border bg-transparent px-3 py-2 text-sm outline-none">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((f) => (
              <button key={`${f.key}-${f.v}`} onClick={() => toggleParam(f.key, f.v)} className="flex items-center gap-2 border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground">{f.v} <span>×</span></button>
            ))}
            <button onClick={clearAll} className="px-3 py-1.5 text-xs text-accent underline">Clear All</button>
          </div>
        )}

        <div className="flex gap-10">
          <aside className="hidden lg:block w-64 shrink-0">{Filters}</aside>
          <main className="flex-1">
            {filtered.length === 0 && !loading ? (
              <div className="py-20 text-center text-muted">No products match your filters. <button onClick={clearAll} className="text-accent underline">Clear filters</button></div>
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id || p.slug} p={p} wished={isWished(p)} onWish={onWish} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[320px] max-w-full bg-background p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><span className="text-sm uppercase tracking-[0.18em]">Filters</span><button onClick={() => setMobileFilters(false)} className="text-sm">Close</button></div>
            {Filters}
            <button onClick={() => setMobileFilters(false)} className="mt-6 w-full bg-foreground text-background py-3 text-[11px] uppercase tracking-[0.16em]">Show Results</button>
          </div>
        </div>
      )}
    </div>
  );
}
