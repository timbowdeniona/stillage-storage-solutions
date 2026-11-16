# Product Configurator Redesign: Approach & Rationale

**Project:** Stillage Storage Solutions  
**Component:** Product Page Right-Hand Configurator (`src/components/ProductConfigurator.tsx`)  
**Branch:** `feat/tabbed-swatch-configurator`

---

## 1. The Challenge
The previous product configurator stacked all four configuration steps, bulk-tier upsell banners, postcode freight calculation, an itemised quote table, PO reference input, and three full-width checkout buttons into a single vertical column. This created:
- **High visual density:** Buyers had to scroll past long option descriptions and administrative fields before seeing the final price or primary action.
- **Competing calls to action:** Three stacked full-width buttons (*Buy Online Now*, *Generate Official B2B VAT Proforma Invoice*, and *Add to Basket*) gave equal visual weight to every path.
- **Slow option scanning:** Surface finishes and base/mobility choices were presented as text-heavy cards rather than quick visual selectors.

---

## 2. The Solution: Visual Swatches & Two-Step Tabs
We redesigned the configurator into a focused, two-step flow that keeps all existing pricing, freight, B2B proforma, and basket functionality intact while cutting vertical clutter in half.

### Key UX Improvements
1. **Two-Step Segmented Tabs (`1. Configure Unit` → `2. Delivery & Quote`)**
   - **Step 1 (Configure Unit)** focuses purely on product specification: Finish & Coating, Base & Mobility, and Quantity.
   - **Step 2 (Delivery & Quote)** houses UK postcode entry, forklift vs. tail-lift offloading, the itemised live VAT quote breakdown, and the optional Company Name / PO Reference field.
   - Keeps the configurator compact and prevents administrative fields from overwhelming first-time visitors.

2. **Visual Circular Finish Swatches**
   - Replaced text-heavy finish boxes with a clean 4-column row of circular colour swatches (`RAL 5010`, `RAW-MILL`, `RAL-CUST`, `HDG-1461`) showing the code and price delta underneath.
   - The full finish name and lead-time note appear in a single compact caption bar below the swatches for the active selection.

3. **2×2 Base & Mobility Icon Tiles**
   - Condensed the four base handling options (*Stacking Feet*, *Forklift Pockets*, *Lockable Castors*, *Castors + Pockets*) into a scannable 2×2 tile grid with icons and clear unit pricing.
   - The technical description for the selected option displays cleanly beneath the grid.

4. **Quantity Stepper + Pallet Capacity Bar**
   - Paired the `− / +` quantity stepper with a live **Pallet Capacity** progress bar (`4/4` units per HGV pallet, total pallet count, and total weight in kg).
   - Replaced the heavy upsell banner with compact bulk-tier chips (`1–4`, `5–9 (-5%)`, `10+ (-10%)`) and a single-line pallet optimisation link (e.g. *Fill pallet* or *8 units = -5%*).

5. **Sticky Summary Footer & Clear CTA Hierarchy**
   - A pinned footer displays the live **Total Inc. VAT**, **Total Ex. VAT**, and pallet summary at all times.
   - On Tab 1, the primary button guides buyers to **Continue to Delivery & Quote →**, with quick links underneath for **Buy Now**, **Add to Basket**, and **PDF Quote**.
   - On Tab 2, **Buy Online Now** is the primary action, with **Add to Basket** and **B2B PDF Proforma** positioned side by side below it.

---

## 3. Accessibility & Technical Standards
- **Keyboard & Screen Reader Support:** Built with semantic `role="tablist"`, `role="tab"`, and `role="tabpanel"` attributes, arrow-key tab navigation, `aria-selected` / `aria-pressed` states, and non-colour active indicators.
- **Find-in-Page Support:** Inactive tab panels use `hidden="until-found"` with `beforematch` listeners so browser search (`Cmd+F` / `Ctrl+F`) automatically reveals matching content in the other tab.
- **Zero Regression to Business Logic:** All URL query parameter syncing, live `/api/quote` calculations, Algolia conversion tracking, B2B analytics events, basket state, and Stripe/Proforma checkout flows remain unchanged.
