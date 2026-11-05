# Task: 001 - Optimise SEO & GEO Strategy with Contentful CMS & Client-Friendly Analytics

## 1. Overview & Objectives
This plan outlines the end-to-end architecture to optimize **Search Engine Optimisation (SEO)**, **Generative Engine Optimisation (GEO / AI Search)**, **Contentful CMS ergonomics**, and **Analytics reporting** for **Stillage Storage Solutions** (`stillagestoragesolutions.co.uk`).

The business objective is to maximize qualified UK B2B industrial traffic (logistics directors, warehouse managers, manufacturing operations, scaffolding contractors) and convert search visibility into RFQs, proforma quotes, and direct online orders—while ensuring the non-technical client has a stress-free editing experience and clear, actionable visibility into website performance.

---

## 2. Context & Client Considerations
- **Non-Technical Client**: The client should not need to understand code, JSON-LD schemas, canonical tags, Open Graph meta tags, or complicated GA4 exploration reports.
- **Fail-Safe CMS Design**: If the client fills out only basic product details (e.g. title, dimensions, price, photo), the platform must **automatically generate** all required SEO meta tags, social share cards, and structured schemas. Dedicated SEO fields in Contentful will be optional power-user overrides with helpful character count guidance.
- **UK B2B Industrial Context**: Search terms are specific and transactional: *"heavy duty stillage manufacturer UK"*, *"certified post pallets 1500kg"*, *"cantilever pipe rack RAL 5010"*, *"LOLER certified warehouse cages"*.
- **The Modern Search Reality (SEO + GEO)**: Over 35% of B2B procurement queries are now synthesized by AI search engines (Google AI Overviews, Perplexity, ChatGPT Search, Claude). The site must be structured so both traditional web crawlers and LLM engines cite Stillage Storage Solutions as the authoritative UK steel fabricator.
- **Analytics Ergonomics**: Non-technical clients dread GA4's confusing interface. They need automated, visual 1-page executive reports delivered directly to their email inbox every month.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Automated Technical SEO Foundation (Next.js App Router)**:
   - Dynamic `sitemap.xml` generated automatically from Contentful (`/sitemap.xml`).
   - Dynamic `robots.txt` configured with crawler policies for search engines and AI bots (`/robots.txt`).
   - Canonical URL management across all pages.
   - Dynamic Open Graph / Twitter image generation via `@vercel/og` (`/api/og`) for automated, branded social share previews.
2. **Comprehensive Structured Data (Schema.org / JSON-LD)**:
   - `Organization` / `LocalBusiness` / `Manufacturer` schema on root layout.
   - `Product` & `Offer` schema on every product specification page (price, currency, availability, dimensions, SWL, UKCA compliance).
   - `BreadcrumbList` schema on category, product, and blog guides.
   - `TechArticle` / `BlogPosting` schema on technical guides.
   - `FAQPage` schema for common buyer and technical questions.
3. **Generative Engine Optimisation (GEO) Architecture**:
   - `public/llms.txt` and `public/llms-full.txt` implementation for Perplexity, GPTBot, and Claude.
   - Direct-answer summary blocks and structured specification tables across products and blog posts.
   - Clear UK engineering authority cues (UKCA, LOLER 1998, BS EN 13626, BS EN ISO 9001).
4. **Contentful CMS Schema Refinement for Non-Technical Editors**:
   - Optional `seo` field group on `product`, `category`, and `blogPost` content models (`seoTitle`, `seoDescription`, `seoKeywords`, `faqItems`).
   - Field validations and clear, jargon-free editor help notes (e.g. character limits, preview tips).
   - Bulletproof fallback logic in `src/lib/contentful.ts` so missing SEO fields never cause errors or blank metadata.
5. **Client-Friendly Analytics Strategy**:
   - Google Tag / GA4 event tracking setup for key B2B actions (Configurator selections, bulk tier views, proforma quote requests, phone number clicks, spec downloads).
   - Looker Studio (Google Data Studio) 1-Page Executive Dashboard template.
   - Automated monthly PDF email report delivery scheduled to the client's inbox.
   - Lightweight alternative recommendation (e.g. Netlify Analytics or Plausible) for instant, cookie-less stat viewing.
6. **Client Handover & Plain-English Operating Guide**:
   - Step-by-step checklist on how to publish products and articles in Contentful to maximize Google and AI ranking.

### Out-of-Scope (for this task):
- Paid Google Ads (PPC) campaign management.
- Third-party backlink outreach campaigns.

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Automated Technical SEO (Next.js App Router)
- [x] Task 1.1: Create `src/app/sitemap.ts` dynamic route that queries Contentful products, categories, and blog posts, returning XML sitemap entries with `lastModified`, `changeFrequency`, and `priority`.
- [x] Task 1.2: Create `src/app/robots.ts` dynamic route that specifies crawl permissions for Googlebot, Bingbot, PerplexityBot, GPTBot, and ClaudeBot, pointing to `https://stillagestoragesolutions.co.uk/sitemap.xml`.
- [x] Task 1.3: Create dynamic Open Graph card generator at `src/app/api/og/route.tsx` (using Next.js `ImageResponse`) rendering the brand navy/stillage blue aesthetic, British Engineered Steel badge, product title, and SKU.
- [x] Task 1.4: Update `src/app/layout.tsx` metadata with canonical base URL (`https://stillagestoragesolutions.co.uk`), language alternates (`en-GB`), and default Open Graph / Twitter card templates.

