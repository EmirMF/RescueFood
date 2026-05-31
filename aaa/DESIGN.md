---
name: Botanical Harvest
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3f493f'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d30'
  primary: '#00652c'
  on-primary: '#ffffff'
  primary-container: '#15803d'
  on-primary-container: '#d3ffd5'
  inverse-primary: '#79db8d'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#4e5a53'
  on-tertiary: '#ffffff'
  tertiary-container: '#66726b'
  on-tertiary-container: '#eaf7ee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f8a7'
  primary-fixed-dim: '#79db8d'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  margin-desktop: 64px
  margin-mobile: 20px
  gutter: 24px
  section-gap: 80px
  component-padding: 1.5rem
---

## Brand & Style
The design system is rooted in the concepts of freshness, sustainability, and community vitality. It employs a **Modern Corporate** aesthetic with a strong emphasis on organic soft-minimalism. The visual language aims to evoke a sense of trust, health, and environmental consciousness. 

Key visual hallmarks include high-clarity layouts, generous white space, and a refined use of depth through soft shadows and layered surfaces. The emotional response is intended to be calm yet motivating—encouraging users to participate in a circular economy of food and wellness.

## Colors
The palette is inspired by lush botanical environments. 
- **Primary Green (#15803d):** Used for primary actions, branding elements, and key status indicators.
- **Surface & Backgrounds:** The core background uses a light mint green (#f0fdf4) to provide a soft, non-clinical feel. Pure white (#ffffff) is reserved for elevated cards and content containers to ensure maximum readability and a "clean" finish.
- **Neutrals:** A deep charcoal-gray (#1f2937) is used for body text to maintain high contrast while avoiding the harshness of pure black.

## Typography
Manrope is utilized throughout the design system to provide a balanced, contemporary feel that bridges the gap between geometric and humanist styles. 

The hierarchy is defined by tight tracking on large headlines to create impact, while body and label text utilize increased letter spacing to ensure breathability and legibility. Headlines should use "tight" kerning, whereas interactive labels (buttons, chips) should use "wide" or "uppercase" styling where appropriate to denote hierarchy.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop, centered within the viewport to maintain focus and premium feel. 

- **Desktop (1440px+):** 12-column grid with 64px outer margins and 24px gutters.
- **Tablet (768px - 1024px):** 8-column grid with 32px margins.
- **Mobile (below 768px):** 4-column grid with 20px margins.

Spacing is governed by an 8px rhythmic scale. A "Wide-Margin" philosophy is applied to avoid visual clutter; vertical section gaps should be generous (80px+) to allow the content to breathe.

## Elevation & Depth
This design system utilizes **Ambient Shadows** and **Tonal Layers** to create a sense of organized depth.

- **Level 0 (Background):** The Mint Green (#f0fdf4) canvas.
- **Level 1 (Cards/Surfaces):** White surfaces with a soft, diffused shadow (0px 10px 30px rgba(0, 0, 0, 0.04)).
- **Level 2 (Interactive/Floating):** Higher elevation for active states or modals, using a more pronounced but still light shadow (0px 20px 40px rgba(21, 128, 61, 0.08)) to introduce a primary color tint into the shadow.
- **Level 3 (Overlays):** Semi-transparent blurs (Backdrop Blur: 12px) for navigation bars or contextual menus.

## Shapes
Shapes are defined by organic, approachable curves. The default radius for standard components (Inputs, Small Cards) is **0.5rem (8px)**. Larger content containers and cards use **rounded-lg (16px)** or **rounded-xl (24px)** to emphasize the soft, welcoming nature of the brand. Interactive elements like buttons and category chips default to a **Pill** shape (full radius) to differentiate them from static content containers.

## Components
- **Buttons:** Primary buttons are pill-shaped with a solid #15803d fill and white text. Secondary buttons use a primary-colored border with a transparent or white background.
- **Cards:** Large surfaces (16px-24px radius) with pure white backgrounds and the defined Level 1 ambient shadow. Content inside should have at least 24px of internal padding.
- **Category Chips:** Pill-shaped, using a very light tint of the primary color or a subtle border, featuring a small icon and label.
- **Input Fields:** Large, 12px rounded corners, with a light gray border that transitions to the primary green on focus.
- **Iconography:** Use thin-stroke (1.5pt) line icons. Icons should be monochrome—either the primary green for emphasis or a medium gray for utility.
- **Progress Indicators:** Use soft, rounded bars. Completed states should use the primary green, while empty tracks use a 10% opacity version of the primary color.