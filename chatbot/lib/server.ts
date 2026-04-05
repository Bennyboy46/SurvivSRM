import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextResponse as NextResponseType } from "next/server";

const requiredEnvNames = ["GOSCRAPER_URL", "COOKIE_SECRET", "GROQ_API_KEY"] as const;

export function requireEnv(name: (typeof requiredEnvNames)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const GOSCRAPER_URL = requireEnv("GOSCRAPER_URL");
export const COOKIE_SECRET = requireEnv("COOKIE_SECRET");
export const GROQ_API_KEY = requireEnv("GROQ_API_KEY");

export const SESSION_COOKIE_NAME = "ss";

export type ApiErrorBody = { success?: false; r?: string };

export const API_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'",
  Pragma: "no-cache",
  Expires: "0",
};

export function withApiSecurityHeaders(response: NextResponseType) {
  Object.entries(API_SECURITY_HEADERS).forEach(([name, value]) => {
    response.headers.set(name, value);
  });
  response.headers.delete("server");
  response.headers.delete("x-powered-by");
  return response;
}

export function secureJson(body: unknown, init?: ResponseInit) {
  return withApiSecurityHeaders(NextResponse.json(body, init));
}

export function genericFailure(status = 500) {
  return secureJson({ success: false }, { status });
}

export function genericResponse(status = 200) {
  return secureJson({ success: true }, { status });
}

export function secureMessageResponse(message: string, status = 200) {
  return secureJson({ r: message }, { status });
}

export function normalizeBackendPayload<T>(value: unknown): T | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as T;
  }
  return value as T;
}

export async function fetchBackendJson(endpoint: string, token: string) {
  const res = await fetch(`${GOSCRAPER_URL}${endpoint}`, {
    headers: { "X-CSRF-Token": token },
    cache: "no-store",
  });

  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? await res.json() : null,
  };
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signSessionToken(token: string) {
  const payload = toBase64Url(token);
  const signature = createHmac("sha256", COOKIE_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(value?: string | null) {
  if (!value) return null;
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex <= 0) return null;

  const payload = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
  const expected = createHmac("sha256", COOKIE_SECRET).update(payload).digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    return fromBase64Url(payload);
  } catch {
    return null;
  }
}

export function cookieOptions(maxAge = 3600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge,
    path: "/",
  };
}
