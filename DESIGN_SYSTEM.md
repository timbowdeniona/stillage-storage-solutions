# Stillage Storage Solutions — Design System & Brand Tokens (`stillagestoragesolutions.co.uk`)

This document lists every colour token, font family, surface treatment, and product finish swatch used across the website so they can be easily reviewed and customized.

---

## 1. Colour Palette

### 1.1 Primary Brand & Structural Colours
Used for the main header, navigation bars, hero banner framing, and footer.

| Token Name | Current Hex | CSS Variable | Tailwind Class | Where It Is Used | Client Change / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Navy** | `#0F2342` | `--color-brand-navy` | `brand-navy` | Main header, hero background, footer, primary dark badges, table headers | |
| **Brand Navy Dark** | `#09172C` | `--color-brand-navy-dark` | `brand-navyDark` | Top utility bar, mobile drawer background, footer trust strip | |
| **Brand Navy Light** | `#18345E` | — | `brand-navyLight` | Category navigation bar, secondary button hover states | |

### 1.2 Interactive & Stillage Blue Accents
Matched to standard factory-painted **RAL 5010 Gentian / Stillage Blue**. Used for buttons, active configurator selections, and interactive links.

| Token Name | Current Hex | CSS Variable | Tailwind Class | Where It Is Used | Client Change / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stillage Blue** | `#145DA0` | `--color-stillage-blue` | `stillage-blue` | Primary CTA buttons ("Configure & Buy", "Buy Online Now"), active filter pills, selected configurator borders | |
| **Stillage Blue Dark** | `#0D447A` | `--color-stillage-blue-dark` | `stillage-blueDark` | Primary button hover state | |
| **Stillage Blue Light** | `#2176C7` | — | `stillage-blueLight` | Header search button hover, icon highlights on dark backgrounds | |

### 1.3 Surfaces & Product Backdrops
Used to frame cutout stillage photography so blue steel frames stand out.

| Token Name | Current Hex | CSS Variable | Tailwind Class | Where It Is Used | Client Change / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workshop Sand** | `#F2E3CE` | `--color-surface-sand` | `surface-sand` | Hero product showcase stage, product card hover background, high-contrast text accent on dark navy | |
| **Workshop Sand Light** | `#FAF5EE` | `--color-surface-sand-light` | `surface-sandLight` | Featured section background, search toolbar, spec table sub-headers, quote summary box | |
| **Workshop Sand Dark** | `#E5D0B1` | — | `surface-sandDark` | Border framing around the hero product stage | |
| **Studio White** | `#FFFFFF` | `--color-surface-white` | `surface-white` | Main page canvas, default product card background, configurator panel | |

### 1.4 Industrial Steel Greys (Text & Borders)
Used for body copy, technical specifications, and `1px` blueprint grid hairlines.

| Token Name | Current Hex | CSS Variable | Tailwind Class | Where It Is Used | Client Change / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Steel 900 (Primary Ink)** | `#1C2026` | `--color-steel-900` | `steel-900` | Main body text, product titles, specification values | |
| **Steel 800** | `#2B3036` | — | `steel-800` | Long-form engineering descriptions and filter labels | |
| **Steel 600 (Muted Ink)** | `#4A525D` | `--color-steel-600` | `steel-600` | Secondary metadata, SKU labels, Ex./Inc. VAT secondary text | |
| **Steel 400** | `#8C96A4` | — | `steel-400` | Input placeholders, breadcrumb chevrons, footer copyright | |
| **Steel 200 (Grid Hairline)** | `#DCE1E7` | `--color-steel-200` | `steel-200` | `1px` structural borders on cards, inputs, and specification tables | |
| **Steel 100** | `#F1F4F7` | — | `steel-100` | Card SKU header bar, subtle button hover states | |

### 1.5 Industrial Status & Certification Accents

| Token Name | Current Hex | CSS Variable | Tailwind Class | Where It Is Used | Client Change / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Certification Teal** | `#00897B` | `--color-accent-teal` | `accent-teal` | UKCA / SWL shield icons, brand bar divider | |
| **Safety Amber** | `#D97706` | `--color-safety-amber` | `accent-amber` | Bulk discount badges (`10+ Rate`, `Save 5%`), Lorry Tail-Lift notices, B2B Proforma icon | |

---

## 2. Typography & Fonts

All fonts are loaded from Google Fonts in `src/app/layout.tsx` and mapped to CSS variables in `src/app/globals.css`.

| Font Role | Current Font Family | Weights Used | CSS Variable / Tailwind Class | Where It Is Used | Alternative Options (if changing) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Display & Section Headings** | **Barlow Condensed** | `600`, `700`, `800` | `--font-barlow` / `font-display` | Page titles, hero headline, category headers, CTA buttons, navigation links | *Oswald*, *Chakra Petch*, *Space Grotesk*, *Bebas Neue* |
| **2. Brand Mark / Emblem** | **Roboto Slab** | `600`, `700` | `--font-slab` / `font-slab` | "STILLAGE STORAGE" wordmark in header and footer | *Zilla Slab*, *Bitter*, *Arvo*, or match Display font |
| **3. UI & Body Copy** | **Inter** | `400`, `500`, `600`, `700` | `--font-inter` / `font-sans` | Product descriptions, bullet highlights, form inputs, general copy | *Plus Jakarta Sans*, *DM Sans*, *IBM Plex Sans* |
| **4. Technical Specs, SKUs & Prices** | **JetBrains Mono** | `500`, `700` | `--font-mono` / `font-mono` | SKUs (`SSS-CANT-3B8A`), dimensions (`2400×1100mm`), SWL badges (`1,500kg SWL`), Ex./Inc. VAT prices, quote breakdown | *IBM Plex Mono*, *Space Mono*, *Roboto Mono* |

---

## 3. Product Configurator Finish Swatches

Defined in `src/data/seedCatalog.ts`:

| Option ID | Display Name | Code | Current Swatch Hex | Default Price Modifier (Ex. VAT) |
| :--- | :--- | :--- | :--- | :--- |
| `standard-blue` | RAL 5010 Stillage Blue (Standard) | `RAL 5010` | `#145DA0` | Included (`£0.00`) |
| `raw-steel` | Raw Unpainted Mill Steel | `RAW-MILL` | `#5A636E` | `-£10.00` per unit |
| `custom-ral` | Custom Corporate RAL Finish | `RAL-CUST` | `#0F2342` | `+£25.00` per unit |
| `galvanised` | Hot-Dip Galvanised (BS EN ISO 1461) | `HDG-1461` | `#B6C0CB` | `+£45.00` per unit |

---

## 4. Where to Edit These Values in the Codebase

1. **CSS Variables & Font Stacks**: `src/app/globals.css`
2. **Tailwind Theme Palette**: `tailwind.config.ts`
3. **Google Fonts Stylesheet Link**: `src/app/layout.tsx`
4. **Product Finish Swatches**: `src/data/seedCatalog.ts`
