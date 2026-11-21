"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
};

type Order = {
  id: string;
  date: string;
  total: string;
  status: string;
  items: string[];
};

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface p-6 sm:p-8">
      <h2 className="font-display text-3xl tracking-tight text-foreground">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent";
const btnPrimary = "bg-foreground px-6 py-3 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary = "border border-border px-6 py-3 text-xs font-medium tracking-[0.2em] text-foreground uppercase transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function AccountDashboard() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<"profile" | "addresses" | "orders">("profile");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Address>({ id: "", label: "Home", name: "", line1: "", line2: "", city: "", state: "", postalCode: "", phone: "", isDefault: false });

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!configured) {
        const demo = readLS<UserProfile>("vara-demo-profile", {
          id: "demo-user",
          email: "demo@vara.store",
          fullName: "Vara Guest",
          phone: "",
        });
        setUser(demo);
        setFullName(demo.fullName);
        setEmail(demo.email);
        setPhone(demo.phone);
        setAddresses(readLS<Address[]>(`vara-addresses-${demo.id}`, []));
        setOrders(readLS<Order[]>(`vara-orders-${demo.id}`, []));
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        router.push("/login?next=/account");
        return;
      }
      const profile: UserProfile = {
        id: u.id,
        email: u.email ?? "",
        fullName: (u.user_metadata?.full_name as string) || "",
        phone: (u.user_metadata?.phone as string) || "",
      };
      setUser(profile);
      setFullName(profile.fullName);
      setEmail(profile.email);
      setPhone(profile.phone);
      setAddresses(readLS<Address[]>(`vara-addresses-${u.id}`, []));
      try {
        const { data: dbOrders } = await supabase
          .from("orders")
          .select("id, order_number, status, payment_status, total_inr, placed_at, order_items(product_name)")
          .eq("user_id", u.id)
          .order("placed_at", { ascending: false });
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders.map((o: any) => ({
            id: o.order_number || o.id.slice(0, 8),
            date: o.placed_at ? new Date(o.placed_at).toLocaleDateString("en-IN") : "",
            total: `₹${Number(o.total_inr ?? 0).toLocaleString("en-IN")}`,
            status: `${o.status}${o.payment_status ? ` / ${o.payment_status}` : ""}`,
            items: (o.order_items ?? []).map((i: any) => i.product_name).filter(Boolean),
          })));
        } else {
          setOrders(readLS<Order[]>(`vara-orders-${u.id}`, []));
        }
      } catch {
        setOrders(readLS<Order[]>(`vara-orders-${u.id}`, []));
      }
      setLoading(false);
    };
    load();
  }, [configured, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!fullName.trim()) return setMessage({ type: "error", text: "Full name is required." });
    if (!configured) {
      const emailValue = email.trim();
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        return setMessage({ type: "error", text: "Enter a valid email address." });
      }
      const next = user ? { ...user, fullName: fullName.trim(), email: emailValue, phone: phone.trim() } : null;
      if (next) {
        setUser(next);
        writeLS("vara-demo-profile", next);
      }
      setMessage({ type: "success", text: "Profile saved locally (demo mode). Configure Supabase for real accounts." });
      return;
    }
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim(), phone: phone.trim() } });
    setSavingProfile(false);
    if (error) return setMessage({ type: "error", text: error.message });
    setUser((prev) => (prev ? { ...prev, fullName: fullName.trim(), phone: phone.trim() } : prev));
    setMessage({ type: "success", text: "Profile updated successfully." });
  };

  const logout = async () => {
    if (!configured) {
      setMessage({ type: "success", text: "Demo mode: no authenticated session to sign out. Configure Supabase for real authentication." });
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({ id: "", label: "Home", name: "", line1: "", line2: "", city: "", state: "", postalCode: "", phone: "", isDefault: false });
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!user) return;
    if (!addressForm.name.trim() || !addressForm.line1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.postalCode.trim() || !addressForm.phone.trim()) {
      return setMessage({ type: "error", text: "Please fill all required address fields." });
    }
    let next = [...addresses];
    const entry: Address = { ...addressForm, id: addressForm.id || uid(), name: addressForm.name.trim(), line1: addressForm.line1.trim(), line2: addressForm.line2?.trim(), city: addressForm.city.trim(), state: addressForm.state.trim(), postalCode: addressForm.postalCode.trim(), phone: addressForm.phone.trim() };
    if (entry.isDefault) next = next.map((a) => ({ ...a, isDefault: false }));
    if (editingAddress) next = next.map((a) => (a.id === editingAddress.id ? entry : a));
    else next = [entry, ...next];
    setAddresses(next);
    writeLS(`vara-addresses-${user.id}`, next);
    resetAddressForm();
    setMessage({ type: "success", text: editingAddress ? "Address updated." : "Address saved." });
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setTab("addresses");
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    writeLS(`vara-addresses-${user.id}`, next);
    setMessage({ type: "success", text: "Address removed." });
  };

  if (loading) {
    return <div className="border border-border bg-surface p-10 text-sm text-muted">Loading your account...</div>;
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {!configured ? (
        <div className="border border-[#d8c7a7] bg-[#fff8ec] px-4 py-3 text-sm text-[#6b5631]">
          Demo mode: Supabase is not configured. Profile/addresses/orders are saved locally in this browser. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local for real authentication.
        </div>
      ) : null}
      <div className="flex flex-col gap-4 border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">Welcome</p>
          <h2 className="mt-2 font-display text-3xl text-foreground">{user.fullName || "Vara Customer"}</h2>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <button type="button" onClick={logout} className={btnSecondary}>Log Out</button>
      </div>

      {message ? (
        <div className={`border px-4 py-3 text-sm ${message.type === "error" ? "border-[#c9a3a3] bg-[#fdf7f7] text-[#7a3d3d]" : "border-[#b8c9b0] bg-[#f5faf3] text-[#3f5a36]"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {([
          ["profile", "Profile"],
          ["addresses", "Saved Addresses"],
          ["orders", "Order History"],
        ] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)} className={`px-5 py-3 text-xs font-medium tracking-[0.16em] uppercase transition ${tab === key ? "bg-foreground text-background" : "border border-border text-foreground hover:border-accent"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <SectionCard title="Profile Details" description="Update your personal information.">
          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" id="profile-name">
              <input id="profile-name" className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email" id="profile-email">
              <input
                id="profile-email"
                className={`${inputCls} ${configured ? "bg-surface-muted/40" : ""}`}
                value={configured ? user.email : email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={configured}
              />
            </Field>
            <Field label="Phone" id="profile-phone">
              <input id="profile-phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" />
            </Field>
            <div className="sm:col-span-2">
              <button type="submit" disabled={savingProfile} className={btnPrimary}>{savingProfile ? "Saving..." : "Save Profile"}</button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      {tab === "addresses" ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <SectionCard title="Saved Addresses" description="Manage delivery addresses for faster checkout.">
            {addresses.length === 0 ? (
              <p className="text-sm text-muted">No saved addresses yet.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs tracking-[0.16em] text-accent-strong uppercase">{address.label}{address.isDefault ? " · Default" : ""}</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{address.name}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.postalCode}<br />{address.phone}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button type="button" onClick={() => editAddress(address)} className="text-xs tracking-[0.14em] text-muted uppercase hover:text-foreground">Edit</button>
                      <button type="button" onClick={() => deleteAddress(address.id)} className="text-xs tracking-[0.14em] text-muted uppercase hover:text-foreground">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={editingAddress ? "Edit Address" : "Add Address"} description="Use a complete address for insured delivery.">
            <form onSubmit={saveAddress} className="grid gap-5 sm:grid-cols-2">
              <Field label="Label" id="addr-label"><input id="addr-label" className={inputCls} value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Home / Office" /></Field>
              <Field label="Full Name" id="addr-name"><input id="addr-name" className={inputCls} value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Address Line 1" id="addr-line1"><input id="addr-line1" className={inputCls} value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="Address Line 2 (Optional)" id="addr-line2"><input id="addr-line2" className={inputCls} value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} /></Field></div>
              <Field label="City" id="addr-city"><input id="addr-city" className={inputCls} value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></Field>
              <Field label="State" id="addr-state"><input id="addr-state" className={inputCls} value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} /></Field>
              <Field label="Postal Code" id="addr-postal"><input id="addr-postal" className={inputCls} value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} /></Field>
              <Field label="Phone" id="addr-phone"><input id="addr-phone" className={inputCls} value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} /></Field>
              <label className="flex items-center gap-3 text-sm text-muted sm:col-span-2">
                <input type="checkbox" checked={!!addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <div className="flex gap-3 sm:col-span-2">
                <button type="submit" className={btnPrimary}>{editingAddress ? "Update Address" : "Save Address"}</button>
                {editingAddress ? <button type="button" onClick={resetAddressForm} className={btnSecondary}>Cancel</button> : null}
              </div>
            </form>
          </SectionCard>
        </div>
      ) : null}

      {tab === "orders" ? (
        <SectionCard title="Order History" description="Track your past and current jewellery orders.">
          {orders.length === 0 ? (
            <div className="border border-border bg-surface-muted/30 p-8 text-center">
              <p className="font-display text-2xl text-foreground">No orders yet</p>
              <p className="mt-2 text-sm text-muted">When you place an order, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-[0.16em] text-muted uppercase">Order {order.id}</p>
                      <p className="mt-1 text-sm text-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">{order.total}</p>
                      <p className="text-xs tracking-[0.14em] text-accent-strong uppercase">{order.status}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{order.items.join(", ")}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}
    </div>
  );
}