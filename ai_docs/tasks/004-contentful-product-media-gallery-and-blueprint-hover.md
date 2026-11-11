# Task: 004 - Stillage Product Content Type Media Architecture (Primary Image, Technical Drawing, 5-Image Gallery & Listing Hover Flick)

## 1. Overview & Objectives
This task upgrades the **Stillage Product** content model in **Contentful CMS** and enhances the product media display across the website (`stillagestoragesolutions.co.uk`). 

Every engineered stillage product will have a standardised, robust 3-tier visual media architecture:
1. **Primary Image**: The hero photography/render of the manufactured stillage (used across catalog listings, search results, shopping basket, proforma invoices, and Google/OpenGraph cards).
2. **Technical Drawing**: The official CAD dimensional blueprint / engineering drawing showing SWL, dimensions, weld specifications, and forklift entry channels.
3. **Gallery (up to 5 extra images)**: Dedicated multi-asset media gallery in Contentful allowing up to 5 supplemental images (workshop fabrication shots, detail angles, gate latches, stacked configurations, or real customer site installations).

On the front-end:
- **Product Listing Page (`/products`) & Product Cards**: The primary image renders by default; when the buyer hovers (mouseover) over the card, the image seamlessly **flicks to the technical CAD blueprint drawing**, providing instant engineering reassurance before clicking into the product.
- **Product Details Page (`/products/[slug]`)**: The visual viewer handles the primary image, technical CAD drawing, and up to 5 extra gallery shots with thumbnail navigation, active view badging, stage surface toggling (Workshop Sand, Studio White, Blueprint Grid), and smooth switching.

---

## 2. Context & Client Considerations
- **Non-Technical CMS Ergonomics**:
  - The Contentful editor interface must make the distinction crystal clear: non-technical editors should easily drag & drop the **Primary Image**, the **Technical Drawing**, and select **up to 5 Gallery Images** with built-in validation preventing more than 5 extra assets.
  - Helpful editor guidance notes in Contentful will explain ideal aspect ratios, image formats (`.webp`, `.png`, `.jpg`), and drawing resolutions.
- **Graceful Fallbacks & Backward Compatibility**:
  - Existing content currently uses `primaryImage`, optional `secondaryImage`, and optional `technicalDrawing`.
  - The migration script and data normaliser must support existing entries, automatically migrating `secondaryImage` into the gallery if present, ensuring zero visual regressions or broken image links.
  - If a product does not have a technical drawing uploaded, the card on the listing page must gracefully maintain the primary image (or show the workshop sandbox angle) without blank image flashes or broken asset links.
- **Performance & Core Web Vitals (CWV)**:
  - On the product listing page, hovering should not trigger a layout shift (CLS 0) or delayed image download. Both primary and technical drawing assets will use optimized dimensions (`width={480}`, `height={360}`), smooth CSS opacity cross-fading or instant switching, and lazy loading for offscreen cards while prefetching on pointer proximity.
  - On the product detail page, the primary hero image maintains `fetchPriority="high"` (LCP candidate), while secondary gallery images and the technical drawing load with `fetchPriority="low"`.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Contentful Content Model Migration (`scripts/contentful-sync.mjs`)**:
   - Update `PRODUCT_CONTENT_TYPE` schema definition:
     - `primaryImage`: Link to Asset (`required: true`, mimetype: `image/*`).
     - `technicalDrawing`: Link to Asset (`required: false`, mimetype: `image/*`, editor note: "CAD dimensional blueprint or vector technical drawing").
     - `gallery`: Array of Links to Assets (`required: false`, max 5 items validation, mimetype: `image/*`, editor note: "Up to 5 supplemental workshop, application, or detail photos").
     - Keep legacy `secondaryImage` in fallback resolution to preserve backwards compatibility while deprecating in CMS.
   - Update `scripts/contentful-sync.mjs` with asset seed entries for gallery images across all 7 seed products.
2. **Type Definitions & Data Normalisation (`src/types/catalog.ts`, `src/lib/contentful.ts`, `src/data/seedCatalog.ts`)**:
   - Update `Product` interface in `src/types/catalog.ts` to include `gallery: string[]`.
   - Update `resolveContentfulImage` and `getProducts()` in `src/lib/contentful.ts` to resolve the `gallery` array from the Contentful delivery API and map asset URLs.
   - Update `SEED_PRODUCTS` in `src/data/seedCatalog.ts` with populated `gallery` image arrays and blueprints.
3. **Product Listing Page Hover Flick (`src/components/ProductCard.tsx`)**:
   - Implement dual-image presentation in `ProductCard`:
     - Base state: Crisp primary image.
     - Hover/Mouseover state: Seamless flick to `technicalDrawing` (with smooth CSS cross-fade or instant switch).
     - Blueprint pill indicator (e.g. *"CAD Blueprint"*) appearing on hover so buyers know an engineering drawing is being previewed.
     - Graceful fallback if `technicalDrawing` is absent.
4. **Product Details Page Media Gallery (`src/components/ProductConfigurator.tsx`)**:
   - Refactor image gallery logic to aggregate:
     - `[0] Primary Image`
     - `[1] Technical Drawing`
     - `[2..N] Gallery Extra Images (1 to 5 items)`
   - Add clear thumbnail badges / labels so buyers know whether they are viewing the hero photo, technical drawing, or extra application view.
   - Synchronise with the stage backdrop switcher (Workshop Sand, Studio White, Blueprint Grid).
