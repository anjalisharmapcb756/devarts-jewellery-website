"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "@/components/products/product-gallery";
import { RelatedProducts } from "@/components/products/related-products";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { useStore } from "@/components/store/store-provider";
import { BagIcon, HeartIcon, StarIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import { getUnitPrice } from "@/lib/pricing";
import type { CartItemSelection, Gemstone, MetalType, Product } from "@/types/product";

type ProductDetailProps = {
  product: Product;
  relatedProducts: Product[];
  allProducts: Product[];
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star - 0.25;
        return (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${filled ? "fill-accent stroke-accent" : "fill-transparent stroke-border"}`}
          />
        );
      })}
    </div>
  );
}

function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">{label}</p>
      <div className="mt-3 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[52px] border px-4 py-3 text-xs font-medium tracking-[0.08em] uppercase transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-foreground hover:border-accent hover:text-accent-text"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function ProductDetail({ product, relatedProducts, allProducts }: ProductDetailProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const wished = wishlist.includes(product.id);
  const isRing = product.category === "Rings" || product.category === "Engagement Rings";

  const availableMetals = product.availableMetals ?? ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"];
  const availableGemstones = product.availableGemstones ?? ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"];
  const gemstoneSizes = product.gemstoneSizes ?? ["0.50 ct", "1.00 ct", "1.50 ct", "2.00 ct"];
  const ringSizes = product.ringSizes ?? ["US 5", "US 6", "US 7", "US 8", "US 9"];

  const [metal, setMetal] = useState<MetalType>(product.metal);
  const [gemstone, setGemstone] = useState<Gemstone>(product.gemstone);
  const [gemstoneSize, setGemstoneSize] = useState(gemstoneSizes[1] ?? gemstoneSizes[0] ?? "1.00 ct");
  const [ringSize, setRingSize] = useState(ringSizes[2] ?? ringSizes[0] ?? "US 7");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping" | "returns">("description");

  const selection: CartItemSelection = useMemo(
    () => ({
      metal,
      gemstone,
      gemstoneSize,
      ...(isRing ? { ringSize } : {}),
    }),
    [metal, gemstone, gemstoneSize, ringSize, isRing],
  );

  const unitPrice = useMemo(() => getUnitPrice(product, selection), [product, selection]);
  const baseDelta = unitPrice - product.price;
  const originalUnitPrice = product.originalPrice ? Math.max(0, product.originalPrice + baseDelta) : undefined;
  const discount =
    originalUnitPrice && originalUnitPrice > unitPrice
      ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
      : 0;

  const images = product.images?.length ? product.images : [product.image, product.hoverImage];

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity, unitPrice, selection });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="transition hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/products" className="transition hover:text-foreground">Jewellery</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products/${(
                {
                  Rings: "rings",
                  Earrings: "earrings",
                  Necklaces: "necklaces",
                  Bracelets: "bracelets",
                  "Engagement Rings": "engagement-rings",
                  "Wedding Jewellery": "wedding-jewellery",
                  "Men's Jewellery": "mens-jewellery",
                } as Record<string, string>
              )[product.category] ?? "rings"}`}
              className="transition hover:text-foreground"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={images} name={product.name} badge={product.badge} discount={discount} />

        <div className="flex flex-col">
          <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
            {product.category}
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <RatingStars rating={product.rating ?? 4.8} />
            <span className="text-foreground">{(product.rating ?? 4.8).toFixed(1)}</span>
            <span className="text-muted">({product.reviewCount ?? 24} Reviews)</span>
            <span className="text-border">|</span>
            <span className={product.inStock ? "text-accent-text" : "text-muted"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="font-display text-3xl text-foreground">{formatCurrency(unitPrice)}</p>
            {originalUnitPrice ? (
              <p className="text-base text-muted line-through">{formatCurrency(originalUnitPrice)}</p>
            ) : null}
            {discount > 0 ? (
              <span className="bg-surface-muted px-3 py-1 text-xs font-medium tracking-[0.14em] text-accent-text uppercase">
                Save {discount}%
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs tracking-[0.12em] text-muted uppercase">Price inclusive of taxes</p>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted">{product.description}</p>

          <div className="mt-8 space-y-6 border-y border-border py-8">
            <OptionGroup label="Metal">
              {availableMetals.map((option) => (
                <OptionButton key={option} active={metal === option} onClick={() => setMetal(option)}>
                  {option.replace(" Gold", "")}
                  {option === "Platinum" ? "" : " Gold"}
                </OptionButton>
              ))}
            </OptionGroup>

            <OptionGroup label="Gemstone">
              {availableGemstones.map((option) => (
                <OptionButton key={option} active={gemstone === option} onClick={() => setGemstone(option)}>
                  {option}
                </OptionButton>
              ))}
            </OptionGroup>

            <OptionGroup label="Gemstone Size">
              {gemstoneSizes.map((option) => (
                <OptionButton key={option} active={gemstoneSize === option} onClick={() => setGemstoneSize(option)}>
                  {option}
                </OptionButton>
              ))}
            </OptionGroup>

            {isRing ? (
              <OptionGroup label="Ring Size">
                {ringSizes.map((option) => (
                  <OptionButton key={option} active={ringSize === option} onClick={() => setRingSize(option)}>
                    {option}
                  </OptionButton>
                ))}
              </OptionGroup>
            ) : null}

            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">Quantity</p>
              <div className="mt-3 inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-12 w-12 text-lg text-foreground transition hover:bg-surface-muted"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="flex h-12 w-14 items-center justify-center text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="h-12 w-12 text-lg text-foreground transition hover:bg-surface-muted"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-foreground px-6 py-4 text-sm font-medium tracking-[0.14em] text-surface uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
              >
                <BagIcon className="h-4 w-4" />
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="inline-flex items-center justify-center gap-2 border border-border px-6 py-4 text-sm font-medium tracking-[0.14em] text-foreground uppercase transition hover:border-accent hover:text-accent-text"
              >
                <HeartIcon className={`h-4 w-4 ${wished ? "fill-accent stroke-accent" : ""}`} />
                {wished ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="inline-flex w-full items-center justify-center border border-accent px-6 py-4 text-sm font-medium tracking-[0.14em] text-accent-text uppercase transition hover:bg-accent hover:text-[#2b2620] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-8 text-sm sm:grid-cols-3">
            <div>
              <p className="tracking-[0.14em] text-muted uppercase">Certification</p>
              <p className="mt-1 text-foreground">{product.specifications?.certification ?? "IGI Certified"}</p>
            </div>
            <div>
              <p className="tracking-[0.14em] text-muted uppercase">Shipping</p>
              <p className="mt-1 text-foreground">Complimentary Insured</p>
            </div>
            <div>
              <p className="tracking-[0.14em] text-muted uppercase">Returns</p>
              <p className="mt-1 text-foreground">15-Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-3 border-b border-border">
            {[
              { key: "description", label: "Description" },
              { key: "specs", label: "Specifications" },
              { key: "shipping", label: "Shipping" },
              { key: "returns", label: "Returns" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-1 py-4 text-xs font-medium tracking-[0.18em] uppercase transition ${
                  activeTab === tab.key
                    ? "border-b border-foreground text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8 text-sm leading-7 text-muted">
            {activeTab === "description" ? (
              <div className="space-y-4">
                <p>{product.description}</p>
                <p>
                  Crafted with meticulous attention to detail, this piece is designed to become a
                  lasting part of your jewellery collection. Each Vara creation is finished by
                  skilled artisans and inspected for exceptional quality.
                </p>
              </div>
            ) : null}

            {activeTab === "specs" ? (
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ["Metal", selection.metal],
                  ["Metal Purity", product.specifications?.metalPurity ?? "18K Gold"],
                  ["Metal Weight", product.specifications?.metalWeight ?? "3.40 g"],
                  ["Gemstone", selection.gemstone],
                  ["Gemstone Size", selection.gemstoneSize],
                  ["Gemstone Quality", product.specifications?.gemstoneQuality ?? "AAA Grade"],
                  ["Setting", product.specifications?.setting ?? "Classic Setting"],
                  ["Certification", product.specifications?.certification ?? "IGI Certified"],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-border/60 pb-4">
                    <dt className="text-xs tracking-[0.14em] text-muted uppercase">{label}</dt>
                    <dd className="mt-1 text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {activeTab === "shipping" ? <p>{product.shippingInfo}</p> : null}
            {activeTab === "returns" ? <p>{product.returnPolicy}</p> : null}
          </div>
        </div>

        <div className="bg-surface-muted/45 p-8">
          <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
            Customer Reviews
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground">
            {(product.rating ?? 4.8).toFixed(1)} / 5
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={product.rating ?? 4.8} />
            <span className="text-sm text-muted">Based on {product.reviewCount ?? 24} reviews</span>
          </div>
          <div className="mt-8 space-y-6">
            {(product.reviews ?? []).map((review) => (
              <article key={review.id} className="border-t border-border pt-6">
                <div className="flex items-center justify-between gap-4">
                  <RatingStars rating={review.rating} />
                  <span className="text-xs text-muted">{review.date}</span>
                </div>
                <h3 className="mt-3 text-base font-medium text-foreground">{review.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{review.content}</p>
                <p className="mt-3 text-xs tracking-[0.12em] text-muted uppercase">
                  {review.author} {review.verified ? "· Verified Buyer" : ""}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
      <RecentlyViewed currentProductId={product.id} products={allProducts} />
    </div>
  );
}