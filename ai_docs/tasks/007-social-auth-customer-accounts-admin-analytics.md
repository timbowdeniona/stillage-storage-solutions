# Task: Social Login (Google, Microsoft, Facebook), Customer Accounts & Simple Admin Analytics Dashboard

## 1. Overview & Objectives
Implement zero-SaaS-cost, production-ready social authentication, role-based access control (Customer vs. Administrator), a B2B Customer Account portal with purchase history and one-click reordering, and a simple, clear Admin Analytics Dashboard — structured for multi-agent execution via Antigravity's `run_workflow` orchestration engine.

### Core Objectives
1. **Multi-Provider Social Login (£0 Auth SaaS Cost)**: Enable sign-in via **Google, Microsoft (Entra ID), and Facebook** using Auth.js v5 (`next-auth@beta`) natively inside Next.js 15 App Router on Netlify — avoiding per-MAU SaaS fees (Clerk/Auth0) and avoiding paid developer-program OAuth fees.
2. **Role-Based Access Control (RBAC)**:
   - **Administrators (`role: 'admin'`)**: `timdbowden@gmail.com`, `admin@plantandrobinson.com`
   - **Test Customer (`role: 'customer'`)**: `tim@valleychapel.co.uk` (seeded with realistic past UK trade orders & proforma invoices for immediate verification)
   - All other new sign-ins default to `role: 'customer'`.
3. **Customer Account Portal (`/account`)**: Display previous Stripe card orders and 30-day B2B Proforma Invoices, VAT receipt / Stripe PDF links, order specification breakdowns, one-click reorder into the checkout basket, and saved company/delivery profile details.
4. **Simple & Clear Admin Analytics Dashboard (`/admin/analytics`)**: First-party, cookie-less, zero-monthly-fee analytics stored in Postgres and presented in a clean 4-zone executive view tailored for non-technical business owners (no complex BI menus).
5. **Orchestrated Execution**: Partition all deliverables into disjoint file-ownership workstreams so they can be executed in staged & parallel phases using `run_workflow`.

---

## 2. Context & Client Considerations
- **Existing Stack**: Next.js 15.1 (App Router), React 19, TypeScript, Tailwind CSS 3.4, Stripe (Embedded Checkout + B2B Proforma Invoices + Webhooks), Contentful, Algolia, hosted on **Netlify**.
- **Design System**: Follows `DESIGN_SYSTEM.md` (`brand-navy` `#0F2342`, `stillage-blue` `#145DA0`, `surface-white` `#FFFFFF`, `surface-sandLight` `#FAF5EE`, `accent-teal` `#00897B`, `accent-amber` `#D97706`; `Barlow Condensed` display, `Inter` body, `JetBrains Mono` data/SKUs/prices).
- **Cost Minimisation Strategy (£0/month auth & analytics)**:
  - **Auth**: Auth.js v5 (`next-auth@beta`) with encrypted HTTP-only JWT sessions — **£0/month** (avoids Clerk/Auth0 MAU pricing and avoids per-request DB session lookups).
  - **Database**: **Netlify Database** (`@netlify/database` + `drizzle-orm@beta`) managed Postgres with scale-to-zero compute and automatic deploy migrations (with `DATABASE_URL` `pg` fallback for Neon Free Tier / local Postgres and in-memory seeded fallback for offline dev/build) — **~£0/month** for typical B2B traffic.
  - **Analytics**: First-party Postgres event ingestion (`POST /api/analytics/event`) replacing paid Plausible/Mixpanel subscriptions — **£0/month**.
  - **Charts**: Lightweight custom SVG trend chart & funnel bars (no heavy/paid charting libraries).
  - **External OAuth App Fees**: Google, Microsoft Entra ID, and Facebook OAuth apps are **£0/month, £0/year** (restricted strictly to these three free OAuth providers per client decision).
- **Why Not Netlify Identity?**: Netlify Identity only supports Google, GitHub, GitLab, and Bitbucket — it does **not** support Microsoft or Facebook, and cannot run under `netlify dev`. Auth.js v5 supports Google, Microsoft, and Facebook cleanly in both local dev and Netlify production.