5. **Search & Algolia Indexing Sync (`src/lib/algolia.ts`, `scripts/algolia-sync.mjs`)**:
   - Ensure `gallery` array and `technicalDrawing` are properly indexed in Algolia records for instant search filtering and rich snippets.

### Out-of-Scope:
- Full 3D WebGL model rendering (already handled in vector SVG via `/workshop` and `/blueprint-studio`).
- Altering blog post or category content models.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Contentful Content Model & Sync Scripts
- [x] Task 1.1: Update `PRODUCT_CONTENT_TYPE` in `scripts/contentful-sync.mjs`:
  - Define `gallery` field: `type: 'Array'`, `items: { type: 'Link', linkType: 'Asset', validations: [{ linkMimetypeGroup: ['image'] }] }`, `validations: [{ size: { max: 5 } }]`.
  - Ensure `technicalDrawing` field has explicit asset link configuration and clear editor descriptions.
  - Run or test `scripts/contentful-sync.mjs` against Contentful CMA to update content type schema.
- [x] Task 1.2: Update `SEED_PRODUCT_ENTRIES` in `scripts/contentful-sync.mjs` to include `gallery` asset arrays for each product.

### Phase 2: Core Data Types & Normalisation Layer
- [x] Task 2.1: Update `src/types/catalog.ts`:
  - Add `gallery?: string[];` to `Product` interface.
- [x] Task 2.2: Update `src/lib/contentful.ts`:
  - Update `fetchContentfulCollection` mapping to resolve `item.fields.gallery` into a string array of URLs.
  - Add fallback logic: if `gallery` is empty but legacy `secondaryImage` exists, place `secondaryImage` in `gallery`.
- [x] Task 2.3: Update `src/data/seedCatalog.ts`:
  - Add `gallery` arrays (up to 5 images) to all catalog products with realistic workshop, stacking, and detail image paths.
- [x] Task 2.4: Update `src/lib/algolia.ts` and `scripts/algolia-sync.mjs`:
  - Map `gallery` and `technicalDrawing` into Algolia product index payloads.

### Phase 3: Product Listing Page (Hover Flick to Technical Drawing)
- [x] Task 3.1: Update `src/components/ProductCard.tsx`:
  - Add secondary image element for `product.technicalDrawing` layered over `product.primaryImage`.
  - Add Tailwind hover transitions (`group-hover:opacity-100 opacity-0` or React pointer state) for smooth, instantaneous image flick.
  - Add animated blueprint badge (`CAD Drawing`) on hover when a technical drawing is present.
  - Ensure no layout shifts and proper `alt` text for accessibility.
- [x] Task 3.2: Verify mobile / touch behaviour (touch tap opens product page, mouseover activates on desktop).

### Phase 4: Product Details Page (Media Gallery & Technical Drawing Display)
- [x] Task 4.1: Update `src/components/ProductConfigurator.tsx`:
  - Construct comprehensive gallery list: Primary Image -> Technical Drawing -> Gallery extra images.
  - Update thumbnail strip to display up to 7 thumbnails (1 primary + 1 blueprint + up to 5 gallery images) with horizontal scroll / wrapping.
  - Add thumbnail indicator badges (e.g. "Primary", "CAD Drawing", "Photo").
  - Ensure clicking the "CAD Drawing" thumbnail or "Blueprint Grid" backdrop view automatically showcases the technical drawing / interactive blueprint.
- [x] Task 4.2: Update SEO schema in `src/lib/seo.ts`:
  - Include all gallery images in the Schema.org `Product` `image` array for rich Google image search indexing.

---

## 5. Verification & Testing Strategy
- **TypeScript Typecheck**: Run `npm run type-check` (or `npx tsc --noEmit`) to verify no missing props or type mismatches.
- **Contentful Sync Verification**: Execute `npm run contentful:sync` (dry-run or with CMA token) to verify the content type is updated and published with the max-5 gallery validation.
- **Visual & Interaction Verification**:
  - Test `/products`: Hover over each card; verify the card smoothly flicks to the technical drawing and reverts on mouse leave.
  - Test `/products/[slug]`: Verify thumbnail navigation, active image switcher, and proper display of primary photo, CAD drawing, and all 5 gallery images.
- **Lighthouse / Core Web Vitals**:
  - Verify zero Cumulative Layout Shift (CLS = 0) during listing hover.
  - Verify LCP image optimization on product detail pages.

---

## 6. Client Handover & Operational Guide
- **Editing in Contentful CMS**:
  1. Open any product in Contentful (`Content -> Stillage Product`).
  2. **Primary Image**: Upload or select the main product photograph (white background or workshop sand).
  3. **Technical Drawing**: Upload or select the CAD blueprint or engineering dimensional diagram.
  4. **Gallery**: Click *Add Media* under the *Gallery* field to attach up to 5 supplemental photos (fabrication shots, load tests, latch details). Contentful will enforce the 5-image limit automatically.
  5. Hit **Publish**. The website updates instantly via on-demand revalidation.
