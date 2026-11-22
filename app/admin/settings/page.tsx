import type { Metadata } from "next";
import { WebsiteSettings } from "@/components/admin/website-settings";

export const instant = false;

export const metadata: Metadata = { title: "Website Settings | Admin" };

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.28em] text-[#8a7453] uppercase">Settings</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[#292521]">Website Settings</h1>
        <p className="mt-2 text-sm text-[#6e6861]">Manage store information and customer-facing settings.</p>
      </div>
      <WebsiteSettings />
    </div>
  );
}
