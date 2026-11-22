import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { readDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetCategories } from "@/lib/admin/mongo-store";

export async function GET() {
  try { await assertAdmin(); if (isMongoConfigured()) return NextResponse.json(await mongoGetCategories()); return NextResponse.json(readDemoDB().categories); } catch (e: any) { const msg = e?.message || "Unauthorized"; return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 }); }
}
