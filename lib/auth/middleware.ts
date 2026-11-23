import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "vara-session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.MONGODB_URI;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing AUTH_SECRET (or MONGODB_URI fallback) in production.");
  }
  return "dev-secret-change-me";
}

const secret = new TextEncoder().encode(getAuthSecret());

async function getSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return payload as any; } catch { return null; }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const session = await getSession(request);

  const protectedPaths = ["/account", "/checkout", "/order-confirmation"];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
