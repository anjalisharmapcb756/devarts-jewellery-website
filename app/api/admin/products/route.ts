import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetProducts } from "@/lib/admin/mongo-store";

export async function GET(req: Request) {
  try { await assertAdmin(); const q = new URL(req.url).searchParams.get("q") || ""; if (isMongoConfigured()) return NextResponse.json(await mongoGetProducts(q)); const d = readDemoDB(); const items = q ? d.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : d.products; return NextResponse.json(items.map((p) => ({ ...p, categories: { name: d.categories.find((c) => c.id === p.category_id)?.name || "—" } }))); } catch (e: any) { const msg = e?.message || "Unauthorized"; return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 }); }
}
