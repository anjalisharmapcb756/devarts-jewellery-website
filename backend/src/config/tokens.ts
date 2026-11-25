import jwt from "jsonwebtoken";
import type { AdminRole } from "../models/AdminUser.js";
import { env } from "./env.js";

/**
 * Customer and admin tokens are deliberately separate token classes: different
 * secrets, audiences and typ claims. A token signed for one class is rejected
 * by the other middleware even if a secret were ever leaked into the wrong
 * place.
 */
export const JWT_ISSUER = "vara-backend";

export const CUSTOMER_TOKEN = {
  typ: "customer",
  audience: "vara-customer",
} as const;

export const ADMIN_TOKEN = {
  typ: "admin",
  audience: "vara-admin",
} as const;

export type CustomerTokenPayload = {
  sub: string;
  email: string;
  role: "customer" | "admin";
  name?: string;
  typ: typeof CUSTOMER_TOKEN.typ;
};

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: AdminRole;
  typ: typeof ADMIN_TOKEN.typ;
};

function verifyClaims(token: string, secret: string, typ: string, audience: string): jwt.JwtPayload {
  const payload = jwt.verify(token, secret, {
    algorithms: ["HS256"],
    audience,
    issuer: JWT_ISSUER,
  });
  if (typeof payload !== "object" || payload === null || payload.typ !== typ || typeof payload.sub !== "string") {
    throw new Error("Unexpected token claims");
  }
  return payload;
}

export function signCustomerToken(user: { _id: unknown; email: string; role: string; fullName?: string }): string {
  const options: jwt.SignOptions = {
    expiresIn: "7d",
    audience: CUSTOMER_TOKEN.audience,
    issuer: JWT_ISSUER,
    subject: String(user._id),
  };
  return jwt.sign(
    {
      typ: CUSTOMER_TOKEN.typ,
      email: user.email,
      role: user.role === "admin" ? "admin" : "customer",
      name: user.fullName || "",
    },
    env.AUTH_SECRET,
    options,
  );
}

export function verifyCustomerToken(token: string): CustomerTokenPayload {
  const payload = verifyClaims(token, env.AUTH_SECRET, CUSTOMER_TOKEN.typ, CUSTOMER_TOKEN.audience);
  if (
    typeof payload.email !== "string" ||
    (payload.role !== "customer" && payload.role !== "admin")
  ) {
    throw new Error("Unexpected customer token claims");
  }
  return {
    sub: payload.sub as string,
    email: payload.email,
    role: payload.role,
    ...(typeof payload.name === "string" ? { name: payload.name } : {}),
    typ: CUSTOMER_TOKEN.typ,
  };
}

export function signAdminToken(user: { _id: unknown; email: string; role: string }): string {
  const options: jwt.SignOptions = {
    expiresIn: "8h",
    audience: ADMIN_TOKEN.audience,
    issuer: JWT_ISSUER,
    subject: String(user._id),
  };
  return jwt.sign(
    { typ: ADMIN_TOKEN.typ, email: user.email, role: user.role },
    env.ADMIN_JWT_SECRET,
    options,
  );
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const payload = verifyClaims(token, env.ADMIN_JWT_SECRET, ADMIN_TOKEN.typ, ADMIN_TOKEN.audience);
  if (typeof payload.email !== "string" || payload.role !== "super_admin") {
    throw new Error("Unexpected admin token claims");
  }
  return {
    sub: payload.sub as string,
    email: payload.email,
    role: payload.role,
    typ: ADMIN_TOKEN.typ,
  };
}
