# RescueFood Prototype Status

Last updated: 2026-05-31

## Completed Prototype Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 0: App Foundation | Done | Metadata, fonts, design tokens, Prisma schema, seed data |
| Phase 1: Marketplace MVP | Done | Marketplace, listing detail, search/filter, database listing support |
| Phase 2: Auth And Role Shell | Done | Manual login, role-aware profile and CTA behavior, signed cookie session |
| Phase 3: Merchant Flow | Done | Dashboard, create listing, listing lifecycle controls, pickup validation, database-backed flow |
| Phase 4: Charity Flow | Done | Donation marketplace, claim flow, claim history |
| Phase 5: Admin Trust Flow | Done | Verification queue, approve/reject, trust summary |
| Phase 6: Impact Report | Done | Impact metrics, contribution list, report narrative |

## Current Flow Coverage

- Customer can browse marketplace, filter listings, open details, and create database-backed orders from the listing CTA with stock decrementing.
- Manual email/password login calls the local login API for seeded users, sets an HTTP-only signed session cookie, and mirrors role state client-side for current UI behavior.
- Merchant can create and edit listings with local image uploads, manage listing and order lifecycle from the dashboard, see them in dashboard and marketplace, and validate pickup with QR scan or manual code fallback.
- Charity can claim donation listings through the API with stock decrementing and see claim history in charity/profile views; merchants can approve, reject, or complete claims.
- Admin can approve/reject verification targets through the API and see updated trust metrics.
- Impact page aggregates database-backed listings, orders, claims, and verified merchants.
- Backend foundation exists with Prisma + PostgreSQL, seed data, auth API, upload API, listings lifecycle API, orders lifecycle API, donation claims lifecycle API, and admin verification API.
- Marketplace home and listing detail read active listings from the local database.

## Known Limits

- Backend is wired to the UI for listing read/create, signed login, customer order creation, charity donation claims, merchant order dashboard, pickup completion, profile history, impact aggregation, and admin verification.
- Auth uses signed HTTP-only session cookies. Merchant, charity, and admin pages now enforce shared server-side role redirects; production-grade auth hardening is still not implemented yet.
- Image upload currently stores files under `public/uploads`; cloud storage is not implemented yet.
- Listing edit and soft-remove exist; richer inventory audit history is not implemented yet.
- No real payment, notifications, or audit logs.
- Pickup QR is generated as a standard scannable QR from the pickup code, and merchant pickup validation can scan it with the browser camera when supported. Manual code input remains as fallback.
- UI follows Stitch direction, but full screen-by-screen Stitch fidelity is still a future pass.

## Recommended Next Work

1. Add visual QA and final Stitch fidelity pass after backend wiring stabilizes.
2. Add broader UI/e2e tests for role-gated workflows.
3. Prepare GitHub collaboration setup and first clean commit.
