import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCustomers } from "@/lib/admin/mongo-store";

export async function GET(req: Request) {
  try { await assertAdmin(); const q = new URL(req.url).searchParams.get("q") || ""; if (isMongoConfigured()) return NextResponse.json(await mongoGetCustomers(q)); const d = readDemoDB(); const items = q ? d.customers.filter((c) => (c.full_name||"").toLowerCase().includes(q.toLowerCase()) || (c.email||"").toLowerCase().includes(q.toLowerCase())) : d.customers; return NextResponse.json(items); } catch (e: any) { const msg = e?.message || "Unauthorized"; return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 }); }
}
