import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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

export type SessionPayload = { sub: string; email: string; role: "customer" | "admin"; name?: string };

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload, typ: TOKEN_TYPE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    if (payload.typ !== TOKEN_TYPE) return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export { COOKIE as SESSION_COOKIE };
