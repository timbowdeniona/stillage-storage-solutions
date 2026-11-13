# Task 006: Brand Icon, Favicon, Contentful Navigation, Component Microtexts & Editable Homepage

## 1. Overview & Objectives
This task establishes a cohesive visual brand mark (SVG icon and multi-platform favicon set) for **Stillage Storage Solutions** (`stillagestoragesolutions.co.uk`) and transitions hardcoded UI copy, navigation menus, and homepage content into **Contentful CMS**.

### Key Objectives
1. **Brand Icon & Favicon Suite**: Create an industrial, geometric brand icon (inspired by box-section steel stillages and corner post pallets) and generate a complete favicon / app-icon set (`favicon.ico`, `icon.svg`, `apple-icon.png`, and web app manifest) integrated into Next.js App Router metadata, `Header`, and `Footer`.
2. **Contentful-Managed Navigation**: Move Header navigation links (including the Products dropdown items and mobile drawer links) and Footer navigation columns/links into Contentful so editors can add, rename, reorder, or hide links without code changes.
3. **Contentful Microtexts for Separate Components**: Extract hardcoded UI labels, badges, CTAs, and contact/trust microcopy from separate components (`Header`, `Footer`, `ProductCard`, `BlogCard`, `ProductConfigurator`, `CheckoutClient`, etc.) into structured Contentful entries with typed TypeScript fallbacks.
4. **Editable Homepage in Contentful**: Introduce a `homePage` Contentful content type so non-technical editors can update the homepage hero headline, subtitle, CTA button, hero showcase image, category filter pill labels, technical guides section headings, and homepage SEO metadata without code deployments.

---