---

## 3. Scope & Deliverables

### In Scope
- **Database Layer (`db/` & `netlify/database/migrations/`)**:
  - Postgres tables: `users`, `orders`, `analytics_events`.
  - Drizzle schema (`db/schema.ts`), Netlify DB client (`db/index.ts`), `drizzle.config.ts`, timestamp-prefixed SQL migrations, and idempotent seed script (`scripts/seed-accounts.mjs`) seeding `timdbowden@gmail.com`, `admin@plantandrobinson.com`, and `tim@valleychapel.co.uk` (with 3 realistic sample orders plus additional sample orders & 30 days of sample analytics events).
- **Authentication & RBAC (`src/auth.config.ts`, `src/auth.ts`, `src/middleware.ts`)**:
  - Auth.js v5 configured with Google, Microsoft Entra ID, and Facebook providers.
  - Automatic email-normalized role assignment (`ADMIN_EMAILS` env var defaulting to `timdbowden@gmail.com,admin@plantandrobinson.com`).
  - Optional strictly non-production (`NODE_ENV !== 'production'`) quick-login switcher for testing the 3 seeded accounts locally before OAuth credentials are provisioned.
  - Route protection in `src/middleware.ts` + server-side guards in API routes & Server Components.
- **Backend APIs**:
  - `src/app/api/auth/[...nextauth]/route.ts` — OAuth callbacks & session endpoints.
  - `src/app/api/checkout/route.ts` & `src/app/api/webhooks/stripe/route.ts` — persist created orders/proformas and update payment status on `checkout.session.completed` and `invoice.paid`.
  - `src/app/api/account/orders/route.ts` — authenticated customer's past purchases & proforma invoices.
  - `src/app/api/account/profile/route.ts` — GET/PATCH saved company name, phone, default postcode, and tail-lift preference.
  - `src/app/api/analytics/event/route.ts` — lightweight first-party event ingestion wired into `src/lib/analytics.ts`.
  - `src/app/api/admin/analytics/route.ts` — admin-only aggregated KPIs, daily trend series, top products, 4-step conversion funnel, recent orders, and CSV export (`?format=csv`).
- **Frontend UI**:
  - `src/app/login/page.tsx` — clean branded Sign In page with Google, Microsoft, and Facebook buttons.
  - `src/components/Header.tsx` & `src/app/layout.tsx` — Account / Admin Analytics menu pill & Sign In / Sign Out controls.
  - `src/app/account/page.tsx` & `src/components/AccountPortalClient.tsx` — Customer Account Dashboard (order history, VAT/Stripe invoice links, one-click reorder into `VatContext`, company profile settings).
  - `src/components/CheckoutClient.tsx` — auto-prefill email, company name, and postcode when logged in.
  - `src/app/admin/analytics/page.tsx` & `src/components/AdminAnalyticsDashboard.tsx` — Simple & clear 4-zone Admin Analytics Dashboard (Date Filter + CSV Export, 4 Headline KPIs, Clean SVG Revenue/Orders Trend Chart, Top 5 Stillages + 4-Step Conversion Funnel, Recent Orders Table, plus link to SEO/GEO Monitor).
  - Gate `/analytics-report` as admin-only so internal SEO/GEO diagnostics are not publicly exposed.

### Out of Scope
- Additional OAuth providers beyond Google, Microsoft Entra ID, and Facebook (any provider requiring paid developer-program fees).
- Custom username/password registration and password-reset email infrastructure (social login only, keeping complexity and email SaaS costs at £0).
- Multi-user company team hierarchies or credit-limit approval workflows.
- Paid third-party BI tools (Looker Studio / Plausible paid plans remain optional, not required).

---

## 4. Step-by-Step Implementation Plan (Orchestrated via `run_workflow`)

