"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { uploadProductImageFile } from "@/lib/storage";
import { assertAdmin } from "@/lib/auth/admin";
import { nextId, readDemoDB, writeDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoDeleteCategory, mongoDeleteGemstone, mongoDeleteMetal, mongoDeleteProduct, mongoUpsertCategory, mongoUpsertGemstone, mongoUpsertMetal, mongoUpsertProduct, mongoUpdateOrderStatus } from "@/lib/admin/mongo-store";

function str(v: FormDataEntryValue | null) { return typeof v === "string" ? v.trim() : ""; }
function num(v: FormDataEntryValue | null) { const n = Number(str(v)); return Number.isFinite(n) ? n : 0; }

export async function upsertCategory(formData: FormData) {
  await assertAdmin();
  const id = str(formData.get("id"));
  const payload = { name: str(formData.get("name")), slug: str(formData.get("slug")), description: str(formData.get("description")) || null, image_url: str(formData.get("image_url")) || null, display_order: num(formData.get("display_order")), is_active: formData.get("is_active") === "on" };
  if (isMongoConfigured()) { await mongoUpsertCategory(payload, id || undefined); }
  else { const d = readDemoDB(); if (id) { const i = d.categories.findIndex((c) => c.id === id); if (i >= 0) d.categories[i] = { ...d.categories[i], ...payload }; } else d.categories.push({ id: nextId("cat"), ...payload }); writeDemoDB(d); }
  revalidatePath("/admin/categories"); revalidatePath("/products");
}

export async function deleteCategory(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  if (isMongoConfigured()) { await mongoDeleteCategory(id); }
  else { const d = readDemoDB(); d.categories = d.categories.filter((c) => c.id !== id); writeDemoDB(d); }
  revalidatePath("/admin/categories"); revalidatePath("/products");
}

export async function upsertGemstone(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  const payload = { name: str(formData.get("name")), slug: str(formData.get("slug")), color_hex: str(formData.get("color_hex")) || null, is_active: formData.get("is_active") === "on" };
  if (isMongoConfigured()) { await mongoUpsertGemstone(payload, id || undefined); }
  else { const d = readDemoDB(); if (id) { const i = d.gemstones.findIndex((g) => g.id === id); if (i >= 0) d.gemstones[i] = { ...d.gemstones[i], ...payload }; } else d.gemstones.push({ id: nextId("gem"), ...payload }); writeDemoDB(d); }
  revalidatePath("/admin/gemstones");
}

export async function deleteGemstone(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  if (isMongoConfigured()) { await mongoDeleteGemstone(id); }
  else { const d = readDemoDB(); d.gemstones = d.gemstones.filter((g) => g.id !== id); writeDemoDB(d); }
  revalidatePath("/admin/gemstones");
}

export async function upsertMetal(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  const payload = { name: str(formData.get("name")), slug: str(formData.get("slug")), purity: str(formData.get("purity")) || null, is_active: formData.get("is_active") === "on" };
  if (isMongoConfigured()) { await mongoUpsertMetal(payload, id || undefined); }
  else { const d = readDemoDB(); if (id) { const i = d.metals.findIndex((m) => m.id === id); if (i >= 0) d.metals[i] = { ...d.metals[i], ...payload }; } else d.metals.push({ id: nextId("met"), ...payload }); writeDemoDB(d); }
  revalidatePath("/admin/metals");
}

export async function deleteMetal(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  if (isMongoConfigured()) { await mongoDeleteMetal(id); }
  else { const d = readDemoDB(); d.metals = d.metals.filter((m) => m.id !== id); writeDemoDB(d); }
  revalidatePath("/admin/metals");
}

export async function upsertProduct(formData: FormData) {
  await assertAdmin();
  const id = str(formData.get("id"));
  const payload: any = {
    name: str(formData.get("name")), slug: str(formData.get("slug")), description: str(formData.get("description")), details: str(formData.get("details")) || null,
    category_id: str(formData.get("category_id")) || null, default_gemstone_id: str(formData.get("default_gemstone_id")) || null, default_metal_id: str(formData.get("default_metal_id")) || null,
    occasion: str(formData.get("occasion")) || "Everyday", price_inr: num(formData.get("price_inr")), original_price_inr: str(formData.get("original_price_inr")) ? num(formData.get("original_price_inr")) : null,
    sku: str(formData.get("sku")) || null, stock_quantity: Math.max(0, Math.floor(num(formData.get("stock_quantity")))), badge: str(formData.get("badge")) || null,
    metal_purity: str(formData.get("metal_purity")) || null, metal_weight: str(formData.get("metal_weight")) || null, gemstone_weight: str(formData.get("gemstone_weight")) || null,
    gemstone_quality: str(formData.get("gemstone_quality")) || null, setting: str(formData.get("setting")) || null, certification: str(formData.get("certification")) || null,
    shipping_info: str(formData.get("shipping_info")) || null, return_policy: str(formData.get("return_policy")) || null, is_active: formData.get("is_active") === "on",
  };
  payload.is_in_stock = payload.stock_quantity > 0;
  const imageUrl = str(formData.get("image_url"));
  const hoverImageUrl = str(formData.get("hover_image_url"));

  if (isMongoConfigured()) {
    await mongoUpsertProduct(payload, id || undefined, imageUrl || undefined, hoverImageUrl || undefined);
  } else {
    const d = readDemoDB();
    let productId = id;
    if (id) { const i = d.products.findIndex((p) => p.id === id); if (i >= 0) d.products[i] = { ...d.products[i], ...payload }; }
    else { productId = nextId("p"); d.products.unshift({ id: productId, ...payload, created_at: new Date().toISOString() }); }
    d.productImages = d.productImages.filter((im) => im.product_id !== productId || (im.sort_order > 1));
    if (imageUrl) { d.productImages = d.productImages.filter((im) => !(im.product_id === productId && im.sort_order === 0)); d.productImages.push({ id: nextId("img"), product_id: productId, url: imageUrl, alt_text: payload.name, sort_order: 0, is_primary: true, is_hover: false }); }
    if (hoverImageUrl) { d.productImages = d.productImages.filter((im) => !(im.product_id === productId && im.sort_order === 1)); d.productImages.push({ id: nextId("img"), product_id: productId, url: hoverImageUrl, alt_text: `${payload.name} alternate`, sort_order: 1, is_primary: false, is_hover: true }); }
    writeDemoDB(d);
  }
  updateTag("products"); revalidatePath("/admin/products"); revalidatePath("/products"); revalidatePath("/"); redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id"));
  if (isMongoConfigured()) { await mongoDeleteProduct(id); }
  else { const d = readDemoDB(); d.products = d.products.filter((p) => p.id !== id); d.productImages = d.productImages.filter((im) => im.product_id !== id); writeDemoDB(d); }
  updateTag("products"); revalidatePath("/admin/products"); revalidatePath("/products"); revalidatePath("/");
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdmin(); const id = str(formData.get("id")); const status = str(formData.get("status")); const payment_status = str(formData.get("payment_status"));
  if (isMongoConfigured()) { await mongoUpdateOrderStatus(id, status, payment_status); }
  else { const d = readDemoDB(); const o = d.orders.find((x) => x.id === id); if (o) { o.status = status; o.payment_status = payment_status; } writeDemoDB(d); }
  revalidatePath("/admin/orders"); revalidatePath(`/admin/orders/${id}`);
}

export async function uploadProductImage(formData: FormData) {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) throw new Error("No file provided");
  return uploadProductImageFile(file);
}


