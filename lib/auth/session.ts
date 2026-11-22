import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "vara-session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.MONGODB_URI || "dev-secret-change-me");

export type SessionPayload = { sub: string; email: string; role: "customer" | "admin"; name?: string };

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
}

export async function verifySessionToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload as unknown as SessionPayload; } catch { return null; }
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export { COOKIE as SESSION_COOKIE };
