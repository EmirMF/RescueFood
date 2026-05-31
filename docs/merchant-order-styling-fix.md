# Merchant Order Detail - Styling Troubleshooting

## Problem
UI merchant order detail terlihat seperti wireframe tanpa styling (warna, font, spacing tidak muncul).

## Root Cause
Kemungkinan penyebab:
1. Browser cache masih menyimpan CSS lama
2. Dev server perlu restart untuk load CSS baru
3. Tailwind tidak mengenali custom Stitch classes

## Solution

### 1. Hard Refresh Browser
```
Chrome/Edge: Ctrl + Shift + R (Windows/Linux) atau Cmd + Shift + R (Mac)
Firefox: Ctrl + F5 (Windows/Linux) atau Cmd + Shift + R (Mac)
Safari: Cmd + Option + R
```

### 2. Clear Browser Cache
```
Chrome DevTools:
1. F12 → Network tab
2. Check "Disable cache"
3. Refresh page

Or:
1. F12 → Application tab
2. Clear storage → Clear site data
```

### 3. Restart Dev Server
```bash
# Kill existing server
pkill -f "next dev"

# Clean build cache
rm -rf .next

# Start fresh
pnpm dev
```

### 4. Verify CSS Classes
Check if Stitch classes are loaded:
```
DevTools → Elements → Select element
Check Computed styles for:
- font-headline-lg
- text-on-surface
- bg-surface-container-low
```

### 5. Check Network Tab
```
DevTools → Network → Filter: CSS
Look for: globals.css or app.css
Status should be: 200 OK
```

## Expected Styling

### Colors:
- Background: Light blue-ish (#f8f9ff)
- Cards: White with subtle shadows
- Primary buttons: Dark green (#15803d)
- Text: Dark gray (#121c2a)

### Typography:
- Headlines: Manrope 32px bold
- Body: Manrope 16px regular
- Labels: Manrope 14px semibold

### Layout:
- Two columns: 2/3 left, 1/3 right
- Max width: 1280px
- Padding: 64px desktop, 20px mobile

## Verification Checklist

- [ ] Browser hard refresh done
- [ ] Dev server restarted
- [ ] CSS file loads in Network tab
- [ ] Custom classes appear in DevTools
- [ ] Colors visible (not all gray/black)
- [ ] Fonts loaded (Manrope)
- [ ] Spacing correct (not cramped)
- [ ] Shadows visible on cards

## If Still Not Working

1. Check globals.css is imported in layout.tsx
2. Verify Tailwind v4 syntax: `@import "tailwindcss"`
3. Check postcss.config.mjs exists
4. Try incognito/private mode
5. Check console for CSS errors

## Quick Test
Open: http://localhost:3000/merchant/orders/[order-id]

Should see:
- Light blue background
- White cards with shadows
- Green buttons
- Proper spacing and typography
- Not wireframe/unstyled appearance
