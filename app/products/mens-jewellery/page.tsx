import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Men's Jewellery",
  description: "Bold, refined jewellery crafted for the modern gentleman.",
  path: "/products/mens-jewellery",
});

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
