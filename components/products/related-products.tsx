import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="border-t border-border py-16 sm:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
            You May Also Love
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Related Products
          </h2>
        </div>
      </div>
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}