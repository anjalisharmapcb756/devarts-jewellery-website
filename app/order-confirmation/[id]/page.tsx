import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import { Order, OrderItem } from "@/lib/models/Order";
import { formatCurrency } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = { title: "Order Confirmation" };
type Props = { params: Promise<{ id: string }> };

async function OrderConfirmationContent({ params }: Props) {
  await connection();
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/order-confirmation/${id}`);
  await connectDB();
  const order: any = await Order.findById(id).lean().catch(() => null);
  if (!order || String(order.user_id) !== String(session.sub)) notFound();
  const items = await OrderItem.find({ order_id: order._id }).lean();
  const addr = order.shipping_address_snapshot as any;

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="border border-border bg-surface p-6">
          <h2 className="font-display text-2xl text-foreground">Order Details</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted uppercase tracking-[0.12em] text-[11px]">Order Number</dt><dd className="text-foreground">{order.order_number}</dd></div>
            <div><dt className="text-muted uppercase tracking-[0.12em] text-[11px]">Order Status</dt><dd className="text-foreground capitalize">{order.status}</dd></div>
            <div><dt className="text-muted uppercase tracking-[0.12em] text-[11px]">Payment Status</dt><dd className="text-foreground capitalize">{order.payment_status}</dd></div>
            <div><dt className="text-muted uppercase tracking-[0.12em] text-[11px]">Date</dt><dd className="text-foreground">{new Date(order.placed_at || order.createdAt).toLocaleDateString("en-IN")}</dd></div>
          </dl>
        </div>
        <div className="border border-border bg-surface p-6">
          <h2 className="font-display text-2xl text-foreground">Items</h2>
          <div className="mt-4 space-y-4">
            {(items as any[]).map((item: any) => (
              <div key={String(item._id)} className="flex justify-between gap-4 border-b border-border pb-4 text-sm">
                <div>
                  <p className="text-foreground">{item.product_name}</p>
                  <p className="text-muted">{[item.metal, item.gemstone, item.gemstone_size, item.ring_size].filter(Boolean).join(" / ")}</p>
                  <p className="text-muted">Qty {item.quantity}</p>
                </div>
                <p className="text-foreground">{formatCurrency(Number(item.line_total_inr))}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border bg-surface p-6">
          <h2 className="font-display text-2xl text-foreground">Shipping Address</h2>
          {addr ? <p className="mt-4 text-sm leading-7 text-muted">{addr.fullName}<br />{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />{addr.city}, {addr.state} {addr.postalCode}<br />{addr.country || "India"}<br />{addr.phone}</p> : <p className="mt-4 text-sm text-muted">—</p>}
        </div>
      </div>
      <aside className="h-fit border border-border bg-surface-muted/30 p-6">
        <h2 className="font-display text-2xl text-foreground">Payment Summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(Number(order.subtotal_inr))}</span></div>
          <div className="flex justify-between"><span className="text-muted">Discount</span><span>- {formatCurrency(Number(order.discount_inr ?? 0))}</span></div>
          <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{Number(order.shipping_inr) === 0 ? "Complimentary" : formatCurrency(Number(order.shipping_inr))}</span></div>
          <div className="flex justify-between border-t border-border pt-3 text-base text-foreground"><span>Total</span><span>{formatCurrency(Number(order.total_inr))}</span></div>
        </div>
        <div className="mt-6 space-y-3">
          <Link href="/account" className="block w-full bg-foreground px-6 py-4 text-center text-xs font-medium tracking-[0.2em] text-background uppercase hover:bg-accent-strong">View Order History</Link>
          <Link href="/products" className="block w-full border border-border px-6 py-4 text-center text-xs font-medium tracking-[0.2em] text-foreground uppercase hover:border-accent">Continue Shopping</Link>
        </div>
      </aside>
    </div>
  );
}

export default function OrderConfirmationPage({ params }: Props) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-strong uppercase">Order Confirmed</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">Thank you for your order</h1>
        <p className="mt-4 text-base text-muted">Your order has been received and is being processed.</p>
        <Suspense fallback={<div className="mt-10 border border-border bg-surface-muted/30 p-10 text-center text-sm text-muted">Loading order...</div>}>
          <OrderConfirmationContent params={params} />
        </Suspense>
      </Container>
    </section>
  );
}
