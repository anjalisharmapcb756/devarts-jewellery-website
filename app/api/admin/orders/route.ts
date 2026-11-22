import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetOrders } from "@/lib/admin/mongo-store";

export async function GET(req: Request) {
  try { await assertAdmin(); const url = new URL(req.url); const q = url.searchParams.get("q") || ""; const status = url.searchParams.get("status") || ""; if (isMongoConfigured()) return NextResponse.json(await mongoGetOrders(q, status)); const d = readDemoDB(); let items = [...d.orders]; if (status) items = items.filter((o) => o.status === status); if (q) items = items.filter((o) => (o.order_number || "").toLowerCase().includes(q.toLowerCase())); return NextResponse.json(items); } catch (e: any) { const msg = e?.message || "Unauthorized"; return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 }); }
}
