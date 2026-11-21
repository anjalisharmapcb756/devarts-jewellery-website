"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/store/store-provider";
import { products as mockProducts } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils";
import { BagIcon, HeartIcon } from "@/components/ui/icons";
import type { Product } from "@/types/product";

export function WishlistContent({ products = mockProducts }: { products?: Product[] }) {
  const { wishlist, toggleWishlist, moveWishlistToCart } = useStore();
  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!items.length) {
    return (
      <div className="mt-12 border border-border bg-surface-muted/30 p-10 text-center">
        <p className="font-display text-3xl text-foreground">Your wishlist is empty</p>
        <p className="mt-3 text-sm leading-7 text-muted">Save your favourite pieces and return to them anytime.</p>
        <Link href="/products" className="mt-6 inline-flex bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong">
          Discover Jewellery
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((product) => (
        <article key={product.id} className="group">
          <div className="relative overflow-hidden bg-surface-muted">
            <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5]">
              <Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            </Link>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={`Remove ${product.name} from wishlist`}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/92 text-foreground backdrop-blur transition hover:bg-surface"
            >
              <HeartIcon className="h-5 w-5 fill-accent stroke-accent" />
            </button>
          </div>
          <div className="pt-5">
            <p className="text-xs tracking-[0.2em] text-muted uppercase">{product.category}</p>
            <Link href={`/products/${product.slug}`} className="mt-2 block font-display text-2xl tracking-tight text-foreground hover:text-accent-strong">
              {product.name}
            </Link>
            <p className="mt-2 text-sm text-foreground">{formatCurrency(product.price)}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => moveWishlistToCart(product.id)}
                className="flex flex-1 items-center justify-center gap-2 bg-foreground px-4 py-3 text-[11px] font-medium tracking-[0.18em] text-background uppercase transition hover:bg-accent-strong"
              >
                <BagIcon className="h-4 w-4" />
                Move to Bag
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="border border-border px-4 py-3 text-[11px] font-medium tracking-[0.14em] text-foreground uppercase transition hover:border-accent"
              >
                Remove
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}