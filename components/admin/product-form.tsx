"use client";

import { useState, useTransition } from "react";
import { upsertProduct } from "@/app/admin/actions";

type Option = { id: string; name: string };

type ProductFormProps = {
  product?: any;
  categories: Option[];
  gemstones: Option[];
  metals: Option[];
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-[#7b736a] uppercase">{label}</span>{children}</label>;
}
const inputCls = "w-full border border-[#ddd5ca] bg-white px-3 py-2 text-sm text-[#292521] outline-none focus:border-[#a88755]";

export function ProductForm({ product, categories, gemstones, metals }: ProductFormProps) {
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [hoverImageUrl, setHoverImageUrl] = useState(product?.hover_image_url || "");
  const [uploading, setUploading] = useState<"image" | "hover" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, target: "image" | "hover") {
    setUploading(target); setError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (target === "image") setImageUrl(data.url); else setHoverImageUrl(data.url);
    } catch (e: any) { setError(e.message || "Upload failed"); }
    finally { setUploading(null); }
  }

  return (
    <form action={(fd) => startTransition(async () => { setError(null); try { await upsertProduct(fd); } catch (e: any) { setError(e.message || "Failed to save product"); } })} className="space-y-8">
      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      <input type="hidden" name="id" value={product?.id || ""} />

      <div className="grid gap-6 border border-[#ddd5ca] bg-[#fffdfa] p-6 md:grid-cols-2">
        <Field label="Name"><input name="name" required defaultValue={product?.name || ""} className={inputCls} /></Field>
        <Field label="Slug"><input name="slug" required defaultValue={product?.slug || ""} className={inputCls} /></Field>
        <div className="md:col-span-2"><Field label="Description"><textarea name="description" required defaultValue={product?.description || ""} className={inputCls} rows={3} /></Field></div>
        <div className="md:col-span-2"><Field label="Details"><textarea name="details" defaultValue={product?.details || ""} className={inputCls} rows={3} /></Field></div>
        <Field label="Category">
          <select name="category_id" required defaultValue={product?.category_id || ""} className={inputCls}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Occasion">
          <select name="occasion" defaultValue={product?.occasion || "Everyday"} className={inputCls}>
            {["Everyday","Wedding","Anniversary","Gifting"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Default Gemstone">
          <select name="default_gemstone_id" defaultValue={product?.default_gemstone_id || ""} className={inputCls}>
            <option value="">None</option>
            {gemstones.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <Field label="Default Metal">
          <select name="default_metal_id" defaultValue={product?.default_metal_id || ""} className={inputCls}>
            <option value="">None</option>
            {metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-6 border border-[#ddd5ca] bg-[#fffdfa] p-6 md:grid-cols-3">
        <Field label="Price (INR)"><input name="price_inr" type="number" step="0.01" required defaultValue={product?.price_inr ?? ""} className={inputCls} /></Field>
        <Field label="Original Price (INR)"><input name="original_price_inr" type="number" step="0.01" defaultValue={product?.original_price_inr ?? ""} className={inputCls} /></Field>
        <Field label="Stock Quantity"><input name="stock_quantity" type="number" min="0" required defaultValue={product?.stock_quantity ?? 0} className={inputCls} /></Field>
        <Field label="SKU"><input name="sku" defaultValue={product?.sku || ""} className={inputCls} /></Field>
        <Field label="Badge"><input name="badge" defaultValue={product?.badge || ""} className={inputCls} placeholder="Bestseller, New, etc." /></Field>
        <label className="flex items-center gap-2 pt-7 text-sm text-[#6e6861]"><input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Active</label>
      </div>

      <div className="grid gap-6 border border-[#ddd5ca] bg-[#fffdfa] p-6 md:grid-cols-2">
        <Field label="Primary Image URL"><input name="image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputCls} placeholder="https://... or /images/..." /></Field>
        <Field label="Hover Image URL"><input name="hover_image_url" value={hoverImageUrl} onChange={(e) => setHoverImageUrl(e.target.value)} className={inputCls} placeholder="https://... or /images/..." /></Field>
        <Field label="Upload Primary Image">
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "image"); }} className="block w-full text-sm text-[#6e6861]" />
          {uploading === "image" ? <p className="mt-2 text-xs text-[#8a7453]">Uploading...</p> : null}
        </Field>
        <Field label="Upload Hover Image">
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "hover"); }} className="block w-full text-sm text-[#6e6861]" />
          {uploading === "hover" ? <p className="mt-2 text-xs text-[#8a7453]">Uploading...</p> : null}
        </Field>
      </div>

      <div className="grid gap-6 border border-[#ddd5ca] bg-[#fffdfa] p-6 md:grid-cols-3">
        <Field label="Metal Purity"><input name="metal_purity" defaultValue={product?.metal_purity || ""} className={inputCls} /></Field>
        <Field label="Metal Weight"><input name="metal_weight" defaultValue={product?.metal_weight || ""} className={inputCls} /></Field>
        <Field label="Gemstone Weight"><input name="gemstone_weight" defaultValue={product?.gemstone_weight || ""} className={inputCls} /></Field>
        <Field label="Gemstone Quality"><input name="gemstone_quality" defaultValue={product?.gemstone_quality || ""} className={inputCls} /></Field>
        <Field label="Setting"><input name="setting" defaultValue={product?.setting || ""} className={inputCls} /></Field>
        <Field label="Certification"><input name="certification" defaultValue={product?.certification || ""} className={inputCls} /></Field>
      </div>

      <div className="grid gap-6 border border-[#ddd5ca] bg-[#fffdfa] p-6 md:grid-cols-2">
        <Field label="Shipping Info"><textarea name="shipping_info" defaultValue={product?.shipping_info || ""} className={inputCls} rows={3} /></Field>
        <Field label="Return Policy"><textarea name="return_policy" defaultValue={product?.return_policy || ""} className={inputCls} rows={3} /></Field>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-[#292521] px-6 py-3 text-xs tracking-[0.16em] text-white uppercase disabled:opacity-50">{pending ? "Saving..." : "Save Product"}</button>
      </div>
    </form>
  );
}