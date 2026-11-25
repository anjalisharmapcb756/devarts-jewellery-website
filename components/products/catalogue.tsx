"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { FilterSidebar, defaultFilters, type Filters } from "@/components/products/filter-sidebar";
import { QuickViewModal } from "@/components/products/quick-view-modal";
import { Container } from "@/components/ui/container";
import type { Product } from "@/types/product";

type CatalogueProps = {
  products: Product[];
  title: string;
  description: string;
  lockedCategory?: string;
  initialJewelleryType?: string;
  initialQuery?: string;
};

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function matchesPrice(price: number, range: string) {
  if (!range) return true;
  const [min, max] = range.split("-").map((v) => (v === "" ? Infinity : Number(v)));
  if (max === Infinity) return price >= min;
  return price >= min && price <= max;
}

export function Catalogue({
  products,
  title,
  description,
  lockedCategory,
  initialJewelleryType,
  initialQuery = "",
}: CatalogueProps) {
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    jewelleryType: lockedCategory
      ? [lockedCategory]
      : initialJewelleryType
        ? [initialJewelleryType]
        : [],
  });
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(8);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((p) => {
      if (lockedCategory && p.jewelleryType !== lockedCategory) return false;
      if (filters.jewelleryType.length && !filters.jewelleryType.includes(p.jewelleryType)) return false;
      if (!matchesPrice(p.price, filters.priceRange)) return false;
      if (filters.gemstone.length && !filters.gemstone.includes(p.gemstone)) return false;
      if (filters.metal.length && !filters.metal.includes(p.metal)) return false;
      if (filters.occasion.length && !filters.occasion.includes(p.occasion)) return false;
      if (filters.availability.length) {
        const stockLabel = p.inStock ? "In Stock" : "Out of Stock";
        if (!filters.availability.includes(stockLabel)) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.category} ${p.gemstone} ${p.metal} ${p.occasion}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return b.id.localeCompare(a.id, undefined, { numeric: true });
      return 0;
    });
    return result;
  }, [products, filters, sort, lockedCategory, query]);

  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.32em] text-accent-text uppercase">Catalogue</p>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-muted">{description}</p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileFilters(true)}
              className="border border-border px-4 py-2 text-xs tracking-[0.14em] uppercase lg:hidden"
            >
              Filters
            </button>
            <p className="text-sm text-muted">{filtered.length} piece{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisible(8); }}
              placeholder="Search within collection"
              className="border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
              aria-label="Search products"
            />
            <label className="flex items-center gap-3 text-sm text-muted">
              <span className="whitespace-nowrap">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              lockedCategory={lockedCategory}
              onChange={(next) => { setFilters(next); setVisible(8); }}
            />
          </div>

          <div>
            {shown.length ? (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => {
                      const full = products.find((x) => x.id === p.id);
                      if (full) setQuickView(full);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-border bg-surface py-16 text-center">
                <p className="font-display text-2xl text-foreground">No pieces match your filters</p>
                <p className="mt-3 text-sm text-muted">Try adjusting or clearing filters to see more jewellery.</p>
              </div>
            )}

            {canLoadMore ? (
              <div className="mt-14 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 4)}
                  className="border border-foreground px-10 py-4 text-xs font-medium tracking-[0.22em] text-foreground uppercase transition hover:bg-foreground hover:text-background"
                >
                  Load More
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {mobileFilters ? (
        <div className="fixed inset-0 z-[60] bg-[#292521]/35 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-y-0 left-0 w-full max-w-md overflow-auto bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs tracking-[0.2em] text-muted uppercase">Refine</p>
              <button type="button" onClick={() => setMobileFilters(false)} className="text-sm text-muted">Close</button>
            </div>
            <FilterSidebar
              filters={filters}
              lockedCategory={lockedCategory}
              onChange={(next) => { setFilters(next); setVisible(8); }}
            />
          </div>
        </div>
      ) : null}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}
