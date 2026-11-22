import type { Metadata } from "next";
import Link from "next/link";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetProducts } from "@/lib/admin/mongo-store";
import { deleteProduct } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Products | Admin" };

export const instant = false;

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  let products: any[] = [];
  if (isMongoConfigured()) {
    products = await mongoGetProducts(q);
  } else {
    const d = readDemoDB();
    products = d.products
      .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0))
      .slice(0, 100)
      .map((p) => ({ ...p, categories: { name: d.categories.find((c) => c.id === p.category_id)?.name || "—" } }));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl text-[#292521]">Products</h1>
        </div>
        <Link href="/admin/products/new" className="bg-[#292521] px-5 py-3 text-xs tracking-[0.16em] text-white uppercase">Add Product</Link>
      </div>

      <form className="flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search products..." className="w-full max-w-sm border border-[#ddd5ca] bg-white px-4 py-2 text-sm outline-none focus:border-[#a88755]" />
        <button className="border border-[#ddd5ca] px-4 py-2 text-xs tracking-[0.14em] uppercase">Search</button>
      </form>

      <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase">
            <tr><th className="py-3 pr-4">Product</th><th className="py-3 pr-4">Category</th><th className="py-3 pr-4">Price</th><th className="py-3 pr-4">Stock</th><th className="py-3 pr-4">Status</th><th className="py-3">Actions</th></tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-[#eee8df]">
                <td className="py-4 pr-4"><div className="font-medium text-[#292521]">{p.name}</div><div className="text-xs text-[#6e6861]">{p.slug}{p.badge ? ` · ${p.badge}` : ""}</div></td>
                <td className="py-4 pr-4 text-[#6e6861]">{p.categories?.name || "—"}</td>
                <td className="py-4 pr-4 text-[#292521]">{formatCurrency(Number(p.price_inr ?? 0))}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{p.stock_quantity} {p.is_in_stock ? "" : "(Out)"}</td>
                <td className="py-4 pr-4"><span className={`inline-block px-2 py-1 text-[11px] tracking-[0.1em] uppercase ${p.is_active ? "bg-[#edf3ea] text-[#4f6548]" : "bg-[#f3ede4] text-[#6b5631]"}`}>{p.is_active ? "Active" : "Hidden"}</span></td>
                <td className="py-4"><div className="flex gap-4"><Link href={`/admin/products/${p.id}`} className="text-xs tracking-[0.12em] text-[#8a7453] uppercase hover:text-[#292521]">Edit</Link><ConfirmDeleteButton id={p.id} action={deleteProduct} /></div></td>
              </tr>
            ))}
            {!products?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={6}>No products found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}