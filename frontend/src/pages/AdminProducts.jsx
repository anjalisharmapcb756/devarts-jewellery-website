import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import AdminNav from "../components/admin/AdminNav";

const blank = { name: "", slug: "", description: "", price: "", stock_quantity: "", category_id: "", badge: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [p, c] = await Promise.all([apiFetch("/admin/products"), apiFetch("/admin/categories").catch(() => [])]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => `${p.name} ${p.categories?.name || ""} ${p.sku || ""}`.toLowerCase().includes(q.toLowerCase()));

  const save = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    try {
      const payload = { ...form, price_inr: Number(form.price), stock_quantity: Number(form.stock_quantity), category_id: form.category_id || undefined };
      if (editing) await apiFetch(`/admin/products/${editing}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiFetch("/admin/products", { method: "POST", body: JSON.stringify(payload) });
      setForm(blank); setEditing(null); setMsg("Product saved."); load();
    } catch (e2) { setErr(e2.message); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await apiFetch(`/admin/products/${id}`, { method: "DELETE" }); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Admin</p>
      <h1 className="mt-2 font-display text-4xl">Products</h1>
      <AdminNav />
      {err && <p className="mt-4 text-sm text-[#8a4b4b]">{err}</p>}
      {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" />
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr></thead>
              <tbody>
                {filtered.map((p) => <tr key={p.id || p._id} className="border-t border-border">
                  <td className="p-3">{p.name}</td><td className="p-3">{p.categories?.name || "-"}</td><td className="p-3">{formatPrice(p.price_inr ?? p.price)}</td><td className="p-3">{p.stock_quantity ?? 0}</td>
                  <td className="p-3 whitespace-nowrap"><button onClick={() => { setEditing(p.id || p._id); setForm({ name: p.name, slug: p.slug || "", description: p.description || "", price: p.price_inr ?? p.price ?? "", stock_quantity: p.stock_quantity ?? "", category_id: p.category_id || "", badge: p.badge || "" }); }} className="mr-3 text-accent">Edit</button><button onClick={() => remove(p.id || p._id)} className="text-[#8a4b4b]">Delete</button></td>
                </tr>)}
                {!filtered.length && <tr><td colSpan="5" className="p-6 text-center text-muted">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={save} className="border border-border p-5 h-fit">
          <h2 className="font-display text-2xl">{editing ? "Edit Product" : "Add Product"}</h2>
          <div className="mt-5 space-y-3">
            {[
              ["name", "Product Name", "text"], ["slug", "Slug", "text"], ["price", "Price (INR)", "number"], ["stock_quantity", "Stock", "number"], ["badge", "Badge", "text"],
            ].map(([key, label, type]) => <label key={key} className="block"><span className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span><input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full border border-border bg-transparent px-3 py-2 outline-none focus:border-accent" /></label>)}
            <label className="block"><span className="text-[11px] uppercase tracking-[0.12em] text-muted">Category</span><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full border border-border bg-background px-3 py-2 outline-none"><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="block"><span className="text-[11px] uppercase tracking-[0.12em] text-muted">Description</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="mt-1 w-full border border-border bg-transparent px-3 py-2 outline-none focus:border-accent" /></label>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="bg-foreground px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white">{editing ? "Save Changes" : "Add Product"}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.14em]">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
