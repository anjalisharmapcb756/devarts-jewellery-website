"use client";

import { useStore } from "@/components/store/store-provider";
import {
  DesignSystemProductCard,
  type DesignSystemProduct,
} from "@/components/ui/design-system/product-card";

export type ProductCardProduct = DesignSystemProduct;

type ProductCardProps = {
  product: ProductCardProduct;
  onQuickView?: (product: ProductCardProduct) => void;
};

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <DesignSystemProductCard
      product={product}
      wished={wishlist.includes(product.id)}
      onWishlistToggle={() => toggleWishlist(product.id)}
      onAddToBag={() => addToCart(product.id)}
      onQuickView={onQuickView ? () => onQuickView(product) : undefined}
    />
  );
}
