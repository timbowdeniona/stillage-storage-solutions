# Task: 003 - Interactive "Workshop" Modular Stillage Stacking & Assembly Configurator (`/workshop`)

## 1. Overview & Objectives
Because technical blueprints are structured as multi-layer, parametric **SVG vector graphics** (`<g>` groups with clean coordinate anchor points, dynamic `<text>` measurement nodes, and CSS/SVG color variables), they can be manipulated in real time directly in the browser DOM without regenerating raster images.

The objective of this plan is to build an interactive **"Workshop"** area (`/workshop`) on **Stillage Storage Solutions** where customers and warehouse planners can visually assemble, stack, and configure multi-tier modular stillage solutions on a live BS 8888 CAD blueprint canvas:
1. **Snap-Together Modular SVG Stacking**: Customers can select base frames (forklift pocket skids, castor bases, or 1250 mm hopper stands) and stack up to 4 or 5 compatible stillage modules vertically (e.g., solid-sheet bins, half-drop mesh picking cages, demountable post pallets, and top-feed conical hoppers with safety mesh guards) or side-by-side in multi-bay workshop runs.
2. **Real-Time Engineering & PUWER Safety Validation**: The Workshop engine automatically enforces footprint interlocking rules (e.g., matching `1200 × 1000 mm`, `1200 × 1200 mm`, or `1120 × 1120 mm` pressed pyramid stacking cup centres), calculates **cumulative vertical compression load** on the bottom-tier corner stanchions, and warns if a configuration exceeds certified stacking limits (e.g., 4-High vs. 5-High or warehouse ceiling/door clearance).
3. **Live Parametric SVG Blueprint & Dimensioning**: As modules are added, reordered, or finished in different coatings (`RAL 5010 Blue`, `Hot-Dip Galvanised ISO 1461`, `Raw Mill Steel`, or `Custom RAL`), the SVG canvas dynamically updates overall stack height, per-tier callout leaders, interlocking cup alignment markers, and the ISO title block.
4. **1-Click "Add Complete Stack to Quote/Basket" & CAD Export**: Customers can push the entire multi-module assembly (with individual SKU quantities, finishes, and bulk tier discounts) directly into [`VatContext.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/context/VatContext.tsx) for HGV pallet checkout, or export a combined **Assembly Blueprint (`.SVG` / `.PNG`)** for internal sign-off.

---

## 2. Context & Client Considerations
- **How SVG Enables Real-Time Online Manipulation**:
  - **Coordinate Snapping (`transform="translate(x, y)"`)**: Each stillage module in SVG has known top-cup receiver coordinates and bottom pyramid-foot anchor coordinates. Stacking Tier 2 onto Tier 1 simply translates the Tier 2 SVG `<g>` group to align with Tier 1's top receiver cups and layers them in painter's order (bottom-to-top, back-to-front).
  - **Dynamic Vector Dimension Lines**: Overall stack height (accounting for interlocking cup seating depth, typically `25–35 mm` overlap per tier) and floor footprint dimension arrows recalculate automatically in React and render as crisp `<line>` and `<text>` elements.
  - **Instant Finish & Option Tinting**: Because SVG layers support CSS custom properties, SVG `<filter>`, and vector path fills, toggling between **RAL 5010 Stillage Blue (`#145DA0`)**, **Hot-Dip Galvanised (`#B6C0CB`)**, or **Raw Steel (`#5A636E`)**, or toggling **Castors vs. Captive Forklift Pockets**, updates the visual module immediately.
- **Target Audience & B2B Value**:
  - **Warehouse & Operations Managers**: Visually verify whether a 4-high stack fits under a Roller Shutter Door (`e.g., 3000 mm`) or racking beam, and whether half-drop mesh gates remain at an ergonomic picking height on Tiers 1–2.
  - **Aggregate & Bulk Processing Buyers**: Combine stands (`1250 mm`), intermediate bin tiers (`900 mm`), and conical top hoppers (`600 mm`) like the `BBFH2-1` and `SSS-HOP-4T1000` systems.
  - **Non-Technical Ergonomics**: Uses intuitive **"Add Tier Above"**, **"Swap Module"**, **Drag/Move Tier Up/Down**, and **1-Click Preset Templates** alongside keyboard-accessible controls so no CAD expertise is required.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Modular SVG Component Library & Stacking Rules Engine (`src/data/workshopModules.ts`)**:
   - Parametric isometric & orthographic SVG module definitions for core stackable families:
     - **1200 × 1000 mm Euro/UK Footprint Family**: Solid Sheet Bin (`SSS-SHT-1210`), Half-Drop Mesh Cage (`SSS-MSH-1210HD`), Forklift Pocket / Castor Base Frame.
     - **1200 × 1200 mm & 1120 × 1120 mm Hopper & Bulk Tower Family**: Free Standing Hopper Stand (`1250 mm`), Conical Top Feed Hopper (`600 mm` with `200 × 200 mm` opening), Deep Solid Bin Tier (`SSS-HOP-4T1000` module), Safety Mesh Top Guard.
     - **1130 × 1130 mm Post Pallet Family**: Demountable Post Pallet (`SSS-PST-1111D`) with selectable post heights (`1000 mm`, `1200 mm`, `1500 mm`) and up to 5-high stacking.
     - **Cantilever Saw-Station Bay Builder**: Side-by-side bay planning for `SSS-CANT-3B8A` (`2400 mm`) and `SSS-CANT-2B4A` (`1800 mm`).
   - Engineering compatibility matrix: footprint matching, max tier limits, interlocking cup seating deduction (`mm`), tare weight summation, and ground-level corner post compression calculation.
2. **Dedicated "Workshop" Route (`src/app/workshop/page.tsx`) & Interactive Builder (`src/components/WorkshopConfigurator.tsx`)**:
   - **Left Panel — Module Palette & Presets**: Quick-start templates (*"4-High Order Picking Mesh Tower"*, *"BBFH2-1 Bulk Bag Hopper + Stand"*, *"4-Tier Aggregate Hopper Feed System"*, *"Mixed Sheet + Mesh WIP Stack"*) plus individual module cards to add/insert tiers.
   - **Center Stage — Interactive SVG Blueprint Canvas**:
     - Isometric 3D-styled vector stack view + Orthographic Front/Side elevation toggle with a live **Warehouse Clearance Height Line** (adjustable slider, e.g., `2400 mm` container door to `4500 mm` warehouse eaves) and human scale silhouette (`1750 mm`) for instant visual proportion.
     - Click any tier in the SVG stack to inspect, reorder (Move Up / Move Down), change finish (`RAL 5010`, `HDG ISO 1461`, `Raw Steel`, `Custom RAL`), toggle base mobility (`Standard Feet`, `Forklift Pockets`, `Lockable Castors`), or remove the tier.
     - Live auto-updating BS 8888 dimension leaders showing individual tier heights, interlocking seating offsets, total assembled height (`mm`), footprint (`mm`), total tare weight (`kg`), and combined payload SWL (`kg`).
   - **Right Panel — Structural & PUWER Compliance Readout + Bill of Materials (BOM)**:
     - Live structural check badges: Footprint Interlock Verified, Bottom-Tier Stanchion Compression Load (`kg`), Centre-of-Gravity / Aspect Ratio stability check, and Ceiling Clearance status.
     - Itemised Bill of Materials (BOM) with stack multiplier (e.g., *"Order 5 identical stacks = 20 units — 10% Bulk Discount Applied"*), one-click **Add Entire Configuration to Order Basket**, and **Export Assembly Blueprint (`.SVG` / `.PNG`)**.
3. **Site-Wide Navigation & Product Page Integration**:
   - Add prominent **"Workshop"** link with a badge in [`src/components/Header.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Header.tsx) (desktop nav bar + mobile drawer) and [`src/components/Footer.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Footer.tsx).
   - Add an **"Open in Workshop Stack Builder"** button on [`src/components/ProductConfigurator.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/ProductConfigurator.tsx) and [`src/app/blueprint-studio/page.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/app/blueprint-studio/page.tsx) that deep-links to `/workshop?sku=<SKU>` with that product pre-loaded into a stack.

### Out-of-Scope:
- Heavy WebGL/Three.js 3D game engine dependencies (keeping the Workshop 100% pure, zero-dependency, lightning-fast SVG + React for instant load times and crisp vector blueprint exports).
- Finite Element Analysis (FEA) stress-mesh simulation beyond certified SWL and column compression rules.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Modular Stillage Schema & Stacking Engineering Engine
- [x] Task 1.1: Extend [`src/types/catalog.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/src/types/catalog.ts) with Workshop types (`WorkshopModuleDef`, `WorkshopStackTier`, `WorkshopPreset`, `StackEngineeringSummary`, `FootprintFamilyId`).
- [x] Task 1.2: Create `src/data/workshopModules.ts` containing:
  - Parametric SVG rendering definitions and attachment anchor points (`bottomFootType`, `topReceiverType`, `seatedHeightMm`, `externalHeightMm`, `swlKg`, `tareKg`) for all catalog stillages (`BBFH2-1` Stand & Hopper modules, `SSS-HOP-4T1000` tiers, `SSS-SHT-1210`, `SSS-MSH-1210HD`, `SSS-PST-1111D`, `SSS-CANT-3B8A`, and `SSS-CANT-2B4A`).
  - Compatibility & validation rules engine (`validateStackConfiguration`) that checks footprint interlocking, calculates seated stack height, verifies bottom-unit static compression load, and checks against a user-configurable warehouse clearance height.
  - 4 curated **Workshop Preset Configurations** for 1-click loading.

### Phase 2: Interactive SVG "Workshop" Canvas & Assembly Builder (`WorkshopConfigurator.tsx`)
- [x] Task 2.1: Build `src/components/WorkshopConfigurator.tsx` featuring the interactive multi-layer SVG blueprint stage:
  - Renders stacked modules from bottom to top with accurate isometric & elevation projection, interlocking pyramid-cup connection callouts, dynamic colour swatches (`RAL 5010`, `Galvanised`, `Raw Steel`, `Custom RAL`), and base mobility graphics (`Castors` vs. `Forklift Pockets`).
  - Renders live overall height dimension lines, per-tier height breakdowns, an interactive **Clearance Limit Line** (e.g., HGV Curtain-Sider `2650 mm`, Roller Door `3000 mm`, High-Bay `4500 mm`), and a toggleable `1750 mm` operator scale reference.
- [x] Task 2.2: Implement interactive tier manipulation controls (both on-canvas SVG click/selection and accessible sidebar buttons):
  - Add Tier Above, Insert Base/Stand, Move Tier Up/Down, Duplicate Tier, Change Tier Finish, and Remove Tier.
  - Prevent or warn on invalid combinations (e.g., attempting to stack a `1200 × 1000 mm` cage onto an `1120 × 1120 mm` hopper stand, or stacking above the certified 4-high / 5-high limit) with clear engineering guidance.
- [x] Task 2.3: Add **Bill of Materials (BOM) & Basket Integration** + **Blueprint Export**:
  - Calculate unit and multi-stack pricing using [`src/lib/pricing.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/src/lib/pricing.ts) (including 5+ and 10+ bulk discounts across total units in the stack fleet).
  - Add **"Add Stack Configuration to Basket"** button wired to `addToBasket` in [`src/context/VatContext.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/context/VatContext.tsx).
  - Add **"Export Assembly Blueprint (.SVG)"** and **"Export High-Res CAD Sheet (.PNG)"** so customers can download their custom stacked configuration drawing with a full BS 8888 title block and BOM table.

### Phase 3: `/workshop` Route, Navigation Links & Deep-Linking
- [x] Task 3.1: Create `src/app/workshop/page.tsx` with SEO metadata, hero header, quick-preset selector, and embedded `WorkshopConfigurator` (supporting `?sku=` and `?preset=` query parameters).
- [x] Task 3.2: Update [`src/components/Header.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Header.tsx), [`src/components/Footer.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Footer.tsx), [`src/components/ProductConfigurator.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/ProductConfigurator.tsx), and [`src/app/blueprint-studio/page.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/app/blueprint-studio/page.tsx) so customers can enter the **Workshop** from anywhere on the site.
- [x] Task 3.3: Add automated tests in `tests/blog-contentful.test.mjs` verifying the Workshop module definitions, stacking compatibility calculations, and `/workshop` route integration.

---

## 5. Verification & Testing Strategy
- **Engineering Math & Stacking Validation Tests**: Verify that stacking 4 × `SSS-MSH-1210HD` (`900 mm` each with interlocking cup seating) computes accurate total height, total tare weight (`4 × 59 kg = 236 kg`), total static payload (`4,000 kg`), and bottom-unit compression (`3,177 kg` supported by Tier 1 corner posts).
- **Footprint Interlock Guardrails**: Verify that switching footprint families or attempting to place a top-only conical hopper at the bottom of a stack triggers appropriate structural guidance or auto-snaps to the matching stand.
- **Basket & Pricing Flow**: Verify that clicking **"Add Stack to Basket"** with a multi-tier configuration (and optional stack multiplier) populates [`VatContext.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/context/VatContext.tsx) with the exact SKUs, finishes, mobility options, and bulk discount tiers.
- **SVG & PNG CAD Export**: Verify that exported Workshop assembly blueprints open cleanly in browsers and vector tools (Figma, Inkscape, Illustrator) with all stacked tiers, dimension lines, and BOM title block intact.
- **Automated Test & Build Suite**: Run `npm test` and `npm run build` to ensure zero TypeScript or Next.js build errors.

---

## 6. Client Handover & Operational Guide
- **How Customers Use the "Workshop" (`/workshop`)**:
  1. Click **Workshop** in the main navigation bar (or click **"Configure Stack in Workshop"** on any product page).
  2. Choose a **Footprint Family** (`1200 × 1000 mm Euro/UK`, `1120 × 1120 mm Bulk Hopper`, `1200 × 1200 mm Modular Hopper Tower`, or `1130 × 1130 mm Post Pallet`) or load a **1-Click Preset**.
  3. Click **+ Add Module / Tier** to stack solid bins, half-drop mesh cages, or top-feed conical hoppers up to the certified height limit.
  4. Toggle finishes (`RAL 5010 Blue`, `Hot-Dip Galvanised`, `Raw Steel`), base mobility (`Castors` vs. `Forklift Pockets`), and check the **Warehouse Clearance Line** to ensure the stack fits through doors, containers, or racking bays.
  5. Download the **Custom Assembly Blueprint (`.SVG` / `.PNG`)** for engineering approval, or set the number of stacks needed and click **Add Complete Assembly to Quote/Basket**.
