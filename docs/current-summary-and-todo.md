# RescueFood Current Summary And TODO

Last updated: 2026-05-31

## Current State

RescueFood is now a database-backed Next.js app for surplus food rescue. The core loop is implemented:

1. Merchant creates a surplus food listing.
2. Customer orders discounted food.
3. Stock is decremented in the database.
4. Merchant manages order lifecycle.
5. Customer receives a pickup QR/code.
6. Merchant validates pickup with QR scan or manual code fallback.
7. Impact metrics are aggregated from database activity.

The app is no longer only a mock UI. Most key flows now use Prisma, PostgreSQL, server-side route guards, signed session cookies, and API-backed mutations.

## Demo Accounts

All seed users use password `password123`.

| Role | Email |
| --- | --- |
| Customer | `customer@rescuefood.local` |
| Merchant | `merchant@rescuefood.local` |
| Admin | `admin@rescuefood.local` |

## Completed Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 0: App Foundation | Done | Metadata, fonts, design tokens, Prisma schema, seed data |
| Phase 1: Marketplace MVP | Done | Home marketplace, listing detail, search/filter, database listings |
| Phase 2: Auth And Role Shell | Done | Manual email/password login, signed cookie session, server route guards |
| Phase 3: Merchant Flow | Done | Dashboard, listing create/edit, image upload, order lifecycle, pickup validation |
| Phase 4: Charity Flow | Hidden | Charity web surfaces are disabled; backend/schema retained for now |
| Phase 5: Admin Trust Flow | Done | Merchant verification approve/reject |
| Phase 6: Impact Report | Done | Database-backed impact metrics and contribution list |

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketplace home with database listings and role-aware CTA |
| `/auth` | Manual login |
| `/profile` | Role-aware profile and transaction history |
| `/listings/[id]` | Listing detail and order CTA |
| `/orders/[id]` | Customer order detail with pickup QR |
| `/merchant` | Merchant dashboard |
| `/merchant/listings/new` | Create listing |
| `/merchant/listings/[id]/edit` | Edit listing |
| `/merchant/orders/[id]` | Merchant pickup validation |
| `/admin/verification` | Admin verification queue |
| `/impact` | Database-backed impact report |

## Implemented APIs

| API | Purpose |
| --- | --- |
| `/api/auth/register` | Register user |
| `/api/auth/login` | Login and set signed session cookie |
| `/api/auth/me` | Read current session |
| `/api/auth/logout` | Clear session |
| `/api/listings` | List/create food listings |
| `/api/listings/[id]` | Read/update/soft-remove listing |
| `/api/uploads` | Local listing image upload |
| `/api/orders` | Customer order creation with stock decrement |
| `/api/orders/[id]` | Merchant order status update |
| `/api/admin/verification/[type]/[id]` | Admin verification status update |

Note: donation claim APIs and Prisma charity models still exist in the codebase for backward compatibility, but charity is not exposed in the web UI.

## QR Pickup Flow

Customer side:

1. Customer logs in.
2. Customer opens a listing and creates an order.
3. Backend creates an order with a unique `pickupCode`.
4. Customer opens `/orders/[id]`.
5. Page displays the pickup code and a scannable QR generated from that code.

Merchant side:

1. Merchant opens order detail from `/merchant`.
2. Merchant clicks `Scan QR`.
3. Browser camera scans the customer QR when `BarcodeDetector` is supported.
4. If the scanned code matches the order pickup code, the complete button becomes active.
5. Merchant marks the pickup as completed through `/api/orders/[id]`.
6. Manual code input remains available when camera or QR detection is unavailable.

## Current Technical Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- PostgreSQL database
- Signed HTTP-only session cookie
- `qrcode` for QR generation
- Native browser `BarcodeDetector` for QR scanning when supported
- Midtrans sandbox payment integration

## Verification Commands

Run these before handoff or commit:

```bash
pnpm lint
pnpm build
pnpm test:api
```

