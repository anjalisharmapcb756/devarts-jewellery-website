import { connection } from "next/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { getProductsAsync } from "@/lib/data/products-db";

export async function NewArrivalsSection() {
  await connection();
  const products = await getProductsAsync();
  const newArrivals = products.filter((p) => p.badge === "New").slice(0, 4);
  return (
    <section id="new-arrivals" className="bg-surface-muted/45 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="New Arrivals"
          title="Fresh expressions of luxury"
          description="Newly unveiled designs, created to bring a modern glow to your jewellery collection."
        />
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