## 2. Context & Client Considerations
- **Current State**:
  - `src/app/layout.tsx` has no `icons` metadata and there are currently no `favicon.ico`, `icon.svg`, or `apple-icon.png` files in `src/app/` or `public/`.
  - `src/components/Header.tsx` and `src/components/Footer.tsx` render a text-only `STILLAGE / STORAGE SOLUTIONS` stacked wordmark without a graphic brand icon.
  - `src/app/page.tsx` renders `src/components/redesign/Approach1HomePage.tsx`, which has hardcoded hero copy, category filter tab labels, and technical guides headings.
  - Separate components (`Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `BlogCard.tsx`, etc.) contain hardcoded microtexts (e.g., `"Configure & Buy"`, `"CAD Drawing"`, `"Featured Guide"`, `"Read Engineering Guide"`, trade desk phone/email/hours, VAT notice).
- **Non-Technical Client Ergonomics**:
  - Contentful editors must see clear, human-readable field names and descriptions (no raw code keys required to understand what a field controls).
  - Every Contentful field must have a safe, typed fallback in code (`src/data/seedCatalog.ts` or `src/data/seedSiteContent.ts`) so the storefront continues rendering cleanly if Contentful credentials are missing, rate-limited, or a field is left blank.
- **Brand & Design System Alignment**:
  - Must strictly adhere to `DESIGN_SYSTEM.md`: Brand Navy (`#0F2342`), Stillage Blue (`#145DA0`), Certification Teal (`#00897B`), and Workshop Sand (`#F2E3CE`).

---

## 3. Scope & Deliverables

### In Scope
- **Brand Icon & Favicons**:
  - Reusable `<BrandIcon />` React SVG component (`src/components/BrandIcon.tsx`) integrated into `Header.tsx` and `Footer.tsx`.
  - Next.js App Router icon files: `src/app/icon.svg`, `src/app/apple-icon.png` (or generated PNG), `src/app/favicon.ico`, and `src/app/manifest.ts` (Web App Manifest).
  - Explicit `icons` metadata configuration in `src/app/layout.tsx` if needed alongside App Router file conventions.
- **Contentful-Managed Navigation**:
  - New `navigationMenu` Contentful content type (entries keyed by `menuKey`, e.g. `header-main`, `footer-products`, `footer-engineering`) containing structured navigation items (`label`, `href`, `order`, `isExternal`, `requiresFeatureFlag`, and optional `children` for dropdown sub-items like the Header `Products` menu).
  - `getNavigationMenus()` in `src/lib/contentful.ts` with typed `NavigationMenu` / `NavigationItem` interfaces and complete fallback defaults matching the current `Header` and `Footer` links (respecting `FEATURES.enableBlogGuides`).
  - `Header.tsx` (desktop nav, Products dropdown, and mobile drawer) and `Footer.tsx` (Products & Engineering columns) refactored to render from Contentful navigation data.
- **Contentful Component Microtexts**:
  - New `componentMicrotexts` Contentful content type (one entry per component, e.g. `header`, `footer`, `product-card`, `blog-card`, `product-configurator`, `checkout`) with structured fields/JSON dictionary and human-readable labels.
  - Optional/complementary `siteSettings` (or `footer` / `header` entries) for trade desk phone, email, opening hours, VAT disclaimer, and brand wordmark lines.
  - Typed `Microtexts` interfaces in `src/types/catalog.ts` (or `src/types/content.ts`), `getComponentMicrotexts()` in `src/lib/contentful.ts`, and a `MicrotextsProvider` / prop-passing pattern so both Server and Client Components consume Contentful copy seamlessly.
- **Editable Homepage (`homePage` Content Type)**:
  - New `homePage` singleton Contentful content type covering Hero (`heroHeadlineLine1`, `heroHeadlineLine2`, `heroSubtitle`, `heroCtaLabel`, `heroCtaHref`, `heroImage`, `heroImageAlt`), Catalog Filter Pills (`filterAllLabel`, `filterCantileverLabel`, `filterHopperLabel`, `filterSheetMeshLabel`, `filterPostPalletsLabel`), Guides Section (`guidesTitle`, `guidesSubtitle`, `guidesViewAllLabel`), and Homepage SEO (`seoTitle`, `seoDescription`, `ogImage`).
  - `getHomePageContent()` in `src/lib/contentful.ts` with fallback defaults.
  - `src/app/page.tsx` and `src/components/redesign/Approach1HomePage.tsx` refactored to render Contentful-driven copy and imagery.
- **Contentful Sync & Revalidation**:
  - `scripts/contentful-sync.mjs` updated to create/publish `homePage` and `componentMicrotexts` content types and seed initial entries idempotently.
  - `src/app/api/webhooks/contentful/route.ts` enhanced with Next.js `revalidatePath` / `revalidateTag` when `homePage` or `componentMicrotexts` entries are updated.

### Out of Scope
- Redesigning the visual layout or switching away from `Approach1HomePage`.
- Replacing Algolia search indexing or Stripe checkout logic.
- Multi-language / localisation beyond `en-GB`.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Brand Icon & Multi-Platform Favicon Suite
- [ ] Task 1.1: Design a crisp, geometric stillage/post-pallet SVG mark using Brand Navy (`#0F2342`), Stillage Blue (`#145DA0`), and Certification Teal (`#00897B`) that remains legible at `16×16` px.
- [ ] Task 1.2: Create `src/app/icon.svg` and generate `src/app/favicon.ico` (16×16, 32×32, 48×48) and `src/app/apple-icon.png` (180×180), plus `src/app/manifest.ts` for PWA/desktop icon support.
- [ ] Task 1.3: Create `src/components/BrandIcon.tsx` and integrate it into `src/components/Header.tsx` and `src/components/Footer.tsx` alongside the stacked `STILLAGE / STORAGE SOLUTIONS` wordmark.

### Phase 2: Contentful Schema & Seed Data for Navigation, Homepage & Component Microtexts
- [ ] Task 2.1: Define TypeScript interfaces (`HomePageContent`, `NavigationMenu`, `NavigationItem`, `ComponentMicrotextMap`, `HeaderMicrotexts`, `FooterMicrotexts`, `ProductCardMicrotexts`, `BlogCardMicrotexts`, etc.) and default English (`en-GB`) fallback constants in `src/data/seedSiteContent.ts` (or `src/types/content.ts`).
- [ ] Task 2.2: Add `NAVIGATION_MENU_CONTENT_TYPE`, `HOME_PAGE_CONTENT_TYPE`, and `COMPONENT_MICROTEXTS_CONTENT_TYPE` definitions and initial seed entries (`header-main`, `footer-products`, `footer-engineering`, `homePage`, and per-component microtext entries) to `scripts/contentful-sync.mjs`.
- [ ] Task 2.3: Add `getNavigationMenus()`, `getHomePageContent()`, and `getAllComponentMicrotexts()` (with `next: { revalidate: 60, tags: ['contentful-site'] }`) to `src/lib/contentful.ts`, using `resolveContentfulImage()` for the homepage hero and OG images.

### Phase 3: Wire Navigation & Separate Components to Contentful
- [ ] Task 3.1: Create a lightweight `SiteContentProvider` (or pass server-fetched navigation & microtexts from `src/app/layout.tsx`) so Client Components receive Contentful data with zero client-side loading flash.
- [ ] Task 3.2: Update `src/components/Header.tsx` to render desktop links, the `Products` dropdown items, and mobile drawer navigation from Contentful `header-main` menu data (filtering items gated by `FEATURES.enableBlogGuides`), plus navigation/search/basket/VAT microtexts.
- [ ] Task 3.3: Update `src/components/Footer.tsx` to render footer navigation columns (`footer-products`, `footer-engineering`) from Contentful, alongside brand description, trade desk phone/email/hours, and VAT/copyright microtexts.
- [ ] Task 3.4: Update `src/components/ProductCard.tsx` and `src/components/BlogCard.tsx` to read badge and CTA microtexts (`"CAD Drawing"`, `"Configure & Buy"`, `"Featured Guide"`, `"min read"`, `"Read Engineering Guide"`).
- [ ] Task 3.5: Audit remaining interactive components (`ProductConfigurator.tsx`, `CheckoutClient.tsx`) and wire key shared microtexts (e.g., bulk tier labels, configurator CTA, VAT labels) to Contentful microtext entries.

### Phase 4: Make Homepage Fully Editable in Contentful
- [ ] Task 4.1: Update `src/app/page.tsx` to fetch `getHomePageContent()` in parallel with `getProducts()` and `getFeaturedBlogPosts()`, and export `generateMetadata()` using `homePage.seoTitle`, `homePage.seoDescription`, and `homePage.ogImage` when set.
- [ ] Task 4.2: Update `src/components/redesign/Approach1HomePage.tsx` to accept `homeContent: HomePageContent` and render editable hero headline lines, subtitle (interpolating `{count}` with `products.length`), CTA label/link, hero image & alt text, category filter pill labels, and technical guides section copy.
- [ ] Task 4.3: Update `src/app/api/webhooks/contentful/route.ts` to call `revalidatePath('/')`, `revalidatePath('/', 'layout')`, and `revalidateTag('contentful-site')` when `homePage`, `navigationMenu`, or `componentMicrotexts` entries are published, unpublished, or deleted.

### Phase 5: Contentful Sync & Verification
- [ ] Task 5.1: Run `npm run contentful:sync` (when `CONTENTFUL_MANAGEMENT_TOKEN` is available) to provision the new content types and seed entries in Contentful.
- [ ] Task 5.2: Verify fallback behaviour when Contentful tokens are absent or entries are partially populated.

---

## 5. Verification & Testing Strategy
- **Unit / Integration Tests (`npm test`)**:
  - Add a new test suite `tests/site-content-contentful.test.mjs` verifying:
    - `getNavigationMenus()`, `getHomePageContent()`, and `getAllComponentMicrotexts()` return complete, valid fallback objects when Contentful is unconfigured.
    - `{count}` template interpolation and `resolveContentfulImage()` asset resolution work as expected.
    - Icon files (`src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`) exist and are non-empty.
  - Run existing test suite (`npm test`) to confirm no regressions in `seo-geo`, `algolia-search-recommend`, `blog-contentful`, and `product-media-gallery`.
- **Build & Type Check**:
  - Run `npm run lint` and `npm run build` to confirm TypeScript types, Next.js App Router metadata/icon routes, and static/ISR rendering succeed cleanly.
- **Visual & Browser Inspection**:
  - Inspect rendered `<link rel="icon">`, `<link rel="apple-touch-icon">`, and `<BrandIcon />` in `Header` and `Footer` at desktop and mobile viewports.
  - Edit a field in Contentful (or mock response) and verify the homepage and component microtexts update cleanly.

---

## 6. Client Handover & Operational Guide
- **Editing the Homepage in Contentful**:
  1. Log into Contentful (`Space: q9ktabz6dqby`) and open **Content** &rarr; filter by **Home Page (`homePage`)**.
  2. Update the **Hero Headline**, **Hero Subtitle** (you can include `{count}` to automatically display the live number of in-stock models), **Hero CTA Label**, or **Hero Showcase Image**.
  3. Update **Category Filter Labels** or **Technical Guides Section** headings as needed, then click **Publish changes**.
- **Editing Navigation Menus in Contentful**:
  1. In Contentful **Content**, filter by **Navigation Menu (`navigationMenu`)**.
  2. Open `header-main`, `footer-products`, or `footer-engineering` to add, rename, reorder, or remove links (and dropdown sub-items under `Products`), then click **Publish changes**.
- **Editing Component Microtexts in Contentful**:
  1. In Contentful **Content**, filter by **Component Microtexts (`componentMicrotexts`)**.
  2. Select the entry for the component you want to update (e.g., `Header`, `Footer`, `Product Card`, `Blog Card`, `Configurator`).
  3. Edit the copy fields or key-value labels and click **Publish changes**. The live site refreshes automatically via webhook / ISR.
- **Note on Fallbacks**: Leaving an optional field blank will safely fall back to the default UK English copy rather than showing an empty label.
