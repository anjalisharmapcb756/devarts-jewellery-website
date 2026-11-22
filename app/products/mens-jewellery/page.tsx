import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Men's Jewellery",
  description: "Bold, refined jewellery crafted for the modern gentleman.",
};

export const instant = false;

export default async function MensJewelleryPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Men's Jewellery"
      description="Bold, refined jewellery crafted for the modern gentleman."
      lockedCategory="Men's Jewellery"
    />
  );
}
