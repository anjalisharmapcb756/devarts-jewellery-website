import type { Metadata } from "next";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCategories, mongoGetGemstones, mongoGetMetals } from "@/lib/admin/mongo-store";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add Product | Admin" };

export const instant = false;

export default async function NewProductPage() {
  let categories: any[] = [], gemstones: any[] = [], metals: any[] = [];
  if (isMongoConfigured()) {
    [categories, gemstones, metals] = await Promise.all([mongoGetCategories(), mongoGetGemstones(), mongoGetMetals()]);
  } else {
    const d = readDemoDB();
    categories = [...d.categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    gemstones = [...d.gemstones].sort((a, b) => a.name.localeCompare(b.name));
    metals = [...d.metals].sort((a, b) => a.name.localeCompare(b.name));
  }
  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Products</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Add Product</h1></div>
      <ProductForm categories={categories} gemstones={gemstones} metals={metals} />
    </div>
  );
}