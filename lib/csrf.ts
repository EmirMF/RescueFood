import { NextResponse } from "next/server";

/**
 * CSRF Protection using custom header verification
 * 
 * For state-changing operations (POST, PUT, PATCH, DELETE),
 * we require a custom header to be present. This prevents
 * simple form-based CSRF attacks since browsers don't allow
 * custom headers in cross-origin requests without CORS.
 */

const CSRF_HEADER = "x-rescuefood-csrf";
const CSRF_HEADER_VALUE = "rescuefood-client";

export function verifyCsrfToken(request: Request): boolean {
  const method = request.method;

  // Only check for state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return true;
  }

  // Check if custom header is present with correct value
  const csrfHeader = request.headers.get(CSRF_HEADER);
  return csrfHeader === CSRF_HEADER_VALUE;
}

export function csrfProtection(request: Request): NextResponse | null {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { error: "CSRF token missing or invalid" },
      { status: 403 }
    );
  }

  return null;
}

export const CSRF_HEADERS = {
  [CSRF_HEADER]: CSRF_HEADER_VALUE,
};
