import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders | Admin" };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { q = "", status = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("orders").select("id, order_number, status, payment_status, total_inr, placed_at, profiles(full_name,email)").order("placed_at", { ascending: false }).limit(100);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%`);
  const { data: orders } = await query;

  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Operations</p><h1 className="mt-2 font-display text-4xl text-[#292521]">Orders</h1></div>
      <form className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search order number..." className="border border-[#ddd5ca] bg-white px-4 py-2 text-sm" />
        <select name="status" defaultValue={status} className="border border-[#ddd5ca] bg-white px-4 py-2 text-sm">
          <option value="">All statuses</option>
          {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="border border-[#ddd5ca] px-4 py-2 text-xs tracking-[0.14em] uppercase">Filter</button>
      </form>
      <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase"><tr><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Payment</th><th className="py-3 pr-4">Total</th><th className="py-3 pr-4">Date</th><th className="py-3">Action</th></tr></thead>
          <tbody>
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="border-b border-[#eee8df]">
                <td className="py-4 pr-4 text-[#292521]">{o.order_number || o.id.slice(0, 8)}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{o.profiles?.full_name || o.profiles?.email || "—"}</td>
                <td className="py-4 pr-4"><span className="bg-[#f3ede4] px-2 py-1 text-[11px] tracking-[0.1em] uppercase text-[#6b5631]">{o.status}</span></td>
                <td className="py-4 pr-4"><span className="bg-[#f3ede4] px-2 py-1 text-[11px] tracking-[0.1em] uppercase text-[#6b5631]">{o.payment_status}</span></td>
                <td className="py-4 pr-4">{formatCurrency(Number(o.total_inr ?? 0))}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{o.placed_at ? new Date(o.placed_at).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-4"><Link href={`/admin/orders/${o.id}`} className="text-xs tracking-[0.12em] text-[#8a7453] uppercase hover:text-[#292521]">View</Link></td>
              </tr>
            ))}
            {!orders?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={7}>No orders found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}