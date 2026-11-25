import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Necklaces",
  description: "Elegant pendants and statement necklaces designed to captivate.",
  path: "/products/necklaces",
});

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
