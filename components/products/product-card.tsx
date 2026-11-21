"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store/store-provider";
import { BagIcon, HeartIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";

export type ProductCardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  hoverImage?: string;
  badge?: string;
  inStock?: boolean;
};

type ProductCardProps = {
  product: ProductCardProduct;
  onQuickView?: (product: ProductCardProduct) => void;
};

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [hovered, setHovered] = useState(false);
  const wished = wishlist.includes(product.id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article className="group">
      <div
        className="relative overflow-hidden bg-surface-muted"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[4/5]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className={`object-cover transition duration-700 ease-out ${hovered && product.hoverImage ? "opacity-0 scale-[1.03]" : "opacity-100 group-hover:scale-[1.03]"}`}
            />
            {product.hoverImage ? (
              <Image
                src={product.hoverImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                className={`object-cover transition duration-700 ease-out ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"}`}
              />
            ) : null}
          </div>
        </Link>

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.badge ? (
            <span className="bg-surface/92 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-foreground uppercase backdrop-blur">
              {product.badge}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="bg-[#292521]/90 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-white uppercase">
              {discount}% Off
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/92 text-foreground backdrop-blur transition hover:bg-surface"
        >
          <HeartIcon className={`h-5 w-5 ${wished ? "fill-accent stroke-accent" : ""}`} />
        </button>

        <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="flex flex-1 items-center justify-center gap-2 bg-foreground px-4 py-3 text-[11px] font-medium tracking-[0.18em] text-background uppercase transition hover:bg-accent-strong"
            >
              <BagIcon className="h-4 w-4" />
              Add to Bag
            </button>
            {onQuickView ? (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="bg-surface/95 px-4 py-3 text-[11px] font-medium tracking-[0.14em] text-foreground uppercase backdrop-blur transition hover:bg-surface"
              >
                Quick View
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="mt-2 block">
          <h3 className="font-display text-2xl tracking-tight text-foreground transition hover:text-accent-strong">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="text-foreground">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-muted line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>
        {product.inStock === false ? (
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Out of Stock</p>
        ) : null}
      </div>
    </article>
  );
}
