"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/store/store-provider";
import { formatCurrency } from "@/lib/utils";
import { formatSelection } from "@/lib/pricing";
import type { Product } from "@/types/product";

declare global { interface Window { Razorpay?: any } }

type Address = { fullName: string; phone: string; line1: string; line2: string; city: string; state: string; postalCode: string; country: string };
const emptyAddress: Address = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" };

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-medium tracking-[0.16em] text-muted uppercase">{label}</span>{children}</label>;
}

export function CheckoutForm({ products, initialEmail = "" }: { products: Product[]; initialEmail?: string }) {
  const router = useRouter();
  const { cart, isLoaded, clearCart } = useStore();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const items = useMemo(() => cart.map((c) => {
    const p = products.find((x) => x.id === c.productId);
    return p ? { ...c, product: p } : null;
  }).filter(Boolean) as any[], [cart, products]);

  const payloadItems = useMemo(() => cart.map((c) => ({ productId: c.productId, quantity: c.quantity, selection: c.selection })), [cart]);

  async function refreshQuote(coupon?: string | null) {
    if (!payloadItems.length) { setQuote(null); return; }
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: payloadItems, couponCode: coupon ?? appliedCoupon }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to calculate total");
      setQuote(data.quote);
    } catch (e: any) {
      setQuote(null);
    } finally { setQuoteLoading(false); }
  }

  useEffect(() => { if (isLoaded) refreshQuote(appliedCoupon); }, [isLoaded, cart, appliedCoupon]);

  function validate() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required.";
    if (!phone.trim()) return "Phone number is required.";
    const a = shipping;
    if (!a.fullName || !a.line1 || !a.city || !a.state || !a.postalCode || !a.phone) return "Complete shipping address is required.";
    if (!sameAsShipping) {
      const b = billing;
      if (!b.fullName || !b.line1 || !b.city || !b.state || !b.postalCode || !b.phone) return "Complete billing address is required.";
    }
    if (!items.length) return "Your cart is empty.";
    return null;
  }

  async function applyCoupon() {
    setError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: payloadItems, couponCode: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon");
      setQuote(data.quote); setAppliedCoupon(code); setSuccess(`Coupon ${code} applied.`); setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) { setError(e.message); }
    finally { setQuoteLoading(false); }
  }

  async function pay() {
    setError(null); setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Unable to load Razorpay checkout. Please check your connection.");

      const billingAddress = sameAsShipping ? shipping : billing;
      const createRes = await fetch("/api/checkout/create-razorpay-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, couponCode: appliedCoupon, contact: { email, phone }, shippingAddress: shipping, billingAddress, notes: "" }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Unable to create payment order.");

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "Vara",
        description: "Luxury Jewellery Purchase",
        order_id: createData.razorpayOrderId,
        prefill: { email, contact: phone, name: shipping.fullName },
        notes: { orderNumber: createData.orderNumber },
        theme: { color: "#292521" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, orderId: createData.orderId }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");
            clearCart();
            window.localStorage.removeItem("vara-cart");
            router.push(`/order-confirmation/${createData.orderId}?order=${encodeURIComponent(createData.orderNumber)}`);
            router.refresh();
          } catch (e: any) {
            setError(e.message || "Payment verification failed. Please contact support with your payment details.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            await fetch("/api/checkout/payment-failed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: createData.orderId, razorpay_order_id: createData.razorpayOrderId, cancelled: true, reason: "Checkout dismissed" }) }).catch(() => {});
            setLoading(false);
            setError("Payment was cancelled. Your cart is preserved.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        await fetch("/api/checkout/payment-failed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: createData.orderId, razorpay_order_id: createData.razorpayOrderId, cancelled: false, reason: response?.error?.description, code: response?.error?.code }) }).catch(() => {});
        setError(response?.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (e: any) {
      setError(e.message || "Checkout failed.");
      setLoading(false);
    }
  }

  const subtotal = quote?.subtotal ?? items.reduce((s: number, i: any) => s + i.unitPrice * i.quantity, 0);
  const couponDiscount = quote?.couponDiscount ?? 0;
  const shippingFee = quote?.shipping ?? (subtotal >= 50000 ? 0 : 499);
  const total = quote?.total ?? Math.max(0, subtotal - couponDiscount + shippingFee);

  if (isLoaded && !items.length) {
    return (
      <div className="mt-12 border border-border bg-surface-muted/30 p-10 text-center">
        <p className="font-display text-3xl text-foreground">Your bag is empty</p>
        <p className="mt-3 text-sm text-muted">Add items before checking out.</p>
        <Link href="/products" className="mt-6 inline-flex bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase">Explore Jewellery</Link>
      </div>
    );
  }

  const addressFields = (addr: Address, setAddr: (a: Address) => void, prefix: string) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name"><input className={inputCls} value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} autoComplete={`${prefix} name`} /></Field>
      <Field label="Phone"><input className={inputCls} value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} autoComplete={`${prefix} tel`} /></Field>
      <div className="sm:col-span-2"><Field label="Address Line 1"><input className={inputCls} value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} autoComplete={`${prefix} address-line1`} /></Field></div>
      <div className="sm:col-span-2"><Field label="Address Line 2 (Optional)"><input className={inputCls} value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} autoComplete={`${prefix} address-line2`} /></Field></div>
      <Field label="City"><input className={inputCls} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} autoComplete={`${prefix} address-level2`} /></Field>
      <Field label="State"><input className={inputCls} value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} autoComplete={`${prefix} address-level1`} /></Field>
      <Field label="Postal Code"><input className={inputCls} value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} autoComplete={`${prefix} postal-code`} /></Field>
      <Field label="Country"><input className={inputCls} value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} autoComplete={`${prefix} country-name`} /></Field>
    </div>
  );

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
        {success ? <div className="border border-[#b8c9b0] bg-[#f5faf3] px-4 py-3 text-sm text-[#3f5a36]">{success}</div> : null}

        <section className="border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-3xl text-foreground">Contact Information</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Email"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
            <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></Field>
          </div>
        </section>

        <section className="border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-3xl text-foreground">Shipping Address</h2>
          <div className="mt-6">{addressFields(shipping, setShipping, "shipping")}</div>
        </section>

        <section className="border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-foreground">Billing Address</h2>
            <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} /> Same as shipping</label>
          </div>
          {!sameAsShipping ? <div className="mt-6">{addressFields(billing, setBilling, "billing")}</div> : <p className="mt-4 text-sm text-muted">Billing address will be same as shipping.</p>}
        </section>
      </div>

      <aside className="h-fit border border-border bg-surface-muted/30 p-6 lg:sticky lg:top-32">
        <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">Order Summary</p>
        <div className="mt-6 space-y-4">
          {items.map((item: any) => (
            <div key={item.key} className="flex justify-between gap-4 border-b border-border pb-4 text-sm">
              <div><p className="text-foreground">{item.product.name}</p><p className="text-muted">{formatSelection(item.selection)}</p><p className="text-muted">Qty {item.quantity}</p></div>
              <p className="text-foreground">{formatCurrency(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-xs tracking-[0.16em] text-muted uppercase">Coupon Code</label>
          <div className="flex gap-2">
            <input className={inputCls} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon" />
            <button type="button" onClick={applyCoupon} disabled={quoteLoading} className="border border-border px-4 py-2 text-xs tracking-[0.14em] uppercase hover:border-accent disabled:opacity-50">Apply</button>
          </div>
          {appliedCoupon ? <p className="text-xs text-accent-strong">Applied: {appliedCoupon}</p> : null}
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="text-foreground">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Coupon Discount</span><span className="text-foreground">{couponDiscount > 0 ? `- ${formatCurrency(couponDiscount)}` : formatCurrency(0)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="text-foreground">{shippingFee === 0 ? "Complimentary" : formatCurrency(shippingFee)}</span></div>
          <div className="flex justify-between border-t border-border pt-3 text-base"><span className="text-foreground">Final Payable</span><span className="text-foreground">{formatCurrency(total)}</span></div>
        </div>

        <button type="button" onClick={pay} disabled={loading || quoteLoading} className="mt-6 w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
        <p className="mt-4 text-xs leading-6 text-muted">Payments are processed securely by Razorpay. Totals and stock are validated server-side before order confirmation.</p>
      </aside>
    </div>
  );
}