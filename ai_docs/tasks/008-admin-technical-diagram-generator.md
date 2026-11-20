# Task: 008 - Admin Technical Diagram Generator & Contentful Publishing Studio

## 1. Overview & Objectives
Bring end-to-end **Technical Diagram Generation, Editing, and Publishing** into the protected **Admin Section (`/admin/diagrams`)** of **Stillage Storage Solutions** (`stillagestoragesolutions.co.uk`).

Building directly on the existing two-stage hybrid blueprint architecture (`src/components/EditableBlueprintStudio.tsx`, `scripts/generate-editable-blueprints.mjs`, and `src/data/blueprint-specs.json`), this feature enables administrators to:
1. **Audit & manage technical drawings across the entire product catalog** from one admin dashboard.
2. **Generate or upload clean 3D CAD base renders** — supporting both a **£0/month manual/upload mode** and an **optional pay-as-you-go AI 3D CAD render generator** (for new products that only have a rough workshop photo or dimensions).
3. **Visually edit vector dimensions, callouts, and ISO title blocks** in the browser and persist drafts in Postgres (`@netlify/database`).
4. **Publish directly to Contentful CMS** (`technicalDrawing` field) in 1 click, automatically updating the product listing hover-flick and product detail gallery without needing developer CLI scripts.

---

## 2. Context & Client Considerations

### Cost Implication Breakdown
There are two operating modes — the platform is designed so the **£0/month workflow works out of the box**, and AI generation is an **optional, strictly admin-gated, pay-as-you-go add-on**:

| Capability | Provider / Infrastructure | Estimated Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Vector Blueprint Editor, SVG/PNG Export & Persistence** | Existing Next.js + Netlify DB (Postgres) + Contentful | **£0 / month** | Uses existing `EditableBlueprintStudio`, `buildLayeredBlueprintSvgString`, and Postgres JSONB storage. |
| **1-Click Publish to Contentful** | Existing Contentful Management API (`CONTENTFUL_MANAGEMENT_TOKEN`) | **£0 / month** | Uploads generated `.JPG`/`.PNG` + `.SVG` assets directly to the product's `technicalDrawing` field. |
| **Optional: AI 3D CAD Base Render Generation** | Google Gemini Image API (`@google/genai`) **or** Netlify AI Gateway | **~2p–6p (\$0.03–\$0.08) per image** | Pay-as-you-go with **no monthly fixed fee**. Generating 20–50 product diagrams/month costs roughly **£1–£3/month** (and **£0** in months with no new products). |
| **Optional: AI Auto-Placement of Dimension Arrows** | Gemini Flash (`gemini-2.5-flash`) | **< 0.1p (< \$0.001) per diagram** | Suggests initial `(x1, y1, x2, y2)` vector coordinates from the render + product dimensions. |

### Cost Guardrails & Technical Constraints
- **Admin-Only Access**: Protected by existing Auth.js v5 RBAC in [`src/middleware.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/src/middleware.ts) (`/admin/:path*` and `/api/admin/:path*` require `role === 'admin'`). Public visitors can never trigger paid AI calls.
- **Hard Monthly Budget Cap**: Track AI generation count in Postgres with a configurable monthly ceiling (e.g., `AI_DIAGRAM_MONTHLY_LIMIT=50`, default 50 renders/month ≈ £2–£3 max).
- **Graceful Zero-Cost Fallback**: If no AI key / Netlify AI Gateway is enabled, the AI button displays a clean "Manual / Upload Mode" notice while all editing, SVG generation, and Contentful publishing remain 100% operational.
- **Netlify Runtime Timeout**: AI image generation takes ~10–25s, fitting comfortably inside Netlify's 60s synchronous function timeout; responses will include clear progress feedback and timeout handling.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Admin Route & Navigation**:
   - New protected page [`src/app/admin/diagrams/page.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/app/admin/diagrams/page.tsx) with server-side `auth()` admin verification.
   - Add **"Technical Diagrams"** navigation entry to the Admin dropdown in [`src/components/Header.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Header.tsx) and quick-link from [`src/components/AdminAnalyticsDashboard.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/AdminAnalyticsDashboard.tsx).
