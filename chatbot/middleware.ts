import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'",
};

export function middleware(_req: NextRequest) {
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.delete("server");
  response.headers.delete("x-powered-by");
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
