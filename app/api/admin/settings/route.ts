import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { DEFAULT_SETTINGS, readDemoDB, writeDemoDB } from "@/lib/admin/demo-store";
import { isMongoConfigured, mongoGetSettings, mongoUpsertSettings } from "@/lib/admin/mongo-store";

export async function GET() {
  try {
    await assertAdmin();
    if (isMongoConfigured()) return NextResponse.json(await mongoGetSettings());
    const db = readDemoDB();
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...(db.settings || {}) });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await assertAdmin();
    const body = await req.json().catch(() => ({}));
    const value = {
      storeName: String(body.storeName ?? DEFAULT_SETTINGS.storeName).slice(0, 120),
      supportEmail: String(body.supportEmail ?? DEFAULT_SETTINGS.supportEmail).slice(0, 120),
      supportPhone: String(body.supportPhone ?? DEFAULT_SETTINGS.supportPhone).slice(0, 60),
      announcement: String(body.announcement ?? DEFAULT_SETTINGS.announcement).slice(0, 240),
      freeShippingThreshold: String(body.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold).slice(0, 20),
    };
    if (isMongoConfigured()) return NextResponse.json(await mongoUpsertSettings(value));
    const db = readDemoDB();
    db.settings = value;
    writeDemoDB(db);
    return NextResponse.json(value);
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    return NextResponse.json({ error: msg }, { status: msg.toLowerCase().includes("unauthorized") ? 401 : 500 });
  }
}
