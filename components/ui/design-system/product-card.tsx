"use client";

import Image from "next/image";
import Link from "next/link";
import { BagIcon, HeartIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { eyebrowClass, focusRing } from "./styles";

export type DesignSystemProduct = {
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

export type DesignSystemProductCardProps = {
  product: DesignSystemProduct;
  href?: string;
  wished?: boolean;
  priority?: boolean;
  imageSizes?: string;
  className?: string;
  onAddToBag?: () => void;
  onQuickView?: () => void;
  onWishlistToggle?: () => void;
};

export function DesignSystemProductCard({
  product,
  href,
  wished = false,
  priority = false,
  imageSizes = "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw",
  className = "",
  onAddToBag,
  onQuickView,
  onWishlistToggle,
}: DesignSystemProductCardProps) {
  const productHref = href ?? `/products/${product.slug}`;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const soldOut = product.inStock === false;

  return (
    <article className={`group ${className}`.trim()}>
      <div className="relative overflow-hidden rounded-control border border-border bg-surface-muted shadow-card">
        <Link href={productHref} className={`block ${focusRing}`} tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-[4/5]">
            <Image
              src={product.image}
              alt=""
              fill
              priority={priority}
              sizes={imageSizes}
              className="object-cover transition duration-[var(--duration-reveal)] ease-luxury group-hover:scale-[1.03]"
            />
            {product.hoverImage ? (
              <Image
                src={product.hoverImage}
                alt=""
                fill
                sizes={imageSizes}
                className="object-cover opacity-0 transition duration-[var(--duration-reveal)] ease-luxury group-hover:scale-[1.03] group-hover:opacity-100"
              />
            ) : null}
          </div>
        </Link>

        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          {product.badge ? <Badge variant="neutral">{product.badge}</Badge> : null}
          {discount > 0 ? <Badge variant="accent">{discount}% Off</Badge> : null}
          {soldOut ? <Badge variant="danger">Out of Stock</Badge> : null}
        </div>

        <IconButton
          label={
            wished
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          variant="outline"
          size="sm"
          onClick={onWishlistToggle}
          className="absolute right-4 top-4 bg-surface/95"
        >
          <HeartIcon
            className={`h-4 w-4 ${wished ? "fill-accent-strong stroke-accent-strong" : ""}`}
          />
        </IconButton>

        <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-100 transition duration-base ease-luxury md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-within:translate-y-0 md:focus-within:opacity-100">
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            disabled={soldOut || !onAddToBag}
            onClick={onAddToBag}
          >
            <BagIcon className="h-4 w-4" aria-hidden="true" />
            {soldOut ? "Sold Out" : "Add to Bag"}
          </Button>
          {onQuickView ? (
            <Button size="sm" variant="secondary" onClick={onQuickView}>
              Quick View
            </Button>
          ) : null}
        </div>
      </div>

      <div className="pt-5">
        <p className={eyebrowClass}>{product.category}</p>
        <Link href={productHref} className={`mt-2 block ${focusRing}`}>
          <h3 className="font-display text-card-title tracking-display text-foreground transition-colors duration-base ease-luxury hover:text-accent-text">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-3 text-body-sm">
          <span className="text-foreground">{formatCurrency(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-muted line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export { DesignSystemProductCard as ProductCard };
