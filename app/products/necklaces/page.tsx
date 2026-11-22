import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Necklaces",
  description: "Elegant pendants and statement necklaces designed to captivate.",
};

export const instant = false;

export default async function NecklacesPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Necklaces"
      description="Elegant pendants and statement necklaces designed to captivate."
      lockedCategory="Necklaces"
    />
  );
}
