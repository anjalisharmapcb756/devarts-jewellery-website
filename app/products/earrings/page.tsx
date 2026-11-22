import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Earrings",
  description: "From classic studs to luminous drops, find earrings for every occasion.",
};

export const instant = false;

export default async function EarringsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Earrings"
      description="From classic studs to luminous drops, find earrings for every occasion."
      lockedCategory="Earrings"
    />
  );
}
