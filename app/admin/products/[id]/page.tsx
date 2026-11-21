import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Product | Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: images }, { data: categories }, { data: gemstones }, { data: metals }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("url,is_primary,is_hover,sort_order").eq("product_id", id).order("sort_order"),
    supabase.from("categories").select("id,name").order("display_order"),
    supabase.from("gemstones").select("id,name").order("name"),
    supabase.from("metal_variants").select("id,name").order("name"),
  ]);
  if (!product) notFound();
  const primary = images?.find((i) => i.is_primary) ?? images?.[0];
  const hover = images?.find((i) => i.is_hover) ?? images?.[1];
  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Products</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Edit Product</h1></div>
      <ProductForm
        product={{ ...product, image_url: primary?.url || "", hover_image_url: hover?.url || "" }}
        categories={categories ?? []}
        gemstones={gemstones ?? []}
        metals={metals ?? []}
      />
    </div>
  );
}