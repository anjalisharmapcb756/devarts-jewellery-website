import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Customers | Admin" };
type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, full_name, email, phone, role, created_at").eq("role", "customer").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: customers } = await query;

  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Customers</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Customer Management</h1></div>
      <form className="flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search name or email..." className="w-full max-w-sm border border-[#ddd5ca] bg-white px-4 py-2 text-sm outline-none focus:border-[#a88755]" />
        <button className="border border-[#ddd5ca] px-4 py-2 text-xs tracking-[0.14em] uppercase">Search</button>
      </form>
      <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase"><tr><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Phone</th><th className="py-3 pr-4">Joined</th><th className="py-3">Action</th></tr></thead>
          <tbody>
            {(customers ?? []).map((c) => (
              <tr key={c.id} className="border-b border-[#eee8df]">
                <td className="py-4 pr-4 text-[#292521]">{c.full_name || "—"}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{c.email || "—"}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{c.phone || "—"}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-4"><Link href={`/admin/customers/${c.id}`} className="text-xs tracking-[0.12em] text-[#8a7453] uppercase hover:text-[#292521]">View</Link></td>
              </tr>
            ))}
            {!customers?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={5}>No customers found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}