Current known result as of 2026-05-31: `pnpm lint`, `pnpm build`, and `pnpm exec prisma generate` pass. `pnpm exec prisma db push` needs a running PostgreSQL server matching `DATABASE_URL`; it currently cannot connect to `localhost:5432` in this workspace.

## Known Limits

- Auth is still local/manual and not hardened for production security.
- PostgreSQL is now the target database. Local development needs a running PostgreSQL instance that matches `DATABASE_URL`.
- Image upload currently writes to `public/uploads`; production should use object storage.
- QR scanner depends on browser support for `BarcodeDetector`; manual input is the fallback.
- Charity/donation web flow is hidden. Do not build against it unless product scope changes.
- Payment uses Midtrans sandbox and still needs full webhook/redirect hardening before production.
- Notifications are not implemented.
- Audit logs are not implemented.
- UI follows the Stitch design direction but has not had a final pixel/fidelity QA pass.
- No full browser e2e test suite yet.

## TODO Priority

### Immediate UI/Product TODO

- [x] Implement `/profile` to match Stitch pixel-perfect on desktop and mobile.
- [x] Fix admin verification logic flow so the queue, status transitions, and UI states are correct.
- [ ] Add review and rating submission after an order is completed.
- [ ] Add message/chat with merchant from the customer order page.
- [ ] Clean up navbar UI/UX: remove redundant actions, improve role-aware dashboard/profile behavior, and tighten responsive states.
- [x] Switch Prisma runtime config from SQLite to PostgreSQL.

### P0: Production Readiness Foundation

- [x] Move runtime database config from SQLite to PostgreSQL: Prisma datasource, adapter, env config, and dependency cleanup.
- [x] Provision PostgreSQL for the current development database and run schema sync against it.
- [x] Seed the database with several customers, merchants, admin users, verified/pending merchants, food listings, and realistic order examples.
- [ ] Add environment-specific config for database URL, session secret, upload storage, and app URL.
- [ ] Harden auth: password policy, session expiry, CSRF strategy for mutations, rate limiting, and secure cookie settings per environment.
- [ ] Add ownership and status-transition validation rules for orders and listings.
- [ ] Add structured error logging for API routes.

### P1: Core Product Completeness

- [ ] Add real notification flow for order confirmation, ready for pickup, and completed pickup.
- [ ] Add merchant inventory/audit history for listing stock changes.
- [ ] Add customer order history detail actions, including cancel rules when still allowed.
- [ ] Add admin moderation for suspicious listings and transaction review.

### P2: Storage And Media

- [ ] Replace local `public/uploads` storage with cloud object storage.
- [ ] Validate image size, file type, and upload limits more strictly.
- [ ] Add image deletion or cleanup when listings are removed or replaced.
- [ ] Add placeholder/fallback image behavior for failed uploaded images.

### P3: Testing And Quality

- [ ] Add Playwright e2e tests for login, order, pickup QR, merchant listing, and admin verification.
- [ ] Add component tests for role-aware CTA behavior.
- [ ] Add API tests for invalid status transitions and unauthorized ownership access.
- [ ] Add visual QA pass against Stitch references on desktop and mobile.
- [ ] Add accessibility pass for forms, scanner states, keyboard focus, and color contrast.

### P4: Deployment And Collaboration

- [ ] Initialize or clean up Git repository if not already done.
- [ ] Create first stable commit after passing verification.
- [ ] Push to GitHub and protect the main branch.
- [ ] Add `.env.example` review for all required variables.
- [ ] Add setup instructions for collaborators.
- [ ] Add PR checklist requiring lint, build, tests, and seed verification.

### P5: Future Product Features

- [ ] Add maps/distance calculation for pickup locations.
- [ ] Add review/rating submission after completed pickup.
- [ ] Add merchant payout/reporting flow.
- [ ] Add advanced impact reports by date range, merchant, and category.
- [ ] Add progressive web app support for mobile pickup workflows.
