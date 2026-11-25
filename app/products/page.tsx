import { Suspense } from "react";
import { connection } from "next/server";
import { Catalogue } from "@/components/products/catalogue";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Products",
  description: "Browse our complete luxury jewellery catalogue.",
  path: "/products",
});

export const instant = false;

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

const categoryMap: Record<string, string> = {
  rings: "Rings",
  earrings: "Earrings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  "engagement-rings": "Engagement Rings",
  "wedding-jewellery": "Wedding Jewellery",
  "mens-jewellery": "Men's Jewellery",
};

async function ProductsCatalogue({ searchParams }: ProductsPageProps) {
  await connection();
  const params = await searchParams;
  const initialQuery = params.q ?? "";
  const initialJewelleryType = params.category
    ? categoryMap[params.category.toLowerCase()]
    : undefined;
  const products = await getProductsAsync();
  return (
    <Catalogue
      products={products}
      title="All Jewellery"
      description="Explore our complete collection of fine jewellery, crafted with rare gemstones and exceptional artistry."
      initialQuery={initialQuery}
      initialJewelleryType={initialJewelleryType}
    />
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading catalogue...</div>}>
      <ProductsCatalogue searchParams={searchParams} />
    </Suspense>
  );
}
