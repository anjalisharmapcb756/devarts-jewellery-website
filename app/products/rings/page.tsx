import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Rings",
  description: "Discover diamond, gemstone, and gold rings crafted for timeless elegance.",
  path: "/products/rings",
});

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
