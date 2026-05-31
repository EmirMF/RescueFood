# Stitch FoodRescue Design Snapshot

Saved on: 2026-05-30

This file stores the Stitch design reference for later UI implementation. It is documentation only; the Next.js app UI has not been implemented from this design yet.

## Project

- Title: FoodRescue
- Stitch project: `projects/16542042341135730384`
- Origin: `STITCH`
- Visibility: `PUBLIC`
- Project type: `TEXT_TO_UI_PRO`
- Device type: `DESKTOP`
- Created: `2026-05-30T06:16:33.575479Z`
- Last updated: `2026-05-30T08:26:57.798092Z`

## Design Direction

FoodRescue is a marketplace-style product for rescuing surplus food. The visual direction from Stitch is a professional sustainability marketplace: clean SaaS structure, high-trust food safety cues, marketplace cards, and clear impact metrics.

Core style:

- Light mode
- Sustainability green as the primary action color
- Safety orange as secondary/urgency color
- Modern rounded cards and controls
- Desktop and mobile screen coverage
- Dense but readable marketplace layouts

## Typography

- Headline font: `MANROPE`
- Body font: `DM_SANS`
- Label font: `DM_SANS`

Suggested implementation mapping:

- Use Manrope for headings, page titles, card titles, and hero/display text.
- Use DM Sans for body copy, metadata, labels, form controls, and navigation.

## Shape And Spacing

- Stitch roundness: `ROUND_EIGHT`
- Primary radius target: `8px`
- Larger marketplace cards can use `16px` where the design calls for larger surfaces.
- Base spacing follows a practical 4px/8px rhythm.

## Color Tokens

- `--rf-background`: `#fbf8ff`
- `--rf-surface`: `#fbf8ff`
- `--rf-surface-base`: `#FFFFFF`
- `--rf-surface-muted`: `#F4F4F5`
- `--rf-surface-container-lowest`: `#ffffff`
- `--rf-surface-container-low`: `#f4f2fd`
- `--rf-surface-container`: `#eeedf7`
- `--rf-surface-container-high`: `#e8e7f1`
- `--rf-surface-container-highest`: `#e3e1ec`
- `--rf-surface-variant`: `#e3e1ec`
- `--rf-on-surface`: `#1a1b22`
- `--rf-on-surface-variant`: `#3c4a42`
- `--rf-text-onyx`: `#0D0D12`
- `--rf-outline`: `#6c7a71`
- `--rf-outline-variant`: `#bbcabf`
- `--rf-primary`: `#006c49`
- `--rf-primary-container`: `#10b981`
- `--rf-primary-fixed`: `#6ffbbe`
- `--rf-primary-fixed-dim`: `#4edea3`
- `--rf-secondary`: `#9d4300`
- `--rf-secondary-container`: `#fd761a`
- `--rf-secondary-fixed`: `#ffdbca`
- `--rf-secondary-fixed-dim`: `#ffb690`
- `--rf-tertiary`: `#006591`
- `--rf-tertiary-container`: `#23acf1`
- `--rf-success-emerald`: `#059669`
- `--rf-warning-amber`: `#f59e0b`
- `--rf-error`: `#ba1a1a`
- `--rf-error-container`: `#ffdad6`

Primary overrides from Stitch:

- Primary: `#10b981`
- Secondary: `#f97316`
- Tertiary: `#0ea5e9`

## Screens

