/**
 * Secure fetch wrapper that automatically includes CSRF headers
 * for state-changing requests
 */

const CSRF_HEADER = "x-rescuefood-csrf";
const CSRF_HEADER_VALUE = "rescuefood-client";

export async function secureFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const method = options?.method?.toUpperCase() || "GET";

  // Add CSRF header for state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const headers = new Headers(options?.headers);
    headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);

    return fetch(url, {
      ...options,
      headers,
    });
  }

  return fetch(url, options);
}
