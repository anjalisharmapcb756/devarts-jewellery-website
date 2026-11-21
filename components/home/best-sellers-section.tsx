import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { getProductsAsync } from "@/lib/data/products-db";

export async function BestSellersSection() {
  const products = await getProductsAsync();
  const bestSellers = products.filter((p) => p.badge === "Bestseller" || (p.rating ?? 0) >= 4.8).slice(0, 4);
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Best Sellers"
          title="Most loved by our clientele"
          description="Timeless designs chosen for their brilliance, craftsmanship, and effortless elegance."
        />
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
