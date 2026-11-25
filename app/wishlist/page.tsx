import { connection } from "next/server";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { WishlistContent } from "@/components/wishlist/wishlist-content";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Save your favourite jewellery pieces.",
};

export const instant = false;

export default async function WishlistPage() {
  await connection();
  const products = await getProductsAsync();
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
          Saved Favourites
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Wishlist
        </h1>
        <WishlistContent products={products} />
      </Container>
    </section>
  );
}