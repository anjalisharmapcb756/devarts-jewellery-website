import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import { productFallback } from "../data/catalogue";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (document.querySelector('script[data-razorpay="true"]')) {
      const existing = document.querySelector('script[data-razorpay="true"]');
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.dataset.razorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Field({ label, name, value, onChange, type = "text", placeholder = "", required = true, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
      />
    </label>
  );
}

const initialShipping = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" };

export default function Checkout() {
  const { user } = useAuth();
  const { cart, clearCart, products, removeFromCart } = useStore();
  const nav = useNavigate();

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [shipping, setShipping] = useState(initialShipping);
  const [addresses, setAddresses] = useState([]);
  const [addressChoice, setAddressChoice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [config, setConfig] = useState({ razorpayEnabled: false, codEnabled: true });
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const productsById = useMemo(() => {
    const map = new Map();
    for (const p of products || []) map.set(String(p.id), p);
    return map;
  }, [products]);

  const items = useMemo(() => cart.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    selection: i.selection,
  })), [cart]);

  const unavailableId = quoteError.match(/Product unavailable:\s*([^\s.]+)/i)?.[1] || null;
  const unavailableItem = unavailableId ? cart.find((i) => String(i.productId) === unavailableId) : null;

  const applyAddress = useCallback((address) => {
    if (!address) return;
    setShipping({
      fullName: address.full_name || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postal_code || "",
      country: address.country || "India",
    });
    if (address.phone) setContact((c) => ({ ...c, phone: c.phone || address.phone }));
  }, []);

  useEffect(() => {
    apiFetch("/checkout/config").then((d) => {
      setConfig(d || {});
      if (d?.razorpayEnabled) setPaymentMethod("razorpay");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setContact((c) => ({ ...c, email: c.email || user.email || "" }));
    setShipping((s) => ({ ...s, fullName: s.fullName || user.name || "" }));
    apiFetch("/addresses").then((d) => {
      const list = Array.isArray(d?.addresses) ? d.addresses : [];
      setAddresses(list);
      const saved = list.find((a) => a.is_default) || list[0];
      if (saved) {
        setAddressChoice(String(saved._id));
        applyAddress(saved);
      }
    }).catch(() => {});
  }, [user, applyAddress]);

  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return undefined;
    }
    let active = true;
    setQuoteLoading(true);
    setQuoteError("");
    const timer = window.setTimeout(() => {
      apiFetch("/checkout/quote", { method: "POST", body: JSON.stringify({ items, couponCode: appliedCoupon || null }) })
        .then((d) => { if (active) setQuote(d?.quote || null); })
        .catch((e) => { if (active) setQuoteError(e.message || "Unable to price your order."); })
        .finally(() => { if (active) setQuoteLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [items, appliedCoupon]);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    setCouponLoading(true);
    setCouponMessage("");
    try {
      const d = await apiFetch("/checkout/quote", { method: "POST", body: JSON.stringify({ items, couponCode: code || null }) });
      setQuote(d?.quote || null);
      setAppliedCoupon(code.toUpperCase());
      setCouponMessage(code ? `Coupon ${code.toUpperCase()} applied.` : "Coupon removed.");
    } catch (e) {
      setCouponMessage(e.message || "Invalid coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const validate = () => {
    if (!user) return "Please login before checkout.";
    if (!items.length) return "Your cart is empty.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) return "Enter a valid email address.";
    if (contact.phone.replace(/\D/g, "").length < 8) return "Enter a valid phone number.";
    for (const [key, label] of [["fullName", "recipient name"], ["line1", "address"], ["city", "city"], ["state", "state"], ["postalCode", "postal code"]]) {
      if (!String(shipping[key] || "").trim()) return `Enter the ${label}.`;
    }
    if (quoteError || !quote) return quoteError || "Order summary is not ready yet.";
    return "";
  };

  const finish = (result) => {
    clearCart();
    const query = new URLSearchParams({ orderNumber: result.orderNumber || "" });
    if (result.orderId) query.set("orderId", result.orderId);
    if (result.paymentMethod) query.set("method", result.paymentMethod);
    nav(`/order-confirmation?${query.toString()}`);
  };

  const payWithRazorpay = async (payload) => {
    const ok = await loadRazorpay();
    if (!ok) throw new Error("Failed to load Razorpay. Please try again or choose cash on delivery.");
    const data = await apiFetch("/checkout/create-razorpay-order", { method: "POST", body: JSON.stringify(payload) });
    await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Vara Jewellery",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { email: contact.email, contact: contact.phone, name: shipping.fullName },
        notes: { orderNumber: data.orderNumber },
        theme: { color: "#8b6f52" },
        modal: {
          ondismiss: async () => {
            try {
              await apiFetch("/checkout/payment-failed", { method: "POST", body: JSON.stringify({ orderId: data.orderId, cancelled: true }) });
            } catch {}
            reject(new Error("Payment was cancelled."));
          },
        },
        handler: async (resp) => {
          try {
            const result = await apiFetch("/checkout/verify-payment", { method: "POST", body: JSON.stringify({ ...resp, orderId: data.orderId }) });
            resolve(result);
          } catch (err) {
            reject(err);
          }
        },
      });
      rzp.on("payment.failed", async (resp) => {
        try {
          await apiFetch("/checkout/payment-failed", { method: "POST", body: JSON.stringify({ orderId: data.orderId, reason: resp?.error?.description, code: resp?.error?.code }) });
        } catch {}
        reject(new Error(resp?.error?.description || "Payment failed."));
      });
      rzp.open();
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const payload = { items, contact, shippingAddress: shipping, couponCode: appliedCoupon || null };
    setSubmitting(true);
    try {
      if (paymentMethod === "cod") {
        const result = await apiFetch("/checkout/create-cod-order", { method: "POST", body: JSON.stringify(payload) });
        finish(result);
        return;
      }
      const result = await payWithRazorpay(payload);
      finish({ ...result, paymentMethod: "razorpay" });
    } catch (err) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactChange = (e) => setContact((c) => ({ ...c, [e.target.name]: e.target.value }));
  const shippingChange = (e) => setShipping((s) => ({ ...s, [e.target.name]: e.target.value }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent">Secure Checkout</p>
          <h1 className="mt-2 font-display text-5xl">Checkout</h1>
        </div>
        <Link to="/cart" className="text-sm text-muted hover:text-accent">← Back to cart</Link>
      </div>

      {!items.length ? (
        <div className="mt-10 border border-border bg-white p-10 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link to="/products" className="mt-6 inline-block bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent">Shop now</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="border border-border bg-white p-6 sm:p-8">
              <h2 className="font-display text-2xl">1. Contact</h2>
              <p className="mt-1 text-sm text-muted">We’ll send your order updates here.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" placeholder="you@example.com" value={contact.email} onChange={contactChange} />
                <Field label="Phone" name="phone" type="tel" placeholder="98765 43210" value={contact.phone} onChange={contactChange} />
              </div>
            </section>

            <section className="border border-border bg-white p-6 sm:p-8">
              <h2 className="font-display text-2xl">2. Shipping Address</h2>
              {addresses.length > 0 && (
                <label className="mt-5 block">
                  <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-muted">Saved addresses</span>
                  <select
                    value={addressChoice}
                    onChange={(e) => {
                      const id = e.target.value;
                      setAddressChoice(id);
                      if (!id) setShipping(initialShipping);
                      else applyAddress(addresses.find((a) => String(a._id) === id));
                    }}
                    className="w-full border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
                  >
                    <option value="">Use a new address</option>
                    {addresses.map((a) => <option key={String(a._id)} value={String(a._id)}>{a.full_name} — {a.line1}, {a.city}</option>)}
                  </select>
                </label>
              )}
              <div className="mt-5 grid gap-4">
                <Field label="Full name" name="fullName" placeholder="Recipient name" value={shipping.fullName} onChange={shippingChange} />
                <Field label="Address line 1" name="line1" placeholder="House no., street, area" value={shipping.line1} onChange={shippingChange} />
                <Field label="Address line 2" name="line2" placeholder="Landmark, apartment (optional)" value={shipping.line2} onChange={shippingChange} required={false} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" name="city" value={shipping.city} onChange={shippingChange} />
                  <Field label="State" name="state" value={shipping.state} onChange={shippingChange} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Postal code" name="postalCode" value={shipping.postalCode} onChange={shippingChange} />
                  <Field label="Country" name="country" value={shipping.country} onChange={shippingChange} />
                </div>
              </div>
            </section>

            <section className="border border-border bg-white p-6 sm:p-8">
              <h2 className="font-display text-2xl">3. Payment</h2>
              <div className="mt-5 space-y-3">
                <label className={`flex cursor-pointer items-start gap-3 border p-4 ${paymentMethod === "cod" ? "border-accent bg-surface-muted/40" : "border-border"}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1 accent-[#8b6f52]" />
                  <span>
                    <span className="block text-sm font-medium">Cash on Delivery</span>
                    <span className="mt-1 block text-xs text-muted">Pay when your jewellery arrives. No card or UPI needed.</span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 border p-4 ${paymentMethod === "razorpay" ? "border-accent bg-surface-muted/40" : "border-border"} ${config.razorpayEnabled ? "" : "opacity-60"}`}>
                  <input type="radio" name="paymentMethod" disabled={!config.razorpayEnabled} checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="mt-1 accent-[#8b6f52]" />
                  <span>
                    <span className="block text-sm font-medium">UPI / Card / Net Banking</span>
                    <span className="mt-1 block text-xs text-muted">{config.razorpayEnabled ? "Secured by Razorpay." : "Razorpay is not configured. Choose Cash on Delivery."}</span>
                  </span>
                </label>
              </div>
            </section>

            {(error || quoteError) && (
              <div className="border border-[#e2c7c7] bg-[#fdf6f6] p-4 text-sm text-[#8a4b4b]">
                <p>{error || quoteError}</p>
                {unavailableId && (
                  <button
                    type="button"
                    onClick={() => unavailableItem && removeFromCart(unavailableItem.key)}
                    className="mt-2 text-xs font-medium text-[#8a4b4b] underline"
                  >
                    Remove {unavailableId} from cart and continue
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || quoteLoading || Boolean(quoteError)}
              className="w-full bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing your order..." : paymentMethod === "cod" ? "Place Order — Cash on Delivery" : "Pay Securely"}
            </button>
            <p className="text-center text-xs text-muted">By placing this order you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>

          <aside className="h-fit border border-border bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl">Order Summary</h2>

            <div className="mt-5 max-h-64 space-y-4 overflow-y-auto border-y border-border py-5">
              {(quote?.items || []).map((item, index) => {
                const catalogProduct = productsById.get(String(item.productId));
                const fallback = productFallback(item.productSlug || item.productId);
                return (
                  <div key={`${item.productId}-${index}`} className="flex gap-3">
                    <img
                      src={acceptableImage(item.image, fallback)}
                      alt={item.name}
                      className="h-16 w-14 object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted">Qty {item.quantity}{catalogProduct ? ` · ${catalogProduct.gemstone || "Gemstone"}` : ""}</p>
                    </div>
                    <span className="text-sm">{formatPrice(item.lineTotal)}</span>
                  </div>
                );
              })}
              {!quote && quoteLoading && <p className="text-sm text-muted">Calculating your order...</p>}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(quote?.subtotal ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{quote?.shipping === 0 ? "Free" : formatPrice(quote?.shipping ?? 0)}</span></div>
              {Number(quote?.couponDiscount || 0) > 0 && <div className="flex justify-between text-[#4f7258]"><span>Discount ({quote?.couponCode})</span><span>-{formatPrice(quote.couponDiscount)}</span></div>}
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(quote?.total ?? 0)}</span></div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <label className="text-[11px] uppercase tracking-[0.15em] text-muted" htmlFor="coupon">Coupon code</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponMessage(""); }}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
                <button type="button" onClick={applyCoupon} disabled={couponLoading} className="border border-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] hover:bg-foreground hover:text-white disabled:opacity-50">
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <button type="button" onClick={() => { setCouponInput(""); setAppliedCoupon(""); setCouponMessage(""); }} className="mt-2 text-xs text-accent underline">
                  Remove {appliedCoupon}
                </button>
              )}
              {couponMessage && <p className={`mt-2 text-xs ${appliedCoupon && couponInput.toUpperCase() === appliedCoupon ? "text-[#4f7258]" : "text-[#8a4b4b]"}`}>{couponMessage}</p>}
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-6 text-xs text-muted">
              <p>✓ BIS hallmarked jewellery</p>
              <p>✓ Complimentary insured shipping above ₹50,000</p>
              <p>✓ 15-day easy returns</p>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

function acceptableImage(value, fallback) {
  const src = String(value || "").trim();
  return src && !src.includes("/images/references/") && !src.includes("placeholder") ? src : fallback;
}
