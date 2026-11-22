"use client";

import { useEffect, useState } from "react";

type Settings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  freeShippingThreshold: string;
};

const KEY = "vara-admin-settings";
const defaults: Settings = {
  storeName: "Vara",
  supportEmail: "support@vara.example.com",
  supportPhone: "+91 00000 00000",
  announcement: "Complimentary insured shipping on orders above ₹50,000",
  freeShippingThreshold: "50000",
};

export function WebsiteSettings() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaults, ...data });
          localStorage.setItem(KEY, JSON.stringify({ ...defaults, ...data }));
        } else {
          const raw = localStorage.getItem(KEY);
          if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
        }
      } catch {
        try { const raw = localStorage.getItem(KEY); if (raw) setSettings({ ...defaults, ...JSON.parse(raw) }); } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof Settings>(k: K, v: string) {
    setSaved(false);
    setError(null);
    setSettings((s) => ({ ...s, [k]: v }));
  }

  async function save() {
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save settings");
      const data = await res.json();
      setSettings({ ...defaults, ...data });
      localStorage.setItem(KEY, JSON.stringify({ ...defaults, ...data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      localStorage.setItem(KEY, JSON.stringify(settings));
      setError(e?.message || "Failed to save settings");
    }
  }

  const input = "w-full border border-[#ddd5ca] bg-[#fffdfa] px-4 py-3 text-sm text-[#292521] outline-none focus:border-[#a88755]";
  const label = "mb-2 block text-[11px] font-medium tracking-[0.16em] text-[#7b736a] uppercase";

  return (
    <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">Website Settings</p>
      <h2 className="mt-2 font-display text-3xl text-[#292521]">Store settings</h2>
      <p className="mt-2 text-sm text-[#6e6861]">Settings are saved through the admin API and persisted in the configured database (or local demo store).</p>
      {error ? <div className="mt-4 border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block"><span className={label}>Store Name</span><input className={input} value={settings.storeName} onChange={(e) => update("storeName", e.target.value)} disabled={loading} /></label>
        <label className="block"><span className={label}>Support Email</span><input className={input} value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} disabled={loading} /></label>
        <label className="block"><span className={label}>Support Phone</span><input className={input} value={settings.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} disabled={loading} /></label>
        <label className="block"><span className={label}>Free Shipping Threshold (INR)</span><input className={input} value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)} disabled={loading} /></label>
        <label className="block sm:col-span-2"><span className={label}>Announcement Bar</span><input className={input} value={settings.announcement} onChange={(e) => update("announcement", e.target.value)} disabled={loading} /></label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={save} disabled={loading} className="bg-[#292521] px-5 py-3 text-xs font-medium tracking-[0.16em] text-[#f8f5f0] uppercase hover:bg-[#a88755] disabled:opacity-50">Save Settings</button>
        {saved ? <span className="text-sm text-[#6b5631]">Saved.</span> : null}
        {loading ? <span className="text-sm text-[#6e6861]">Loading...</span> : null}
      </div>
    </div>
  );
}
