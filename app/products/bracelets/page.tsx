import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Bracelets",
  description: "Refined bracelets and cuffs crafted with exceptional detail.",
  path: "/products/bracelets",
});

export const instant = false;

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
