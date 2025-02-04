import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  // Don't protect the login page itself or API routes
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for the auth cookie
  const authCookie = request.cookies.get("site-auth");
  const isAuthenticated = authCookie?.value === "sommerhus";

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login page
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|login|api).*)",
  ],
};
