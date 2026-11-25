import { connection } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Subscriber } from "@/lib/models/Subscriber";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  await connection();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body.", code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  const email = String((body as { email?: unknown } | null)?.email ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: { message: "Enter a valid email address.", code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  try {
    await connectDB();
    await Subscriber.updateOne(
      { email },
      { $setOnInsert: { email, source: "newsletter" } },
      { upsert: true, runValidators: true },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: { message: "Unable to subscribe right now. Please try again.", code: "SUBSCRIPTION_FAILED" } },
      { status: 503 },
    );
  }
}
