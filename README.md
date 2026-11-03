# Stillage Storage Solutions (`stillagestoragesolutions.co.uk`)

Modern industrial e-commerce storefront and configurator for **Stillage Storage Solutions**, built with **Next.js (App Router)**, **Contentful CMS**, **Algolia InstantSearch**, **Stripe / B2B Proforma Commerce**, and **Rust Serverless APIs** deployed to **Netlify**.

---

## Architecture & Stack

- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS)
- **CMS**: Contentful (`category` and `product` content models seeded in Space `q9ktabz6dqby`)
- **Search**: Algolia InstantSearch REST client (`src/lib/algolia.ts`) with automatic local replica fallback
- **Backend APIs**:
  - **Rust Serverless Functions (`netlify/functions/`)**:
    - `src/bin/quote.rs` (`/.netlify/functions/quote` / `/api/rust/quote`): Calculates unit configurations (RAL finish, castors, forklift pockets), bulk tier discounts (5% on 5+, 10% on 10+), UK postcode HGV pallet delivery zones, tail-lift offloading surcharge, and 20% UK VAT.
    - `src/bin/checkout.rs` (`/.netlify/functions/checkout` / `/api/rust/checkout`): Verifies order totals and prepares Stripe Checkout sessions or official B2B UK VAT Proforma Invoices.
    - `src/bin/algolia_sync.rs` (`/.netlify/functions/algolia-sync` / `/api/rust/algolia-sync`): Webhook receiver for indexing published Contentful entries into Algolia.
  - **Next.js App Router Parity Routes (`src/app/api/*`)**: Full local and SSR parity routes (`/api/quote`, `/api/checkout`, `/api/webhooks/contentful`).

---

## Design System: *"British Engineered Steel"*

- **Brand Navy (`#0F2342`)**: Structural headers, industrial navigation, and hero framing.
- **Stillage Blue (`#145DA0`)**: Matched to factory RAL 5010 Gentian Blue stillage finish; used for primary CTAs and active configurator states.
- **Warm Workshop Sand (`#F2E3CE`)**: Studio showcase backdrop contrasting against blue steel cutouts.
- **Typography**: `Barlow Condensed` (headings), `Roboto Slab` (brand mark), `Inter` (body/UI), and `JetBrains Mono` (tabular SKUs, dimensions, SWL ratings, and Ex./Inc. VAT pricing).

---

## Netlify Environment Variables

When attaching this GitHub repository to Netlify, set the following environment variables in **Netlify Site Configuration > Environment Variables**:

```env
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=q9ktabz6dqby
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=7WWIQoILhWsAxzElN-B-_RKBelueStszNqvsCR3HfsE
```

*(Optional)* Add `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `ALGOLIA_ADMIN_API_KEY`, and `STRIPE_SECRET_KEY` when connecting live Algolia and Stripe accounts.

---

## Local Development

```bash
npm install
npm run dev
```
