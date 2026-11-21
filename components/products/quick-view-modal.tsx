"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/components/store/store-provider";
import { BagIcon, CloseIcon, HeartIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const wished = wishlist.includes(product.id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#292521]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="relative grid max-h-[90vh] w-full max-w-5xl overflow-auto bg-surface md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 text-muted transition hover:text-foreground"
          aria-label="Close quick view"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="relative min-h-[320px] bg-surface-muted md:min-h-[560px]">
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="p-8 sm:p-10">
          <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">{product.category}</p>
          <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-4xl">{product.name}</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-lg text-foreground">{formatCurrency(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-sm text-muted line-through">{formatCurrency(product.originalPrice)}</span>
            ) : null}
            {discount > 0 ? (
              <span className="text-xs tracking-[0.14em] text-accent-strong uppercase">{discount}% Off</span>
            ) : null}
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted">Gemstone</dt><dd className="mt-1 text-foreground">{product.gemstone}</dd></div>
            <div><dt className="text-muted">Metal</dt><dd className="mt-1 text-foreground">{product.metal}</dd></div>
            <div><dt className="text-muted">Occasion</dt><dd className="mt-1 text-foreground">{product.occasion}</dd></div>
            <div><dt className="text-muted">Availability</dt><dd className="mt-1 text-foreground">{product.inStock ? "In Stock" : "Out of Stock"}</dd></div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="flex flex-1 items-center justify-center gap-2 bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong"
            >
              <BagIcon className="h-4 w-4" /> Add to Bag
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="flex items-center justify-center gap-2 border border-border px-6 py-4 text-xs font-medium tracking-[0.2em] text-foreground uppercase transition hover:border-accent"
            >
              <HeartIcon className={`h-4 w-4 ${wished ? "fill-accent stroke-accent" : ""}`} />
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          </div>
          <Link href={`/products/${product.slug}`} className="mt-6 inline-block text-sm tracking-wide text-accent-strong underline underline-offset-4 transition hover:text-foreground">
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
