import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Wedding Jewellery",
  description: "Heirloom-worthy wedding jewellery for your most unforgettable moments.",
  path: "/products/wedding-jewellery",
});

export const instant = false;

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
