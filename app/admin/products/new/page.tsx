import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add Product | Admin" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: gemstones }, { data: metals }] = await Promise.all([
    supabase.from("categories").select("id,name").order("display_order"),
    supabase.from("gemstones").select("id,name").order("name"),
    supabase.from("metal_variants").select("id,name").order("name"),
  ]);
  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Products</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Add Product</h1></div>
      <ProductForm categories={categories ?? []} gemstones={gemstones ?? []} metals={metals ?? []} />
    </div>
  );
}