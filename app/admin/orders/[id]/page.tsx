import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/app/admin/actions";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Detail | Admin" };
type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, profiles(full_name,email,phone), customer_addresses(*)").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Order Detail</p>
        <h1 className="mt-2 font-display text-4xl text-[#292521]">{order.order_number || order.id.slice(0, 8)}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
            <h2 className="font-display text-2xl text-[#292521]">Items</h2>
            <div className="mt-4 space-y-4">
              {(items ?? []).map((item: any) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-[#eee8df] pb-4 text-sm">
                  <div>
                    <p className="text-[#292521]">{item.product_name}</p>
                    <p className="text-[#6e6861]">{[item.metal, item.gemstone, item.gemstone_size, item.ring_size].filter(Boolean).join(" / ")}</p>
                    <p className="text-[#6e6861]">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-[#292521]">{formatCurrency(Number(item.line_total_inr ?? 0))}</div>
                </div>
              ))}
              {!items?.length ? <p className="text-sm text-[#6e6861]">No order items.</p> : null}
            </div>
          </div>

          <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 text-sm">
            <h2 className="font-display text-2xl text-[#292521]">Customer & Address</h2>
            <p className="mt-4 text-[#292521]">{order.profiles?.full_name || "—"}</p>
            <p className="text-[#6e6861]">{order.profiles?.email || "—"} {order.profiles?.phone ? `· ${order.profiles.phone}` : ""}</p>
            {order.customer_addresses ? (
              <p className="mt-3 text-[#6e6861]">{order.customer_addresses.line1}{order.customer_addresses.line2 ? `, ${order.customer_addresses.line2}` : ""}, {order.customer_addresses.city}, {order.customer_addresses.state} {order.customer_addresses.postal_code}</p>
            ) : <p className="mt-3 text-[#6e6861]">No shipping address attached.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
            <h2 className="font-display text-2xl text-[#292521]">Update Status</h2>
            <form action={updateOrderStatus} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={order.id} />
              <label className="block text-sm"><span className="mb-2 block text-[11px] tracking-[0.16em] text-[#7b736a] uppercase">Order Status</span>
                <select name="status" defaultValue={order.status} className="w-full border border-[#ddd5ca] px-3 py-2">
                  {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block text-sm"><span className="mb-2 block text-[11px] tracking-[0.16em] text-[#7b736a] uppercase">Payment Status</span>
                <select name="payment_status" defaultValue={order.payment_status} className="w-full border border-[#ddd5ca] px-3 py-2">
                  {["pending","paid","failed","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <button className="w-full bg-[#292521] px-4 py-3 text-xs tracking-[0.16em] text-white uppercase">Update Order</button>
            </form>
          </div>

          <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6 text-sm">
            <h2 className="font-display text-2xl text-[#292521]">Summary</h2>
            <div className="mt-4 space-y-2 text-[#6e6861]">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal_inr ?? 0))}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>{formatCurrency(Number(order.discount_inr ?? 0))}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(Number(order.shipping_inr ?? 0))}</span></div>
              <div className="flex justify-between border-t border-[#eee8df] pt-2 text-[#292521]"><span>Total</span><span>{formatCurrency(Number(order.total_inr ?? 0))}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}