```text
Phase 1 (Foundation — Sequential)
  ├── Agent 1: Database Schema, Migrations & Seed Data
  └── Agent 2: Auth.js v5 Social Login, RBAC & Middleware

Phase 2 (Backend APIs — Parallel Fan-Out)
  ├── Agent 3: Checkout/Webhook Order Persistence + Customer Account APIs
  └── Agent 4: First-Party Analytics Ingestion + Admin Analytics API & CSV Export

Phase 3 (Frontend UI — Parallel Fan-Out)
  ├── Agent 5: /login Page, AuthProvider & Header Navigation
  ├── Agent 6: /account Customer Portal & Checkout Pre-fill
  └── Agent 7: /admin/analytics Simple & Clear Dashboard + /analytics-report Admin Gate

Phase 4 (Verification & Audit — Parallel Review)
  ├── Agent 8: Automated Unit/Integration Tests, Lint & Next.js Production Build
  └── Agent 9: Security, RBAC & Cost/Env Configuration Audit
```

### Phase 1: Foundation — Database & Social Authentication
- [x] **Task 1.1 (Agent 1 — DB & Schema Architect)**: Create `drizzle.config.ts` (`out: "netlify/database/migrations"`), `db/schema.ts` (`users`, `orders`, `analytics_events`), `db/index.ts` (Netlify DB + `DATABASE_URL` fallback), `src/lib/seedAccountsData.ts`, and `src/lib/repository.ts`.
- [x] **Task 1.2 (Agent 1 — Migrations & Seed)**: Add timestamp-prefixed SQL migrations in `netlify/database/migrations/` and create `scripts/seed-accounts.mjs` to seed `timdbowden@gmail.com` (admin), `admin@plantandrobinson.com` (admin), `tim@valleychapel.co.uk` (customer), 3 sample UK trade orders for `tim@valleychapel.co.uk`, and 30 days of sample B2B analytics events.
- [x] **Task 1.3 (Agent 2 — Auth & RBAC Engineer)**: Create `src/lib/roles.ts`, `src/types/next-auth.d.ts`, Edge-safe `src/auth.config.ts` (Google, Microsoft Entra ID, Facebook + non-production dev quick-login), Node `src/auth.ts`, and `src/app/api/auth/[...nextauth]/route.ts`.
- [x] **Task 1.4 (Agent 2 — Middleware & Config)**: Create `src/middleware.ts` protecting `/account/*`, `/admin/*`, `/analytics-report`, `/api/account/*`, and `/api/admin/*`. Update `.env.example` and `netlify.toml`.

### Phase 2: Backend APIs & Stripe/Analytics Wiring (Parallel)
- [x] **Task 2.1 (Agent 3 — Orders & Stripe Sync)**: Update `src/app/api/checkout/route.ts` and `src/app/api/webhooks/stripe/route.ts` to record orders and update status to `paid`.
- [x] **Task 2.2 (Agent 3 — Customer Account APIs)**: Create `src/app/api/account/orders/route.ts` and `src/app/api/account/profile/route.ts`.
- [x] **Task 2.3 (Agent 4 — Analytics Ingestion)**: Create `src/app/api/analytics/event/route.ts`, update `src/lib/analytics.ts`, and add `page_view` tracking in `src/components/AnalyticsTracker.tsx`.
- [x] **Task 2.4 (Agent 4 — Admin Analytics Aggregation API)**: Create `src/lib/adminAnalytics.ts` and `src/app/api/admin/analytics/route.ts`.

### Phase 3: Frontend Pages & UX (Parallel)
- [x] **Task 3.1 (Agent 5 — Login & Header Auth)**: Create `src/components/AuthProvider.tsx`, `src/app/login/page.tsx`, `src/components/LoginCardClient.tsx`, and update `src/app/layout.tsx` & `src/components/Header.tsx`.
- [x] **Task 3.2 (Agent 6 — Customer Account Portal)**: Create `src/app/account/page.tsx`, `src/components/AccountPortalClient.tsx`, and update `src/components/CheckoutClient.tsx` to pre-fill logged-in customer details.
- [x] **Task 3.3 (Agent 7 — Simple & Clear Admin Analytics Dashboard)**: Create `src/app/admin/analytics/page.tsx`, `src/components/AdminAnalyticsDashboard.tsx`, and add admin guard to `src/app/analytics-report/page.tsx`.