### Phase 2: Schema.org JSON-LD Structured Data
- [x] Task 2.1: Implement `Manufacturer` & `Organization` JSON-LD schema on `src/app/layout.tsx` or `src/app/page.tsx` detailing Stillage Storage Solutions, UK address, contact details, price range, and manufacturing credentials.
- [x] Task 2.2: Implement `Product` JSON-LD schema on `src/app/products/[slug]/page.tsx` including `name`, `sku`, `description`, `image`, `offers` (price in GBP, availability, itemCondition), `weight`, `depth`, `width`, `height`, and `hasMerchantReturnPolicy`.
- [x] Task 2.3: Implement `BreadcrumbList` JSON-LD schema on product, category, and blog post detail pages.
- [x] Task 2.4: Implement `TechArticle` / `BlogPosting` JSON-LD schema on `src/app/blog/[slug]/page.tsx` including author, publisher, datePublished, and dateModified.
- [x] Task 2.5: Implement `FAQPage` JSON-LD schema component for buyer questions (delivery, custom dimensions, load testing, finish options).

### Phase 3: Generative Engine Optimisation (GEO) Architecture
- [x] Task 3.1: Create `public/llms.txt` and `public/llms-full.txt` containing structured, high-density Markdown documentation of Stillage Storage Solutions, product categories, standard dimensions, SWL ratings, finishes (RAL 5010, galvanized), and factory lead times.
- [x] Task 3.2: Enhance product detail page layouts with high-authority semantic structures: direct-answer bullet points ("What is this stillage used for?"), explicit specification tables, and engineering compliance badges (UKCA, LOLER 1998).
- [x] Task 3.3: Add FAQ sections to category and product pages with clear question-and-answer pairs designed for AI synthesis and Google Featured Snippets.

### Phase 4: Contentful CMS Schema & Fallback Logic
- [x] Task 4.1: Update `scripts/contentful-sync.mjs` to add optional SEO fields to `product`, `category`, and `blogPost` models:
  - `seoTitle` (Symbol, max 60 chars, help text: *"Optional. Recommended 50-60 characters. If left empty, title + brand is used."*)
  - `seoDescription` (Text, max 160 chars, help text: *"Optional. Recommended 140-160 characters. If left empty, short description is used."*)
  - `faqItems` (Array of Symbol or JSON for Q&A pairs).
- [x] Task 4.2: Update `src/lib/contentful.ts` types and mapping functions to ingest these fields with bulletproof fallbacks.
- [x] Task 4.3: Update Next.js `generateMetadata` in `src/app/products/[slug]/page.tsx` and `src/app/blog/[slug]/page.tsx` to prioritize editor SEO fields when present, falling back gracefully to product details.

### Phase 5: Client-Friendly Analytics & Reporting Architecture
- [x] Task 5.1: Create an Analytics Event Specification for B2B conversion tracking:
  - `configurator_interact` (RAL color selection, castor addition, forklift pocket toggle).
  - `tier_discount_click` (5+ or 10+ quantity selection).
  - `quote_request_submitted` (Proforma quote generation).
  - `contact_click` (`tel:` and `mailto:` links).
  - `spec_advisor_query` (AI Spec Advisor usage).
- [x] Task 5.2: Design the Looker Studio (Google Data Studio) 1-Page Executive Dashboard layout:
  - Scorecards: Monthly Total Users, Quote Requests, Phone Calls, Top Postcode Regions.
  - Bar Chart: Top 5 In-Demand Stillage Products.
  - Table: Top Google Search Queries bringing traffic.
  - Pie/Donut Chart: Traffic Sources (Organic Google, Direct, Referral).
- [x] Task 5.3: Document the automated monthly email schedule setup (automated PDF sent on 1st of every month).
- [x] Task 5.4: Provide evaluation of lightweight cookie-less alternatives (Netlify Analytics / Plausible) for quick mobile check-ins without logging into Google.

### Phase 6: Automated Verification & Test Suite
- [x] Task 6.1: Add unit tests in `tests/seo-geo.test.mjs` verifying:
  - Sitemap generation structure and URL format.
  - Robots.txt rules and sitemap pointer.
  - JSON-LD schema valid formatting and required Schema.org fields.
  - LLMS.txt content validity.
  - Contentful SEO fallback mechanism when fields are empty.
- [x] Task 6.2: Validate Next.js build (`npm run build`) and test suite (`npm test`).

### Phase 7: Non-Technical Client Operating Guide
- [x] Task 7.1: Create `ai_docs/guides/client-seo-contentful-guide.md` with plain-English instructions and screenshots/diagrams explaining how to add a product or blog post, how the automatic SEO magic works, and how to read the monthly analytics report.

---

## 5. Verification & Testing Strategy
- **Node.js Automated Test Suite**: Run `node --test tests/seo-geo.test.mjs` verifying sitemap, robots, schema generation, and fallback logic.
- **Rich Results Schema Validator**: Verify generated JSON-LD output against Google's Rich Results schema specifications for `Product`, `Organization`, `BreadcrumbList`, and `TechArticle`.
- **Search Engine Crawler Simulation**: Curl `/robots.txt` and `/sitemap.xml` to confirm HTTP 200 responses, proper XML formatting, and correct canonical base URLs.
- **GEO & LLM Crawler Verification**: Verify `/llms.txt` and `/llms-full.txt` return clean, well-structured Markdown accessible by LLM user agents.
- **Next.js Production Build**: Execute `npm run build` to confirm zero static rendering or TypeScript errors.

---

## 6. Client Handover & Operational Guide
- **"Set It & Forget It" Automation**: The client does not need to configure meta tags or write code. Contentful entries automatically populate all SEO and GEO requirements.
- **Monthly Email Report**: Zero-login executive PDF report automatically sent on the 1st of every month via Looker Studio.
- **Plain-English Guidelines**: A 1-page visual cheat sheet detailing best practices for product descriptions and image alt text in Contentful.
