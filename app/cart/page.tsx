import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CartContent } from "@/components/cart/cart-content";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected jewellery pieces.",
};

export default async function CartPage() {
  const products = await getProductsAsync();
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-strong uppercase">
          Shopping Bag
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Your Cart
        </h1>
        <CartContent products={products} />
      </Container>
    </section>
  );
}