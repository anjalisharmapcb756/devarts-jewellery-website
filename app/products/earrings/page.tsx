import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Earrings",
  description: "From classic studs to luminous drops, find earrings for every occasion.",
  path: "/products/earrings",
});

export const instant = false;

export default async function EarringsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Earrings"
      description="From classic studs to luminous drops, find earrings for every occasion."
      lockedCategory="Earrings"
    />
  );
}
