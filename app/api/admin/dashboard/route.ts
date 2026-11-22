import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCustomers, mongoGetOrders, mongoGetProducts } from "@/lib/admin/mongo-store";

export async function GET() {
  try {
    await assertAdmin();
    if (isMongoConfigured()) {
      const [orders, products, customers] = await Promise.all([mongoGetOrders("", ""), mongoGetProducts(""), mongoGetCustomers("")]);
      const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_inr ?? 0), 0);
      return NextResponse.json({ totalRevenue, totalOrders: orders.length, totalCustomers: customers.length, totalProducts: products.length, recentOrders: orders.slice(0, 10) });
    }
    const d = readDemoDB();
    const totalRevenue = d.orders.reduce((s, o) => s + Number(o.total_inr ?? 0), 0);
    return NextResponse.json({ totalRevenue, totalOrders: d.orders.length, totalCustomers: d.customers.length, totalProducts: d.products.length, recentOrders: [...d.orders].sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at)).slice(0, 10) });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 });
  }
}
