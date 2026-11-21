import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Bracelets",
  description: "Refined bracelets and cuffs crafted with exceptional detail.",
};

export default async function BraceletsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Bracelets"
      description="Refined bracelets and cuffs crafted with exceptional detail."
      lockedCategory="Bracelets"
    />
  );
}
