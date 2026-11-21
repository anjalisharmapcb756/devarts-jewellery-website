"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null) { return typeof v === "string" ? v.trim() : ""; }
function num(v: FormDataEntryValue | null) { const n = Number(str(v)); return Number.isFinite(n) ? n : 0; }

async function db() { return createClient(); }

export async function upsertCategory(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const payload = {
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")) || null,
    image_url: str(formData.get("image_url")) || null,
    display_order: num(formData.get("display_order")),
    is_active: formData.get("is_active") === "on",
  };
  const q = id ? supabase.from("categories").update(payload).eq("id", id) : supabase.from("categories").insert(payload);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories"); revalidatePath("/products");
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories"); revalidatePath("/products");
}

export async function upsertGemstone(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const payload = { name: str(formData.get("name")), slug: str(formData.get("slug")), color_hex: str(formData.get("color_hex")) || null, is_active: formData.get("is_active") === "on" };
  const q = id ? supabase.from("gemstones").update(payload).eq("id", id) : supabase.from("gemstones").insert(payload);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gemstones");
}

export async function deleteGemstone(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const { error } = await supabase.from("gemstones").delete().eq("id", str(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gemstones");
}

export async function upsertMetal(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const payload = { name: str(formData.get("name")), slug: str(formData.get("slug")), purity: str(formData.get("purity")) || null, is_active: formData.get("is_active") === "on" };
  const q = id ? supabase.from("metal_variants").update(payload).eq("id", id) : supabase.from("metal_variants").insert(payload);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/metals");
}

export async function deleteMetal(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const { error } = await supabase.from("metal_variants").delete().eq("id", str(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/metals");
}

export async function upsertProduct(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const payload: any = {
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")),
    details: str(formData.get("details")) || null,
    category_id: str(formData.get("category_id")),
    default_gemstone_id: str(formData.get("default_gemstone_id")) || null,
    default_metal_id: str(formData.get("default_metal_id")) || null,
    occasion: str(formData.get("occasion")) || "Everyday",
    price_inr: num(formData.get("price_inr")),
    original_price_inr: str(formData.get("original_price_inr")) ? num(formData.get("original_price_inr")) : null,
    sku: str(formData.get("sku")) || null,
    stock_quantity: Math.max(0, Math.floor(num(formData.get("stock_quantity")))),
    badge: str(formData.get("badge")) || null,
    metal_purity: str(formData.get("metal_purity")) || null,
    metal_weight: str(formData.get("metal_weight")) || null,
    gemstone_weight: str(formData.get("gemstone_weight")) || null,
    gemstone_quality: str(formData.get("gemstone_quality")) || null,
    setting: str(formData.get("setting")) || null,
    certification: str(formData.get("certification")) || null,
    shipping_info: str(formData.get("shipping_info")) || null,
    return_policy: str(formData.get("return_policy")) || null,
    is_active: formData.get("is_active") === "on",
  };
  const q = id ? supabase.from("products").update(payload).eq("id", id).select("id").single() : supabase.from("products").insert(payload).select("id").single();
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const productId = data.id as string;
  const imageUrl = str(formData.get("image_url"));
  const hoverImageUrl = str(formData.get("hover_image_url"));
  if (imageUrl) {
    await supabase.from("product_images").upsert({ product_id: productId, url: imageUrl, alt_text: payload.name, sort_order: 0, is_primary: true, is_hover: false }, { onConflict: "product_id,url,sort_order" } as any);
  }
  if (hoverImageUrl) {
    await supabase.from("product_images").upsert({ product_id: productId, url: hoverImageUrl, alt_text: `${payload.name} alternate`, sort_order: 1, is_primary: false, is_hover: true }, { onConflict: "product_id,url,sort_order" } as any);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const { error } = await supabase.from("products").delete().eq("id", str(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products"); revalidatePath("/products"); revalidatePath("/");
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  const payment_status = str(formData.get("payment_status"));
  const { error } = await supabase.from("orders").update({ status, payment_status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function uploadProductImage(formData: FormData) {
  await assertAdmin();
  const supabase = await db();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) throw new Error("No file provided");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}