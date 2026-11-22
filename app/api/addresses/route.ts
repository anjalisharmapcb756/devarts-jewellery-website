import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CustomerAddress } from "@/lib/models/Order";
import { getSession } from "@/lib/auth/session";

function map(a: any) { return { id: String(a._id), label: a.label || "Home", name: a.full_name || "", line1: a.line1 || "", line2: a.line2 || "", city: a.city || "", state: a.state || "", postalCode: a.postal_code || "", phone: a.phone || "", isDefault: !!a.is_default }; }

export async function GET() {
  const s = await getSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const items = await CustomerAddress.find({ user_id: s.sub }).sort({ is_default: -1, createdAt: -1 }).lean();
  return NextResponse.json({ addresses: items.map(map) });
}

export async function POST(req: Request) {
  const s = await getSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const { id, label, name, line1, line2, city, state, postalCode, phone, isDefault } = b || {};
  if (!name || !line1 || !city || !state || !postalCode || !phone) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  await connectDB();
  if (isDefault) await CustomerAddress.updateMany({ user_id: s.sub }, { is_default: false });
  const payload = { user_id: s.sub, label: label || "Home", full_name: name, phone, line1, line2: line2 || "", city, state, postal_code: postalCode, country: "India", is_default: !!isDefault };
  let doc;
  if (id) doc = await CustomerAddress.findOneAndUpdate({ _id: id, user_id: s.sub }, payload, { new: true });
  else doc = await CustomerAddress.create(payload);
  return NextResponse.json({ address: map(doc) });
}

export async function DELETE(req: Request) {
  const s = await getSession(); if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url); const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await connectDB();
  await CustomerAddress.deleteOne({ _id: id, user_id: s.sub });
  return NextResponse.json({ ok: true });
}
