import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Engagement Rings",
  description: "Celebrate your promise with engagement rings designed to last forever.",
};

export default async function EngagementRingsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Engagement Rings"
      description="Celebrate your promise with engagement rings designed to last forever."
      lockedCategory="Engagement Rings"
    />
  );
}
