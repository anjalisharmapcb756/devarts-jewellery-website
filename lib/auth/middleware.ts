import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "vara-session";
const TOKEN_ISSUER = "vara-root";
const TOKEN_AUDIENCE = "vara-root-app";
const TOKEN_TYPE = "vara-session";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("Missing or invalid AUTH_SECRET. Set a secret of at least 16 characters.");
  }
  return new TextEncoder().encode(secret);
}

type RootSession = { role?: string; typ?: string };

async function getSession(req: NextRequest): Promise<RootSession | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    if (payload.typ !== TOKEN_TYPE) return null;
    return payload as RootSession;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  let session: RootSession | null = null;

  try {
    session = await getSession(request);
  } catch {
    // Misconfiguration is surfaced by route handlers; middleware fails closed.
  }

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
