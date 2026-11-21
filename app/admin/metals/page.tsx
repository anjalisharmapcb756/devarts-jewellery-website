import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { deleteMetal, upsertMetal } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const metadata: Metadata = { title: "Metal Variants | Admin" };

export default async function AdminMetalsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("metal_variants").select("*").order("name");
  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Catalogue</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Metal Variants</h1></div>
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm"><thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase"><tr><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Slug</th><th className="py-3 pr-4">Purity</th><th className="py-3 pr-4">Active</th><th className="py-3">Actions</th></tr></thead>
            <tbody>{(items ?? []).map((m) => (<tr key={m.id} className="border-b border-[#eee8df]"><td className="py-4 pr-4">{m.name}</td><td className="py-4 pr-4 text-[#6e6861]">{m.slug}</td><td className="py-4 pr-4 text-[#6e6861]">{m.purity || "—"}</td><td className="py-4 pr-4 text-[#6e6861]">{m.is_active ? "Yes" : "No"}</td><td className="py-4"><ConfirmDeleteButton id={m.id} action={deleteMetal} /></td></tr>))}
              {!items?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={5}>No metal variants found.</td></tr> : null}
            </tbody></table>
        </div>
        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <h2 className="font-display text-2xl text-[#292521]">Add / Edit Metal</h2>
          <form action={upsertMetal} className="mt-5 space-y-4">
            <input name="id" placeholder="Existing ID (for edit)" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="name" required placeholder="Name" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="slug" required placeholder="slug" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="purity" placeholder="Purity (18K, 950)" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-[#6e6861]"><input type="checkbox" name="is_active" defaultChecked /> Active</label>
            <button type="submit" className="w-full bg-[#292521] px-4 py-3 text-xs tracking-[0.16em] text-white uppercase">Save Metal</button>
          </form>
        </div>
      </div>
    </div>
  );
}