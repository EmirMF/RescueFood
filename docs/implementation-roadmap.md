# RescueFood Implementation Roadmap

Saved on: 2026-05-30

This roadmap converts the PRD and Stitch design into an implementation sequence. It is intentionally staged so the app can become useful early without trying to build the whole PRD at once.

## Source References

- Local PRD: `prd.md`
- Stitch design snapshot: `docs/stitch-foodrescue-design.md`
- Stitch project: `projects/16542042341135730384`
- Local app: Next.js 16, React 19, Tailwind CSS 4

## Product Strategy

Build the core marketplace loop first:

1. Merchant publishes surplus food.
2. Customer or charity discovers available food.
3. Customer orders or charity claims.
4. Merchant validates pickup.
5. Platform records impact.

Everything else should support that loop, not distract from it.

## Phase 0: App Foundation

Goal: prepare the app for RescueFood UI without building business logic yet.

Scope:

- Replace default app metadata with RescueFood metadata.
- Add RescueFood design tokens from Stitch.
- Configure Manrope and DM Sans fonts.
- Create base layout conventions for page shell, cards, buttons, chips, and responsive spacing.
- Prepare mock data types for listings, merchants, orders, impact stats, and user roles.

Primary files likely touched:

- `app/layout.tsx`
- `app/globals.css`
- `lib/mock-data.ts`
- `lib/types.ts`
- `components/*`

Done when:

- Default Next.js starter styling is removed.
- The app has a reusable visual foundation matching Stitch.
- No route depends on a real backend yet.

## Phase 1: Marketplace MVP

Goal: implement the first useful public experience.

Routes:

- `/`
- `/listings/[id]`

Stitch screens:

- Marketplace - RescueFood (New Style)
- Marketplace - RescueFood (Compact Style)
- Listing Detail - RescueFood (New Style)
- Listing Detail - RescueFood (Mobile New Style)

Components:

- Marketplace header
- Search/filter toolbar
- Food listing card
- Status chip
- Impact metric
- Listing detail hero
- Merchant summary panel
- Pickup information panel
- Order/claim CTA panel
- Mobile bottom navigation

Initial data behavior:

- Use mock listings.
- Filter by category, listing type, status, and search query on the client.
- Hide expired and sold-out listings in the default marketplace view.
- Detail page reads from mock listing ID.

Done when:

- A user can browse listings.
- A user can open a listing detail page.
- Mobile and desktop layouts are both covered.
- UI is polished enough for a demo even before auth/backend exists.

## Phase 2: Auth And Role Shell

Goal: model user roles and navigation access without full production auth yet.

Routes:

- `/auth`
- optional `/profile`

Stitch screens:

- Auth - RescueFood (New Style)
- Auth - RescueFood (Mobile)
- Profile & History screens

Components:

- Auth form shell
- Role selector
- User profile summary
- Transaction/history list

Initial data behavior:

- Use local mock session or client state.
- Support roles: Customer, Merchant, Charity, Admin.
- Route navigation should reflect the selected role.

Done when:

- Demo users can switch/login as a role.
- Marketplace CTAs can branch between order, claim, merchant, and admin flows.

## Phase 3: Merchant Flow

Goal: support the merchant side of the core loop.

Routes:

- `/merchant`
- `/merchant/listings/new`
- `/merchant/orders/[id]`

Stitch screens:

- Merchant Dashboard - RescueFood (New Style)
- Merchant Dashboard - RescueFood (Mobile New Style)
- Create Food Listing - RescueFood (Merchant)
- Create Food Listing - RescueFood (Merchant Mobile)
- Order Detail - RescueFood (Merchant)
- Order Detail - RescueFood (Merchant Mobile)
- Pickup Code - RescueFood (Mobile New Style)

Components:

- Merchant dashboard stats
- Listing management table/list
- Create listing form
- Order queue
- Pickup validation panel
- Pickup code display

Initial data behavior:

- Create listing can append to mock state or local storage.
- Order status can transition through Pending, Confirmed, Ready for Pickup, Completed, Cancelled.
- Pickup validation can use a simple static code for MVP.

Done when:

- Merchant can create a listing in the UI.
- Merchant can see orders.
- Merchant can simulate confirming and completing pickup.

## Phase 4: Charity And Donation Flow

Goal: make donation-specific discovery and claim behavior explicit.

Routes:

- `/charity`
- `/charity/claims`

Stitch screens:

- Charity Marketplace - RescueFood (New Style)
- Charity Marketplace - RescueFood (Mobile)

Components:

- Donation listing card variant
- Claim request panel
- Charity history list
- Donation impact summary

Initial data behavior:

- Filter marketplace to donation listings.
- Charity can create mock claim requests.
- Claim status can transition Pending, Approved, Rejected, Completed.

Done when:

- Charity can browse donation listings.
- Charity can submit and track a claim in demo state.

## Phase 5: Admin And Trust

Goal: implement basic platform governance.

Routes:

- `/admin/verification`
- optional `/admin`

Stitch screens:

- Admin Verification - RescueFood (New Style)
- Admin Verification - RescueFood (Mobile)

Components:

- Verification queue
- Merchant/charity verification detail
- Listing moderation list
- Basic transaction monitor

Initial data behavior:

- Use mock pending merchants and charities.
- Admin can approve/reject in client state.
- Admin can mark a listing inactive.

Done when:

- The demo can show platform trust and governance.
- Merchant verification is represented in the UI flow.

## Phase 6: Impact And Reporting

Goal: show RescueFood's product value through impact metrics.

Routes:

- `/impact`

Stitch screens:

- Impact Report - RescueFood (New Style)
- Impact Report - RescueFood (Mobile)

Components:

- Impact summary cards
- Meals rescued metric
- Estimated waste reduced metric
- Merchant contribution chart/list
- Donation impact section

Initial data behavior:

- Calculate totals from mock completed orders and claims.
- Keep charts simple unless a charting dependency is already justified.

Done when:

- Users can see credible impact summaries.
- Merchant/platform value proposition is visible.

## Backend Timing

Do not build full backend first. Use typed mock data through the UI phases, then replace mock services route by route.

Recommended backend order:

1. Data model and persistence for users, merchants, listings.
2. Listing APIs.
3. Order and donation claim APIs.
4. Auth/session and role-based access.
5. Admin verification and moderation APIs.
6. Review and impact reporting APIs.

This avoids locking the backend schema before the UI flows reveal what data the product actually needs.

## Suggested Route Map

| Route | Purpose | Phase |
| --- | --- | --- |
| `/` | Marketplace | 1 |
| `/listings/[id]` | Listing detail | 1 |
| `/auth` | Login/register | 2 |
| `/profile` | Profile and history | 2 |
| `/merchant` | Merchant dashboard | 3 |
| `/merchant/listings/new` | Create listing | 3 |
| `/merchant/orders/[id]` | Merchant order detail | 3 |
| `/charity` | Donation marketplace | 4 |
| `/charity/claims` | Charity claim history | 4 |
| `/admin/verification` | Verification and governance | 5 |
| `/impact` | Impact report | 6 |

## First Implementation Sprint

Recommended first sprint:

1. Add theme tokens and fonts.
2. Create shared mock data and TypeScript types.
3. Build marketplace page.
4. Build listing detail page.
5. Verify desktop and mobile layout.

Do not start with auth, admin, database, or payment. Those are important, but they are not the fastest path to a working RescueFood experience.

