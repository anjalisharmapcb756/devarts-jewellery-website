"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

const STORAGE_KEY = "vara-recently-viewed";
const MAX_ITEMS = 4;

type RecentlyViewedProps = {
  currentProductId: string;
  products: Product[];
};

export function RecentlyViewed({ currentProductId, products }: RecentlyViewedProps) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem("aurea-recently-viewed");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [currentProductId, ...ids.filter((id) => id !== currentProductId)].slice(0, 8);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const lookup = new Map(products.map((p) => [p.id, p]));
      const resolved = next
        .filter((id) => id !== currentProductId)
        .map((id) => lookup.get(id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, MAX_ITEMS);
      setItems(resolved);
    } catch {
      setItems([]);
    }
  }, [currentProductId, products]);

  if (!items.length) return null;

  return (
    <section className="border-t border-border py-16 sm:py-20">
      <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
        Recently Viewed
      </p>
      <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        Continue Exploring
      </h2>
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}