2. **Database Persistence (`db/schema.ts`, `src/lib/repository.ts`)**:
   - Add `blueprintSpecs` table to store editable `BlueprintAnnotationSpec` JSON, base render URL, Contentful asset ID, and last-edited metadata per SKU.
   - Add `diagramGenerationLogs` table (or counter) to track AI generation usage, model used, estimated cost, and enforce the monthly cap.
3. **Shared SVG Builder Library (`src/lib/blueprintSvg.ts`)**:
   - Extract `buildLayeredBlueprintSvgString`, `calloutBoxSize`, and `dimensionLabelGeometry` from [`scripts/generate-editable-blueprints.mjs`](file:///Users/timbo/Dev/stillage-storage-solutions/scripts/generate-editable-blueprints.mjs) into a shared TypeScript module usable by both Next.js API routes and CLI scripts.
4. **Admin API Endpoints (`src/app/api/admin/diagrams/*`)**:
   - `GET /api/admin/diagrams` — List all catalog products with their blueprint status (`published`, `draft`, `missing`) and monthly AI quota usage.
   - `PUT /api/admin/diagrams/[sku]` — Save/update a product's editable `BlueprintAnnotationSpec` draft in Postgres.
   - `POST /api/admin/diagrams/generate-render` — (Optional AI mode) Generate a clean, un-annotated RAL 5010 3D CAD isometric base render from product specs and/or an uploaded reference photo, returning the image + optional AI-suggested dimension coordinates.
   - `POST /api/admin/diagrams/publish` — Upload the finalized high-res `.JPG`/`.PNG` (and optional `.SVG`) to Contentful via CMA, attach it to the product's `technicalDrawing` field, publish the entry, and revalidate Next.js cache tags.
5. **Admin Diagram Generator UI (`src/components/AdminDiagramStudio.tsx`)**:
   - Catalog sidebar showing drawing status badges per SKU.
   - Base render panel: choose existing render, upload local photo/render, or trigger AI 3D CAD render generation (showing remaining monthly quota & estimated per-render cost).
   - Integrated interactive vector editor (extending [`EditableBlueprintStudio.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/EditableBlueprintStudio.tsx)) with **Save Draft**, **Export .SVG / .PNG**, and **Publish to Live Product** actions.

### Out-of-Scope (unless requested):
- Public/customer-triggered AI image generation (kept strictly admin-only to prevent abuse and uncontrolled costs).
- Full parametric 3D solid modeling (`.STEP` / `.SLDPRT` CAD kernel).
- Automated bulk regeneration of all SKUs in a single unattended job.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Shared Blueprint Engine & Database Persistence
- [ ] Task 1.1: Extract shared SVG generation utilities (`buildLayeredBlueprintSvgString`, `calloutBoxSize`, `dimensionLabelGeometry`, `COLOR_MAP`) into `src/lib/blueprintSvg.ts` and update `scripts/generate-editable-blueprints.mjs` and `src/components/EditableBlueprintStudio.tsx` to share the single source of truth.
- [ ] Task 1.2: Add `blueprintSpecs` and `diagramGenerationLogs` tables to [`db/schema.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/db/schema.ts) and add CRUD + monthly quota helper functions in [`src/lib/repository.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/src/lib/repository.ts) (with graceful fallback when DB is unavailable in local/test mode).
- [ ] Task 1.3: Create `GET /api/admin/diagrams` and `PUT /api/admin/diagrams/[sku]` routes for loading catalog blueprint statuses and saving editable JSON drafts.

### Phase 2: Optional AI Base Render & Auto-Annotation API
- [ ] Task 2.1: Add `src/lib/diagramAiGenerator.ts` supporting clean un-annotated 3D CAD isometric base render generation via `@google/genai` (or Netlify AI Gateway when enabled), plus optional `gemini-2.5-flash` vision-assisted initial coordinate placement for `BlueprintAnnotationSpec`.
- [ ] Task 2.2: Implement `POST /api/admin/diagrams/generate-render` with strict admin auth check, input validation (SKU, dimensions, finish, optional reference photo), monthly usage cap enforcement, and usage logging.
- [ ] Task 2.3: Document optional environment variables (`GEMINI_API_KEY` or Netlify AI Gateway toggle, `AI_DIAGRAM_MONTHLY_LIMIT`) in [`.env.example`](file:///Users/timbo/Dev/stillage-storage-solutions/.env.example).

### Phase 3: 1-Click Contentful Publishing Pipeline
- [ ] Task 3.1: Add `src/lib/contentfulManagement.ts` helper wrapping Contentful CMA asset upload (`/uploads` → `/assets` → `/process` → `/publish`) and product entry linking (`fields.technicalDrawing`).
- [ ] Task 3.2: Implement `POST /api/admin/diagrams/publish` to accept the finalized diagram image (high-res `.JPG`/`.PNG` rendered from canvas) and layered `.SVG`, publish to Contentful, update `blueprintSpecs` in Postgres, and call `revalidateTag('contentful-site')` so `/products` and `/products/[slug]` reflect the new blueprint immediately.

### Phase 4: Admin UI (`/admin/diagrams`) & Navigation Integration
- [ ] Task 4.1: Build [`src/components/AdminDiagramStudio.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/AdminDiagramStudio.tsx) combining the SKU status sidebar, base render source/upload/AI generator controls, interactive vector annotation editor, and **Save Draft / Publish to Contentful** toolbar.
- [ ] Task 4.2: Create [`src/app/admin/diagrams/page.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/app/admin/diagrams/page.tsx) with server-side admin RBAC guard and initial catalog + DB spec hydration.
- [ ] Task 4.3: Add **"Technical Diagrams"** links to the Admin dropdown in [`src/components/Header.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/Header.tsx) and the header bar of [`src/components/AdminAnalyticsDashboard.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/AdminAnalyticsDashboard.tsx).

---

## 5. Verification & Testing Strategy
- **RBAC Security Tests**: Verify unauthenticated users and non-admin customers receive `401`/`403` on `/api/admin/diagrams/*` and redirect on `/admin/diagrams`.
- **Unit Tests (`tests/`)**:
  - Test `src/lib/blueprintSvg.ts` produces valid multi-layer SVG markup with all 5 named `<g id="layer-...">` groups.
  - Test monthly AI quota enforcement and zero-cost fallback when `GEMINI_API_KEY` is unset.
  - Test `PUT /api/admin/diagrams/[sku]` validation and DB persistence/fallback behaviour.
- **Build & Type Check**: Run `npm test` and `npm run build` to confirm zero TypeScript or Next.js build errors.
- **Manual End-to-End Check**:
  1. Sign in as Admin → open `/admin/diagrams`.
  2. Select a product, upload or generate a base render, adjust a dimension arrow, and click **Save Draft** (reload to confirm persistence).
  3. Export `.SVG` and `.PNG` locally, then test **Publish to Contentful** and verify the updated blueprint appears on `/products` hover and `/products/[slug]`.

---

## 6. Client Handover & Operational Guide
- **Where to access**: Sign in with an admin account → click the **ADMIN** menu in the top header → select **Technical Diagrams** (`/admin/diagrams`).
- **Day-to-day workflow (Zero Cost)**:
  1. Pick a product from the left sidebar.
  2. Use its existing render or upload a clean photo/CAD image.
  3. Click and drag any dimension line or callout label to adjust measurements, or add/delete callouts.
  4. Click **Save Draft** to store your editable layout, and **Publish to Live Product** to push the finished drawing straight to Contentful and the live storefront.
- **Optional AI workflow**:
  1. For a brand-new product without a clean render, click **Generate 3D CAD Base Render** (optionally attaching a workshop photo for shape reference).
  2. Review the generated clean render, tweak any vector dimensions, and publish.
  3. Monitor monthly usage right in the top bar of `/admin/diagrams` (capped automatically so costs stay predictable at a few pence per drawing).
