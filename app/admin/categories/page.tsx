import { connection } from "next/server";
import type { Metadata } from "next";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCategories } from "@/lib/admin/mongo-store";
import { deleteCategory, upsertCategory } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const metadata: Metadata = { title: "Categories | Admin" };

export const instant = false;

export default async function AdminCategoriesPage() {
  await connection();
  let categories: any[] = [];
  if (isMongoConfigured()) {
    categories = await mongoGetCategories();
  } else {
    categories = [...readDemoDB().categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Catalogue</p>
        <h1 className="mt-2 font-display text-4xl text-[#292521]">Categories</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase">
              <tr><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Slug</th><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Active</th><th className="py-3">Actions</th></tr>
            </thead>
            <tbody>
              {(categories ?? []).map((c) => (
                <tr key={c.id} className="border-b border-[#eee8df] align-top">
                  <td className="py-4 pr-4 text-[#292521]">{c.name}<div className="text-xs text-[#6e6861]">{c.description}</div></td>
                  <td className="py-4 pr-4 text-[#6e6861]">{c.slug}</td>
                  <td className="py-4 pr-4 text-[#6e6861]">{c.display_order}</td>
                  <td className="py-4 pr-4 text-[#6e6861]">{c.is_active ? "Yes" : "No"}</td>
                  <td className="py-4"><ConfirmDeleteButton id={c.id} action={deleteCategory} /></td>
                </tr>
              ))}
              {!categories?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={5}>No categories found.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <h2 className="font-display text-2xl text-[#292521]">Add / Edit Category</h2>
          <form action={upsertCategory} className="mt-5 space-y-4">
            <input name="id" placeholder="Existing ID (for edit)" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="name" required placeholder="Name" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="slug" required placeholder="slug" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="description" placeholder="Description" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="image_url" placeholder="Image URL" className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <input name="display_order" type="number" defaultValue={0} className="w-full border border-[#ddd5ca] px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-[#6e6861]"><input type="checkbox" name="is_active" defaultChecked /> Active</label>
            <button type="submit" className="w-full bg-[#292521] px-4 py-3 text-xs tracking-[0.16em] text-white uppercase">Save Category</button>
          </form>
        </div>
      </div>
    </div>
  );
}