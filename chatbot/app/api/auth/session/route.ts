import { NextRequest } from "next/server";
import {
  genericFailure,
  genericResponse,
  GOSCRAPER_URL,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from "@/lib/server";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return true;
  }

  entry.count += 1;
  attempts.set(ip, entry);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return genericFailure(429);
  }

  try {
    const body = (await req.json()) as { a?: string; u?: string; p?: string; c?: string; d?: string };

    if (body.a === "logout") {
      const response = genericResponse(200);
      response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    const u = typeof body.u === "string" ? body.u.trim() : "";
    const p = typeof body.p === "string" ? body.p : "";

    if (!u || !p) {
      return genericFailure(401);
    }

    const loginPayload: Record<string, string> = {
      account: u,
      password: p,
    };

    if (typeof body.d === "string" && body.d.trim()) {
      loginPayload.cdigest = body.d.trim();
    }
    if (typeof body.c === "string" && body.c.trim()) {
      loginPayload.captcha = body.c.trim();
    }

    const res = await fetch(`${GOSCRAPER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginPayload),
      cache: "no-store",
    });

    if (!res.ok) {
      return genericFailure(401);
    }

    const data = (await res.json()) as { authenticated?: boolean; cookies?: string };
    if (!data?.authenticated || !data.cookies) {
      return genericFailure(401);
    }

    const sessionValue = signSessionToken(data.cookies);
    const response = genericResponse(200);
    response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });
    return response;
  } catch {
    return genericFailure(401);
  }
}
