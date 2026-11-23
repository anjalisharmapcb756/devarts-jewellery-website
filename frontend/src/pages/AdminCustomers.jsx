import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import AdminNav from "../components/admin/AdminNav";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    apiFetch(`/admin/customers?q=${encodeURIComponent(q)}`).then((d) => setCustomers(Array.isArray(d) ? d : [])).catch((e) => setErr(e.message));
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Admin</p>
      <h1 className="mt-2 font-display text-4xl">Customers</h1>
      <AdminNav />
      {err && <p className="mt-4 text-sm text-[#8a4b4b]">{err}</p>}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="mt-8 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" />
      <div className="mt-4 overflow-x-auto border border-border">
        <table className="w-full text-sm"><thead className="bg-surface-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr></thead>
          <tbody>{customers.map((c) => <tr key={c.id} className="border-t border-border"><td className="p-3">{c.full_name || "—"}</td><td className="p-3">{c.email}</td><td className="p-3">{c.phone || "—"}</td><td className="p-3">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td></tr>)}
          {!customers.length && <tr><td colSpan="4" className="p-6 text-center text-muted">No customers found.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
