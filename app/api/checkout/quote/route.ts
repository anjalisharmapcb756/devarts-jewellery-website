import { NextResponse } from "next/server";
import { calculateCheckoutQuote } from "@/lib/checkout/server";

export async function POST(request: Request) {
  try {
    const { items, couponCode } = await request.json();
    const quote = await calculateCheckoutQuote(items ?? [], couponCode);
    return NextResponse.json({ quote });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unable to calculate quote." }, { status: 400 });
  }
}