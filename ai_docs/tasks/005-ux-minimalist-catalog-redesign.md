# Task 005: Small-Catalog (12-Product) UX Redesign & 3 Concept Branches

## 1. Overview & Objectives
The client feedback states that the current website feels **too busy and complex** for their current inventory of **~12 products**. They like the brand colours (`Brand Navy #0F2342`, `Stillage Blue #145DA0`, `Workshop Sand #F2E3CE`) and the industrial typography (`Barlow Condensed`, `Inter`, `JetBrains Mono`), but the page suffers from visual clutter, nested showcase containers, duplicate micro-labels, and unnecessary navigation layers.

This task delivers:
1. **Best-practice UX analysis** for small-inventory industrial B2B websites.
2. **Three distinct design approaches**, each deployed to its own dedicated Git branch.
3. **High-resolution mockup images** rendered for each approach.
4. **Interactive preview pages** and live implementations on each branch so the client can compare side-by-side.

---

## 2. Context & Client Considerations
- **Catalog Size**: Exactly 12 core stillage and rack models. Multi-level category nesting creates "empty shelf syndrome" and redundant clicks.
- **Brand Consistency**: Must strictly preserve:
  - Header & structural navy (`#0F2342`, `#09172C`)
  - Factory stillage blue (`#145DA0`, `#0D447A`)
  - Warm workshop sand backdrops (`#F2E3CE`, `#FAF5EE`)
  - Clean studio white surfaces (`#FFFFFF`)
  - Typography stacks: Barlow Condensed (Headings), Inter (Body), JetBrains Mono (Technical specs & prices).
- **Client Usability**: Non-technical stakeholders need to switch between git branches or test URLs without complex configuration.

---

## 3. Scope & Deliverables

### The 3 Design Approaches:
1. **Branch 1 (`design/approach-1-clean-catalog`)**: **"Clean Industrial Catalog & Visual Grid"**
   - *Philosophy*: E-commerce simplicity. Puts all 12 products directly in front of the buyer with zero fluff.
   - *Key UX features*: Streamlined navy hero, single-click category pill filters (All 12, Cantilever 3, Hopper 3, Sheet & Mesh 4, Post Pallets 2), spacious 3-column product cards with prominent specs, and direct "Configure & Buy".

2. **Branch 2 (`design/approach-2-spec-finder`)**: **"Interactive Spec Finder & Solution Guide"**
   - *Philosophy*: Decision-driven workflow. Industrial buyers want the exact model for their warehouse without reading 12 data sheets.
   - *Key UX features*: Clean Workshop Sand canvas, 3-step interactive selector (Storage Application &rarr; Load Capacity SWL &rarr; Footprint / Mobility), dynamic instant results pairing 3D photography with CAD blueprint line art, and quick custom fabrication inquiry.

3. **Branch 3 (`design/approach-3-editorial-showcase`)**: **"Editorial Craftsmanship & Master Showcase"**
   - *Philosophy*: Engineering authority. High-end British fabrication portfolio aesthetic.
   - *Key UX features*: Technical blueprint gridlines on deep navy, oversized hero stillage with weld/SWL callouts, 3 curated master families, and a compact "12 Core Models Engineering Comparison Matrix" for rapid B2B procurement.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: High-Resolution Visual Mockup Assets
- [x] Task 1.1: Generate Approach 1 mockup (`approach-1-clean-catalog.jpg`)
- [x] Task 1.2: Generate Approach 2 mockup (`approach-2-spec-finder.jpg`)
- [x] Task 1.3: Generate Approach 3 mockup (`approach-3-editorial-showcase.jpg`)
- [x] Task 1.4: Place all mockup assets into `public/images/redesign/`

### Phase 2: Branch 1 — Clean Industrial Catalog & Visual Grid
- [ ] Task 2.1: Create branch `design/approach-1-clean-catalog`
- [ ] Task 2.2: Implement clean, uncluttered homepage layout in `src/app/page.tsx`
- [ ] Task 2.3: Build interactive category pill filter and clean 3-column card grid
- [ ] Task 2.4: Add redesign comparison banner and `/redesign-preview` page
- [ ] Task 2.5: Verify build and commit

### Phase 3: Branch 2 — Interactive Spec Finder & Solution Guide
- [ ] Task 3.1: Create branch `design/approach-2-spec-finder`
- [ ] Task 3.2: Implement 3-step interactive Spec Finder widget component
- [ ] Task 3.3: Implement dynamic matching card results with CAD blueprint preview
- [ ] Task 3.4: Add custom fabrication CAD request strip
- [ ] Task 3.5: Verify build and commit

### Phase 4: Branch 3 — Editorial Craftsmanship & Master Showcase
- [ ] Task 4.1: Create branch `design/approach-3-editorial-showcase`
- [ ] Task 4.2: Implement dark navy architectural hero with technical callouts
- [ ] Task 4.3: Implement 3 curated family showcase cards
- [ ] Task 4.4: Implement interactive 12-model specification comparison table
- [ ] Task 4.5: Verify build and commit

### Phase 5: Client Presentation & Comparison Guide
- [ ] Task 5.1: Push all 3 branches to remote GitHub repository
- [ ] Task 5.2: Provide interactive side-by-side comparison artifact for client review
- [ ] Task 5.3: Present clear instructions for checking out each branch locally or on GitHub

---

## 5. Verification & Testing Strategy
- Next.js production build check (`npm run build`) on each branch.
- Mobile, tablet, and desktop responsive layout verification.
- Zero layout shift (CLS), instant filter responsiveness.

---

## 6. Client Handover & Branch Navigation
- **Branch 1**: `git checkout design/approach-1-clean-catalog`
- **Branch 2**: `git checkout design/approach-2-spec-finder`
- **Branch 3**: `git checkout design/approach-3-editorial-showcase`
