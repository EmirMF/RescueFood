# Auth Cookie Fix

## Problem
After implementing auth hardening, users couldn't stay logged in. Session was not detected after login.

## Root Cause
Cookie name was changed to `__Host-rescuefood_session` which requires:
1. HTTPS connection (secure: true)
2. No domain attribute
3. Must be set from secure context

In development (localhost HTTP), `__Host-` prefix doesn't work.

## Solution
Use environment-aware cookie name:
- **Development**: `rescuefood_session` (works with HTTP)
- **Production**: `__Host-rescuefood_session` (secure prefix)

Also adjusted `sameSite`:
- **Development**: `lax` (allows cross-site navigation)
- **Production**: `strict` (maximum security)

## Code Changes
```typescript
// lib/auth.ts
export const authCookieName = 
  process.env.NODE_ENV === "production" 
    ? "__Host-rescuefood_session" 
    : "rescuefood_session";

cookieStore.set(authCookieName, encodeSession(userId), {
  httpOnly: true,
  sameSite: isProduction ? "strict" : "lax",
  secure: isProduction,
  path: "/",
  maxAge: maxAgeSeconds,
});
```

## Testing
1. Clear browser cookies
2. Login with test account
3. Verify session persists across page navigation
4. Check cookie in DevTools (Application > Cookies)

## Production Deployment
When deploying to production with HTTPS:
- Cookie will use `__Host-` prefix automatically
- `sameSite: strict` for CSRF protection
- `secure: true` for HTTPS-only transmission
