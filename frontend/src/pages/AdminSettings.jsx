import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import AdminNav from "../components/admin/AdminNav";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ siteName: "Vara", currency: "INR" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { apiFetch("/admin/settings").then((d) => setSettings(d || settings)).catch(() => {}); }, []);
  const save = async (e) => { e.preventDefault(); setErr(""); setMsg(""); try { await apiFetch("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }); setMsg("Settings saved."); } catch (e2) { setErr(e2.message); } };
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Admin</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <AdminNav />
      {err && <p className="mt-4 text-sm text-[#8a4b4b]">{err}</p>}
      {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}
      <form onSubmit={save} className="mt-8 border border-border p-6 space-y-4">
        <label className="block"><span className="text-[11px] uppercase tracking-[0.12em] text-muted">Site Name</span><input value={settings.siteName || ""} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="mt-1 w-full border border-border bg-transparent px-3 py-2 outline-none focus:border-accent" /></label>
        <label className="block"><span className="text-[11px] uppercase tracking-[0.12em] text-muted">Currency</span><input value={settings.currency || ""} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="mt-1 w-full border border-border bg-transparent px-3 py-2 outline-none focus:border-accent" /></label>
        <button className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-white">Save Settings</button>
      </form>
    </div>
  );
}
