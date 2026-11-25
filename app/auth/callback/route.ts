import { NextResponse } from "next/server";

function safeNextPath(value: string | null, origin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/account";
  }
  try {
    const target = new URL(value, origin);
    return target.origin === origin ? `${target.pathname}${target.search}${target.hash}` : "/account";
  } catch {
    return "/account";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}${safeNextPath(searchParams.get("next"), origin)}`);
}
