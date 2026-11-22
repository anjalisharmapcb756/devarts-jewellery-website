import type { Metadata } from "next";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";

export const metadata: Metadata = {
  title: "Rings",
  description: "Discover diamond, gemstone, and gold rings crafted for timeless elegance.",
};

export const instant = false;

export default async function RingsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Rings"
      description="Discover diamond, gemstone, and gold rings crafted for timeless elegance."
      lockedCategory="Rings"
    />
  );
}