| Screen | Stitch resource | Size |
| --- | --- | --- |
| Marketplace - RescueFood (New Style) | `projects/16542042341135730384/screens/58465636d1b8471eb4741049a38a6ebf` | 2560 x 3996 |
| Marketplace - RescueFood (Compact Style) | `projects/16542042341135730384/screens/4081af749f9a430898b8b9d28fcb20b2` | 780 x 5266 |
| Listing Detail - RescueFood (New Style) | `projects/16542042341135730384/screens/b327e2f5b844462bb975c36e8cea6a92` | 2560 x 3320 |
| Listing Detail - RescueFood (Mobile New Style) | `projects/16542042341135730384/screens/70cce1e5f3bd4c0a84240059ddd9ee7b` | 780 x 2982 |
| Auth - RescueFood (New Style) | `projects/16542042341135730384/screens/1a0c6f68f9fd424ca0ade16c18c6f9fe` | 2560 x 2048 |
| Auth - RescueFood (Mobile) | `projects/16542042341135730384/screens/85ce14daef114ecc83bd678508dc6d7f` | 780 x 2250 |
| Merchant Dashboard - RescueFood (New Style) | `projects/16542042341135730384/screens/f714c00082fa47ec84cef96e57f28756` | 2560 x 2268 |
| Merchant Dashboard - RescueFood (Mobile New Style) | `projects/16542042341135730384/screens/bdf3c944e56d468c83c03ecaebfd436c` | 780 x 3146 |
| Create Food Listing - RescueFood (Merchant) | `projects/16542042341135730384/screens/4bb4bc112f53437680ec2e3dea337c63` | 2560 x 4698 |
| Create Food Listing - RescueFood (Merchant Mobile) | `projects/16542042341135730384/screens/8395c86bb934453384e216c5d776dc7b` | 780 x 2686 |
| Order Detail - RescueFood (Merchant) | `projects/16542042341135730384/screens/cf577394a1be4cc0aacdae84032707f3` | 2560 x 2336 |
| Order Detail - RescueFood (Merchant Mobile) | `projects/16542042341135730384/screens/8594c8174e25426fba6cf242b14430aa` | 780 x 2034 |
| Pickup Code - RescueFood (Mobile New Style) | `projects/16542042341135730384/screens/d345eecce3864286b480c80298d683bd` | 780 x 2062 |
| Charity Marketplace - RescueFood (New Style) | `projects/16542042341135730384/screens/7f3059051f154b198ecd28b18517159d` | 2560 x 2524 |
| Charity Marketplace - RescueFood (Mobile) | `projects/16542042341135730384/screens/c7a28468b46843249fad40e184a94656` | 780 x 2440 |
| Profile & History - RescueFood (New Style) | `projects/16542042341135730384/screens/ba0474e1a07f4ad69b11eaf92bfeb8b6` | 2560 x 2112 |
| Profile & History - RescueFood (Mobile) | `projects/16542042341135730384/screens/6b59fffb1a274fa7bd1402478754b988` | 780 x 2532 |
| Impact Report - RescueFood (New Style) | `projects/16542042341135730384/screens/07355ea8719242cdb597e4d3334860df` | 2560 x 2048 |
| Impact Report - RescueFood (Mobile) | `projects/16542042341135730384/screens/fea27a4ba9ec412983a5b7ecb73b1872` | 780 x 1768 |
| Admin Verification - RescueFood (New Style) | `projects/16542042341135730384/screens/ff5c7245981644beb415c6b3c403b0be` | 2560 x 2574 |
| Admin Verification - RescueFood (Mobile) | `projects/16542042341135730384/screens/e41619722b0348b188542dafa453d2b7` | 780 x 2214 |
| Product Requirements Document.md | `projects/16542042341135730384/screens/10190178865012313581` | 780 x 1768 |
| image.png | `projects/16542042341135730384/screens/8819772470982496828` | 1672 x 941 |

## Implementation Notes For Later

Do not treat this file as implementation. Use it as the source reference when UI work starts.

Recommended first pass:

1. Build the marketplace home page from the desktop and compact marketplace screens.
2. Add design tokens to `app/globals.css` or a dedicated theme layer.
3. Update `app/layout.tsx` metadata and fonts.
4. Create reusable components: header, mobile bottom nav, food listing card, status chip, impact metric, search/filter toolbar, and page shell.
5. Implement responsive behavior from the matching mobile screens instead of scaling down desktop layouts.

Suggested app route mapping:

- `/`: marketplace
- `/auth`: auth
- `/listings/[id]`: listing detail
- `/merchant`: merchant dashboard
- `/merchant/listings/new`: create food listing
- `/merchant/orders/[id]`: order detail
- `/pickup`: pickup code
- `/charity`: charity marketplace
- `/profile`: profile and history
- `/impact`: impact report
- `/admin/verification`: admin verification