### Phase 4: Verification, Testing & Security Audit (Parallel)
- [x] **Task 4.1 (Agent 8 — Tests & Build Gate)**: Add `tests/auth-rbac.test.mjs` and `tests/analytics-aggregation.test.mjs`; run `npm test`, `npx tsc --noEmit`, and `npm run build`.
- [x] **Task 4.2 (Agent 9 — Security & Cost Audit)**: Verify RBAC, customer isolation, dev-auth guard, strictly Google/Microsoft/Facebook OAuth scope, and £0 SaaS cost compliance.

---

## 5. Verification & Testing Strategy
1. `npm test` (RBAC, analytics aggregation, CSV export, plus existing suite)
2. `npm run lint` and `npm run build`
3. Security & access audit across all protected routes and APIs

---

## 6. Client Handover & Operational Guide
### One-Time OAuth Provider Setup Checklist (Client / DevOps — £0/mo)
Add the following environment variables in **Netlify Site Settings → Environment Variables** (and `.env.local` for local dev):
- **Core Auth**: `AUTH_SECRET` (generate via `npx auth secret`), `ADMIN_EMAILS="timdbowden@gmail.com,admin@plantandrobinson.com"`
- **Google (£0)**: Google Cloud Console → OAuth 2.0 Web Client → Callback: `https://stillagestoragesolutions.co.uk/api/auth/callback/google` (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)
- **Microsoft (£0)**: Microsoft Entra Admin Center → App Registrations (Accounts in any org + personal Microsoft accounts) → Callback: `https://stillagestoragesolutions.co.uk/api/auth/callback/microsoft-entra-id` (`AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/common/v2.0`)
- **Facebook (£0)**: Meta for Developers → Facebook Login app → Callback: `https://stillagestoragesolutions.co.uk/api/auth/callback/facebook` (`AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`)

### Live Admin Analytics Setup (Stripe + Google Analytics 4 — £0/mo)
The `/admin/analytics` dashboard and `/api/admin/analytics` endpoint pull commerce metrics from **Stripe** and site traffic / funnel telemetry from **Google Analytics 4 Data API v1beta** (with automatic local database fallback whenever unconfigured):
- **Stripe Commerce (`STRIPE_SECRET_KEY`)**: Already wired directly to `https://api.stripe.com/v1` (Card Checkout Sessions, B2B Proforma Invoices, Customers).
- **GA4 Site Tracking (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)**: Set your GA4 Measurement ID (`G-...`) to enable `gtag.js` browser page views and configurator/quote event tracking.
- **GA4 Data API Reader (£0 GCP Service Account)**:
  1. In Google Cloud Console, enable the **Google Analytics Data API** and create a Service Account (no billing required).
  2. Download a JSON key and grant the Service Account email **Viewer** role in **GA4 Admin → Property Access Management**.
  3. Set in `.env.local` & Netlify Environment Variables:
     - `GA4_PROPERTY_ID` (numeric GA4 property ID from Property Details)
     - `GA4_CLIENT_EMAIL` (Service Account email)
     - `GA4_PRIVATE_KEY` (PEM `private_key` string with `\n` newlines)

### Phase 5: Live Stripe + GA4 Analytics Integration
- [x] **Task 5.1**: Create `src/lib/stripeAnalytics.ts` to paginate and normalize live Stripe Checkout Sessions, B2B Proforma Invoices, and unique Stripe Customers.
- [x] **Task 5.2**: Create `src/lib/ga4Analytics.ts` with zero-dependency RSA-SHA256 Service Account JWT auth and GA4 `:batchRunReports` parser (overview visitors/sessions/views, daily traffic, B2B funnel events, `/products/*` views, traffic channels).
- [x] **Task 5.3**: Create `src/lib/analyticsProvider.ts` (60s cache + graceful local fallback), update `src/lib/adminAnalytics.ts`, wire `/admin/analytics` & `/api/admin/analytics`, and update `AdminAnalyticsDashboard.tsx`, `AnalyticsTracker.tsx`, `src/lib/analytics.ts`, `ProductConfigurator.tsx`, `.env.example`, and `netlify.toml`.
