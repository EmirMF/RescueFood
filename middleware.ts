import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply CSRF protection to API routes (except auth endpoints for now)
  if (pathname.startsWith("/api/")) {
    const method = request.method;

    // Only check for state-changing methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      // Skip CSRF check for auth endpoints (they use rate limiting instead)
      const skipCsrf = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/logout",
      ].some((path) => pathname === path);

      if (!skipCsrf) {
        const csrfHeader = request.headers.get("x-rescuefood-csrf");
        
        if (csrfHeader !== "rescuefood-client") {
          return NextResponse.json(
            { error: "CSRF token missing or invalid" },
            { status: 403 }
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
