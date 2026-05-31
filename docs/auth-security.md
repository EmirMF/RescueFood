# Auth Security Implementation

## Overview

RescueFood now implements comprehensive authentication security measures including:
- Password policy enforcement
- Rate limiting
- CSRF protection
- Secure session management
- Environment validation

---

## 1. Password Policy

### Requirements
- **Minimum length**: 8 characters
- **Maximum length**: 128 characters (DoS prevention)
- **Complexity**:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&* etc)
- **Common password check**: Rejects commonly used passwords

### Implementation
**File**: `lib/password-validation.ts`

```typescript
import { validatePassword } from "@/lib/password-validation";

const result = validatePassword("MyP@ssw0rd");
if (!result.valid) {
  console.error(result.errors);
}
```

### Password Strength Indicator
```typescript
import { getPasswordStrength } from "@/lib/password-validation";

const strength = getPasswordStrength("MyP@ssw0rd");
// { score: 0-4, label: "Sangat Kuat", color: "#16a34a" }
```

---

## 2. Rate Limiting

### Limits
- **Login**: 5 attempts per 15 minutes per IP
- **Register**: 3 attempts per 1 hour per IP

### Implementation
**File**: `lib/rate-limit.ts`

In-memory rate limiter with automatic cleanup. Tracks by IP address.

### Response Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2026-05-31T13:15:00.000Z
```

### Error Response (429)
```json
{
  "error": "Terlalu banyak percobaan login. Coba lagi dalam 12 menit."
}
```

---

## 3. CSRF Protection

### Method
Custom header verification (`x-rescuefood-csrf: rescuefood-client`)

### Protected Routes
All API routes with state-changing methods (POST, PUT, PATCH, DELETE) except:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`

### Implementation
**Middleware**: `middleware.ts` (automatic)

**Client-side**: Use `secureFetch` helper

```typescript
import { secureFetch } from "@/lib/secure-fetch";

// Automatically adds CSRF header for POST/PUT/PATCH/DELETE
await secureFetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ listingId: "..." }),
});
```

---

## 4. Session Security

### Cookie Configuration
- **Name**: `__Host-rescuefood_session` (secure prefix)
- **HttpOnly**: `true` (prevents XSS)
- **SameSite**: `strict` (prevents CSRF)
- **Secure**: `true` in production (HTTPS only)
- **Max-Age**: 7 days
- **Path**: `/`

### Session Signing
HMAC-SHA256 with secret key from `AUTH_SECRET` environment variable.

### Environment Validation
**Production**: Fails to start if `AUTH_SECRET` is not set.

---

## 5. Additional Security Measures

### Generic Error Messages
Login errors don't reveal whether email exists:
- ❌ "Invalid email" / "Invalid password"
- ✅ "Email atau password salah"

### Account Status Check
Suspended accounts cannot login:
```
"Akun Anda telah ditangguhkan. Hubungi admin untuk informasi lebih lanjut."
```

### Bcrypt Rounds
Increased from 10 to 12 for stronger password hashing.

### Email Validation
Duplicate email check before registration:
```
"Email sudah terdaftar"
```

---

## 6. Environment Variables

### Required in Production
```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-random-secret-here"
NODE_ENV="production"
```

### Development
```bash
AUTH_SECRET="rescuefood-local-dev-secret"
NODE_ENV="development"
```

---

## 7. Migration Guide

### Update Client-Side Code

**Before:**
```typescript
await fetch("/api/orders", {
  method: "POST",
  body: JSON.stringify(data),
});
```

**After:**
```typescript
import { secureFetch } from "@/lib/secure-fetch";

await secureFetch("/api/orders", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### Or manually add header:
```typescript
await fetch("/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-rescuefood-csrf": "rescuefood-client",
  },
  body: JSON.stringify(data),
});
```

---

## 8. Testing

### Test Rate Limiting
```bash
# Try 6 login attempts rapidly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Test CSRF Protection
```bash
# Should fail with 403
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"listingId":"..."}'

# Should succeed
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-rescuefood-csrf: rescuefood-client" \
  -d '{"listingId":"..."}'
```

### Test Password Policy
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"test@example.com",
    "password":"weak",
    "role":"customer"
  }'
# Should fail with password requirements
```

---

## 9. Production Checklist

- [ ] Set strong `AUTH_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Configure proper CORS if using separate frontend
- [ ] Set up proper IP detection for rate limiting
- [ ] Consider Redis for distributed rate limiting
- [ ] Set up monitoring for failed login attempts
- [ ] Configure log aggregation for security events
- [ ] Set up alerts for rate limit violations
- [ ] Review and test all auth flows

---

## 10. Future Enhancements

### P1 (High Priority)
- [ ] Account lockout after N failed attempts
- [ ] Email verification on registration
- [ ] Password reset flow with email token
- [ ] Session revocation (logout all devices)
- [ ] Audit logging for security events

### P2 (Medium Priority)
- [ ] 2FA/MFA for merchant and admin
- [ ] OAuth providers (Google, Facebook)
- [ ] IP-based anomaly detection
- [ ] Device fingerprinting
- [ ] Suspicious activity alerts

### P3 (Low Priority)
- [ ] Password history (prevent reuse)
- [ ] Password expiry policy
- [ ] Login notification emails
- [ ] Trusted device management
- [ ] Biometric authentication support

---

## Security Contact

For security issues, please contact: security@rescuefood.local
