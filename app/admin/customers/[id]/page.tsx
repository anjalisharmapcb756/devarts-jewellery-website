import { connection } from "next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCustomerById } from "@/lib/admin/mongo-store";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer Detail | Admin" };

export const instant = false;
type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomerDetailPage({ params }: Props) {
  await connection();
  const { id } = await params;
  let customer: any = null; let orders: any[] = []; let addresses: any[] = [];
  if (isMongoConfigured()) {
    const res = await mongoGetCustomerById(id);
    customer = res?.customer ?? null; orders = res?.orders ?? []; addresses = res?.addresses ?? [];
  } else {
    const d = readDemoDB();
    customer = d.customers.find((c) => c.id === id) ?? null;
    orders = d.orders.filter((o) => o.user_id === id).sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at));
    addresses = d.addresses.filter((a) => a.user_id === id);
  }
  if (!customer) notFound();

  return (
    <div className="space-y-8">
      <div><p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Customer Detail</p><h1 className="mt-2 font-display text-4xl text-[#292521]">{customer.full_name || customer.email || "Customer"}</h1></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <h2 className="font-display text-2xl text-[#292521]">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-[#7b736a] uppercase tracking-[0.12em] text-[11px]">Email</dt><dd className="text-[#292521]">{customer.email || "—"}</dd></div>
            <div><dt className="text-[#7b736a] uppercase tracking-[0.12em] text-[11px]">Phone</dt><dd className="text-[#292521]">{customer.phone || "—"}</dd></div>
            <div><dt className="text-[#7b736a] uppercase tracking-[0.12em] text-[11px]">Role</dt><dd className="text-[#292521]">{customer.role}</dd></div>
            <div><dt className="text-[#7b736a] uppercase tracking-[0.12em] text-[11px]">Joined</dt><dd className="text-[#292521]">{customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-IN") : "—"}</dd></div>
          </dl>
        </div>

        <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
          <h2 className="font-display text-2xl text-[#292521]">Saved Addresses</h2>
          <div className="mt-4 space-y-4 text-sm">
            {(addresses ?? []).map((a: any) => (
              <div key={a.id} className="border-b border-[#eee8df] pb-4">
                <p className="text-[#292521]">{a.label} {a.is_default ? "· Default" : ""}</p>
                <p className="text-[#6e6861]">{a.full_name}, {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}</p>
              </div>
            ))}
            {!addresses?.length ? <p className="text-[#6e6861]">No saved addresses.</p> : null}
          </div>
        </div>
      </div>

      <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 overflow-x-auto">
        <h2 className="font-display text-2xl text-[#292521]">Order History</h2>
        <table className="mt-4 min-w-full text-left text-sm">
          <thead className="border-b border-[#e3ddd4] text-[11px] tracking-[0.16em] text-[#7b736a] uppercase"><tr><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Payment</th><th className="py-3 pr-4">Total</th><th className="py-3 pr-4">Date</th><th className="py-3">Action</th></tr></thead>
          <tbody>
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="border-b border-[#eee8df]">
                <td className="py-4 pr-4 text-[#292521]">{o.order_number || o.id.slice(0, 8)}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{o.status}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{o.payment_status}</td>
                <td className="py-4 pr-4 text-[#292521]">{formatCurrency(Number(o.total_inr ?? 0))}</td>
                <td className="py-4 pr-4 text-[#6e6861]">{o.placed_at ? new Date(o.placed_at).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-4"><Link href={`/admin/orders/${o.id}`} className="text-xs tracking-[0.12em] text-[#8a7453] uppercase hover:text-[#292521]">View</Link></td>
              </tr>
            ))}
            {!orders?.length ? <tr><td className="py-6 text-[#6e6861]" colSpan={6}>No orders for this customer.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}