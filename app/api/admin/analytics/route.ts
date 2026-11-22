import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetOrders, mongoGetProducts } from "@/lib/admin/mongo-store";

function monthLabel(d: Date) { return d.toLocaleString("en-US", { month: "short" }); }

export async function GET() {
  try {
    await assertAdmin();
    let orders: any[] = []; let products: any[] = [];
    if (isMongoConfigured()) { [orders, products] = await Promise.all([mongoGetOrders("", ""), mongoGetProducts("")]); }
    else { const d = readDemoDB(); orders = d.orders; products = d.products; }
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_inr ?? 0), 0);
    const now = new Date();
    const monthly: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); monthly.push({ label: monthLabel(dt), value: 0 }); }
    for (const o of orders) { const dt = new Date(o.placed_at || o.createdAt || Date.now()); const bucket = monthly.find((b) => b.label === monthLabel(dt)); if (bucket) bucket.value += Number(o.total_inr ?? 0); }
    const byStatus = orders.reduce((acc: Record<string, number>, o) => { const k = String(o.status || "unknown"); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const byPayment = orders.reduce((acc: Record<string, number>, o) => { const k = String(o.payment_status || "unknown"); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    return NextResponse.json({ totalRevenue, totalOrders: orders.length, totalProducts: products.length, monthly, byStatus, byPayment });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 });
  }
}
