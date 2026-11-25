import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Engagement Rings",
  description: "Celebrate your promise with engagement rings designed to last forever.",
  path: "/products/engagement-rings",
});

export const instant = false;

export default async function EngagementRingsPage() {
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="Engagement Rings"
      description="Celebrate your promise with engagement rings designed to last forever."
      lockedCategory="Engagement Rings"
    />
  );
}
