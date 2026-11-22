import { connection } from "next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCategories, mongoGetGemstones, mongoGetMetals, mongoGetProductById } from "@/lib/admin/mongo-store";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Product | Admin" };

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  await connection();
  const { id } = await params;
  let product: any = null, images: any[] = [], categories: any[] = [], gemstones: any[] = [], metals: any[] = [];
  if (isMongoConfigured()) {
    const res = await mongoGetProductById(id);
    product = res?.product ?? null;
    images = res?.images ?? [];
    [categories, gemstones, metals] = await Promise.all([mongoGetCategories(), mongoGetGemstones(), mongoGetMetals()]);
  } else {
    const d = readDemoDB();
    product = d.products.find((p) => p.id === id) ?? null;
    images = d.productImages.filter((im) => im.product_id === id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    categories = [...d.categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    gemstones = [...d.gemstones].sort((a, b) => a.name.localeCompare(b.name));
    metals = [...d.metals].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (!product) notFound();
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const hover = images.find((i) => i.is_hover) ?? images[1];
  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Products</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Edit Product</h1></div>
      <ProductForm product={{ ...product, image_url: primary?.url || "", hover_image_url: hover?.url || "" }} categories={categories} gemstones={gemstones} metals={metals} />
    </div>
  );
}