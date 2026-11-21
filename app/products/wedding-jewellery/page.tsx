import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Wedding Jewellery",
  description: "Heirloom-worthy wedding jewellery for your most unforgettable moments.",
};

export default async function WeddingJewelleryPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Wedding Jewellery"
      description="Heirloom-worthy wedding jewellery for your most unforgettable moments."
      lockedCategory="Wedding Jewellery"
    />
  );
}
