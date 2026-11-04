// Contentful Content Model & Entry Seeder for Stillage Storage Solutions
// Run with: CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-... npm run contentful:sync

import { fileURLToPath } from 'node:url';

const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const TARGET_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'q9ktabz6dqby';
const ENVIRONMENT_ID = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
const BASE_URL = 'https://api.contentful.com';

export const BLOG_POST_CONTENT_TYPE = {
  id: 'blogPost',
  name: 'Blog Post & Technical Guide',
  description:
    'Engineering guides, warehouse safety standards, and buyer articles for Stillage Storage Solutions',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false },
    { id: 'excerpt', name: 'Excerpt / Summary', type: 'Text', required: true, localized: false },
    { id: 'category', name: 'Category', type: 'Symbol', required: true, localized: false },
    { id: 'author', name: 'Author Name', type: 'Symbol', required: true, localized: false },
    { id: 'authorRole', name: 'Author Role', type: 'Symbol', required: false, localized: false },
    { id: 'publishedAt', name: 'Published Date (YYYY-MM-DD)', type: 'Symbol', required: true, localized: false },
    { id: 'readingTimeMinutes', name: 'Reading Time (Minutes)', type: 'Integer', required: true, localized: false },
    { id: 'featured', name: 'Featured Article', type: 'Boolean', required: false, localized: false },
    { id: 'heroImage', name: 'Hero Image Path', type: 'Symbol', required: true, localized: false },
    { id: 'backdropStyle', name: 'Preferred Backdrop Style', type: 'Symbol', required: false, localized: false },
    {
      id: 'tags',
      name: 'Technical Tags',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
    {
      id: 'keyTakeaways',
      name: 'Key Engineering Takeaways',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
    { id: 'body', name: 'Article Body (Markdown)', type: 'Text', required: true, localized: false },
    {
      id: 'relatedProductSkus',
      name: 'Related Stillage Product SKUs',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
  ],
};

export const SEED_BLOG_ENTRIES = [
  {
    id: 'blog-swl-puwer-ukca-stillage-stacking-safety',
    title: 'SWL, PUWER & UKCA Compliance: A Warehouse Manager’s Guide to Safe Steel Stillage Stacking',
    slug: 'swl-puwer-ukca-stillage-stacking-safety-guide',
    excerpt:
      'Learn how Safe Working Load (SWL) ratings, 4-high interlocking stacking limits, PUWER 1998 inspections, and pressed steel pyramid feet keep multi-tier industrial stillage stacks compliant and stable.',
    category: 'Technical Standards & Safety',
    author: 'Gareth Davies',
    authorRole: 'Head of Steel Fabrication & Structural Compliance',
    publishedAt: '2026-10-28',
    readingTimeMinutes: 6,
    featured: true,
    heroImage: '/images/products/stacked-hopper-stillage.png',
    backdropStyle: 'sand',
    tags: ['SWL Certification', 'PUWER 1998', 'UKCA', '4-High Stacking', 'Warehouse Safety'],
    keyTakeaways: [
      'Every multi-tier steel stillage must display a permanent Safe Working Load (SWL) rating plate and maximum stack height (e.g., 1,000 kg SWL / 4-High).',
      'Under PUWER 1998, warehouse operators should inspect corner posts, stacking feet, and base welds at least every 6–12 months and immediately remove deformed units.',
      'Self-centring pressed steel pyramid/cup feet must fully engage on all four corners before the forklift mast releases the load.',
      'If a stillage is lifted via an overhead crane or hoist rather than a forklift deck, LOLER 1998 lifting accessory certification and tested lifting lugs are mandatory.',
    ],
    body: `## Why Safe Working Load (SWL) Plates Matter in High-Density Stacking

When stacking steel bin stillages or modular hopper towers 4-high in a busy manufacturing plant or logistics hub, the bottom unit supports not only its own payload but the combined static and dynamic load of the three units above it. At a rated 1,000 kg Safe Working Load (SWL) per tier, the corner box-section stanchions and pressed steel stacking feet on the ground-floor unit carry over 3,400 kg of vertical compression.

At Stillage Storage Solutions, every welded steel stillage, post pallet, and cantilever rack is engineered using structural British box-section steel (typically 50x50x3mm or 60x60x3mm RHS corner posts) with an engineered safety factor to prevent buckling under eccentric forklift placement.

## Understanding PUWER 1998 vs. LOLER 1998 for Stillages

A common question from UK Health & Safety managers is whether steel stillages fall under PUWER (Provision and Use of Work Equipment Regulations 1998) or LOLER (Lifting Operations and Lifting Equipment Regulations 1998).

- **Standard Forklift-Handled Stillages (PUWER 1998):** Stillages moved via forklift tines underneath the base frame or inside captive 4-way forklift pockets are classified as work equipment under PUWER Regulation 6. They require documented routine visual and structural inspections to verify that no corner posts, feet, or crossbearers have suffered forklift impact damage.
- **Crane-Slung or Hoist-Lifted Stillages (LOLER 1998):** Any stillage fitted with certified top lifting eyes designed to be suspended from an overhead gantry crane, HIAB, or site tower crane is classified as a lifting accessory under LOLER and requires 6-monthly thorough examination by a Competent Person.

## 5-Point Weekly Visual Inspection Checklist for Warehouse Operatives

Before stacking any solid sheet steel or mesh stillage above ground level, train forklift drivers and yard supervisors to check five critical structural points:

- **1. Pressed Steel Stacking Feet & Receiver Cups:** Check all four corner feet for splits, severe distortion, or missing weld beads. A bent stacking cup compromises 4-high vertical plumb alignment.
- **2. Corner Box-Section Stanchions:** Look for forklift tine impact dents or bowing along the vertical 50x50x3mm posts. Any post deflected by more than 5mm over its height should be quarantined.
- **3. Captive Forklift Guide Pockets:** Where enclosed 4-way forklift pockets are fitted, ensure the entry mouths are clear of debris and the underside fillet welds are intact.
- **4. Drop-Front Gates & Shooting Bolts:** On half-drop mesh and sheet stillages, verify that both spring-loaded or gravity retaining latches lock positively before lifting.
- **5. Legible SWL & Tare Weight Identification:** Ensure the SWL rating and maximum stackable tier count remain clearly visible to operatives on the shop floor.`,
    relatedProductSkus: ['SSS-HOP-4T1000', 'SSS-SHT-1210', 'SSS-MSH-1210HD'],
  },
  {
    id: 'blog-galvanised-vs-ral5010-vs-raw-steel-finishes',
    title: 'Hot-Dip Galvanised (BS EN ISO 1461) vs RAL 5010 Painted vs Raw Steel: Choosing Your Stillage Finish',
    slug: 'hot-dip-galvanised-vs-ral-5010-painted-steel-stillages',
    excerpt:
      'Compare corrosion protection, lead times, and unit economics across RAL 5010 Gentian Blue industrial paint, BS EN ISO 1461 hot-dip galvanising, custom corporate RAL colours, and raw unpainted mill steel.',
    category: 'Materials & Finishes',
    author: 'Sarah Jenkins',
    authorRole: 'Industrial Storage & Coating Specialist',
    publishedAt: '2026-10-21',
    readingTimeMinutes: 5,
    featured: true,
    heroImage: '/images/products/cantilever-rack-cutout.png',
    backdropStyle: 'white',
    tags: ['RAL 5010', 'Hot-Dip Galvanised', 'BS EN ISO 1461', 'Raw Steel', 'Corrosion Protection'],
    keyTakeaways: [
      'RAL 5010 Stillage Blue is our standard factory coating (£0 modifier), ideal for dry indoor warehouses, machine shops, and 3PL pallet networks.',
      'Hot-Dip Galvanised to BS EN ISO 1461 (+£45/unit) provides total internal and external zinc metallurgical bonding for 25+ years of outdoor yard service.',
      'Raw Unpainted Mill Steel (-£10/unit) reduces capital cost for high-temperature foundry castings, automotive press-shop WIP, or customers with in-house paint lines.',
      'Custom Corporate RAL finishes (+£25/unit) allow colour-coded zone segregation (e.g., Red for Quarantine, Green for Passed QC, Yellow for WIP).',
    ],
    body: `## Matching Surface Protection to Your Operating Environment

Selecting the right protective finish for a fleet of 50 or 100 steel stillages has a direct impact on both upfront capital expenditure and 10-year lifecycle cost. Over-specifying hot-dip galvanising for a heated indoor electronics warehouse wastes budget, while putting standard painted stillages into an exposed coastal builders’ merchant yard leads to premature surface rust at forklift contact points.

## 1. Standard RAL 5010 Gentian (Stillage) Blue — Included as Standard

Our signature **RAL 5010 Stillage Blue** industrial coating is applied in-house across all standard bin stillages, cantilever racks, and post pallets with zero extra lead time.

- **Best suited for:** Heated or dry indoor warehouses, engineering workshops, automotive sub-assembly halls, and closed-loop HGV transport.
- **Operational benefit:** High-contrast blue steel frames stand out clearly against concrete warehouse floors and yellow forklift masts, improving driver visibility during high-bay stacking.

## 2. Hot-Dip Galvanised to BS EN ISO 1461 (+£45.00 Ex. VAT per unit)

Unlike electro-plating or zinc-rich primer paints, full immersion hot-dip galvanising submerges the fully welded stillage in molten zinc at approximately 450°C in accordance with **BS EN ISO 1461**.

- **Complete Internal & External Coverage:** Because the liquid zinc flows inside the 50x50mm box-section tubing through engineered vent holes, the internal walls of the steel frame are just as protected against condensation and rain as the exterior.
- **Self-Healing Cathodic Protection:** When forklift tines or heavy scaffold tubes scrape the surface of a galvanised post pallet, the surrounding zinc sacrifices itself anodically to prevent under-film rust creep.
- **Best suited for:** Outdoor construction yards, scaffolding contractors, civil engineering depots, agricultural storage, and wash-down environments.

## 3. Raw Unpainted Mill Steel (-£10.00 Ex. VAT per unit)

For buyers looking for the lowest unit cost on high-volume stillage runs, we supply any specification in self-colour oiled mill steel, saving **£10.00 per unit** before bulk discounts.

- **Best suited for:** Hot forge and foundry castings (where paint would burn or blister), oily press-shop stampings, or OEMs who powder-coat stillages on their own automated finishing line.

## 4. Custom Corporate RAL Colours (+£25.00 Ex. VAT per unit)

Lean 5S manufacturing facilities frequently use colour-coded stillages to eliminate picking errors—such as **RAL 3020 Traffic Red** for scrap/quarantine bins, **RAL 6024 Traffic Green** for approved stock, or corporate fleet branding for returnable packaging pools.`,
    relatedProductSkus: ['SSS-SHT-1210', 'SSS-CANT-3B8A', 'SSS-PST-1111D'],
  },
  {
    id: 'blog-cantilever-bar-tube-storage-optimisation',
    title: 'Optimising Long Bar, Tube & Extrusion Storage with Double-Sided Cantilever Stillage Racks',
    slug: 'optimising-long-bar-tube-storage-cantilever-stillage-racks',
    excerpt:
      'Discover how portable 2-bay and 3-bay double-sided cantilever bar racks eliminate floor-stacked steel bundle hazards, speed up CNC band saw feeding, and segregate profiles by grade.',
    category: 'Warehouse Optimization',
    author: 'Gareth Davies',
    authorRole: 'Head of Steel Fabrication & Structural Compliance',
    publishedAt: '2026-10-14',
    readingTimeMinutes: 5,
    featured: true,
    heroImage: '/images/products/cantilever-rack-sand.png',
    backdropStyle: 'sand',
    tags: ['Cantilever Racks', 'Bar Storage', 'Saw Station Workflow', '1500kg SWL', 'Forklift Skids'],
    keyTakeaways: [
      'Floor-stacked steel bar bundles waste up to 40% of workshop floor space and create crush/roll hazards during crane or forklift retrieval.',
      'Double-sided cantilever racks with 4 vertical arm tiers segregate up to 8 distinct bar profiles or material grades on a single footprint.',
      'Welded upturned anti-roll safety lugs on every cantilever arm prevent round tube, conduit, and hollow section from rolling off during forklift transport.',
      'Positioning a compact 1800mm 2-Bay Cantilever Stillage directly beside a horizontal band saw cuts operator handling time by over 50%.',
    ],
    body: `## The Hidden Cost of Floor-Stacked Bar and Tube Bundles

In many metal fabrication shops, stockholders, and mechanical engineering works, 3-metre and 6-metre lengths of RHS box section, round bar, hydraulic tubing, and aluminium extrusion are still stored on timber dunnage blocks across the workshop floor. Every time a saw operator needs a single length of 50x50mm box section from the bottom bundle, a forklift or overhead crane has to unstack three tonnes of overlying stock.

Replacing loose floor stacks with portable **Double-Sided Cantilever Bar Stillage Racks** transforms both workshop safety and machine-shop spindle utilisation.

## 3-Bay (2400mm) vs. 2-Bay (1800mm) Cantilever Footprints

We manufacture two core heavy-duty cantilever stillage footprints in 80x80x4mm structural upright box section:

- **3-Bay Double-Sided Cantilever Rack (SSS-CANT-3B8A — 2400 × 1100 × 1450mm):** Features 3 vertical stanchion columns and 24 individual load arms rated to a combined **1,500 kg SWL**. The 2400mm base length supports 3-metre and 6-metre steel lengths with minimal overhang deflection.
- **2-Bay Compact Cantilever Rack (SSS-CANT-2B4A — 1800 × 1050 × 1400mm):** Rated to **1,200 kg SWL**, engineered specifically to sit alongside horizontal CNC band saws, laser tube cutters, or inside 3.5t flatbed transit vans for site installation teams.

## Built-In Anti-Roll Safety & Forklift Portability

Unlike fixed warehouse racking that requires floor bolting and SEMA rack inspections, a portable cantilever stillage rack is built onto a full-perimeter box-section skid base:

- **Upturned Anti-Roll Safety Lugs:** Every 50x50x3mm cantilever arm and base rail terminates in a welded vertical steel retaining lug, ensuring round scaffold tube, copper pipe, and solid bar cannot roll free when the rack is tilted on a forklift mast.
- **Point-of-Use Saw Station Feeding:** Load the entire cantilever rack in the raw materials store via forklift and set it down directly parallel to the band saw infeed roller conveyor.`,
    relatedProductSkus: ['SSS-CANT-3B8A', 'SSS-CANT-2B4A', 'SSS-PST-1111D'],
  },
  {
    id: 'blog-demountable-post-pallets-vs-fixed-bin-stillages',
    title: 'Demountable Post Pallets vs Fixed Bin Stillages: Cutting Return Transport Volume by 75%',
    slug: 'demountable-post-pallets-vs-fixed-bin-stillages-guide',
    excerpt:
      'When should you specify removable-post pallets over solid or mesh-sided bin stillages? We break down empty nesting ratios, 5-high stacking stability, and closed-loop HGV fleet economics.',
    category: 'Buying Guides',
    author: 'Sarah Jenkins',
    authorRole: 'Industrial Storage & Coating Specialist',
    publishedAt: '2026-10-06',
    readingTimeMinutes: 4,
    featured: false,
    heroImage: '/images/products/cantilever-rack-cutout.png',
    backdropStyle: 'white',
    tags: ['Post Pallets', 'Demountable Posts', 'Return Logistics', 'Mesh Stillages', '5-High Stacking'],
    keyTakeaways: [
      'Demountable post pallets feature 4 removable corner posts that nest horizontally on the base deck when empty, reducing return HGV trailer space by 75%.',
      'Fixed solid-sheet and mesh bin stillages are superior for loose castings, pressings, and small components that cannot be unitised on a flat deck.',
      'Half-drop gate mesh cages allow order pickers to access stock manually even when stillages are stacked 4-high in narrow aisles.',
      'Adding enclosed 4-way forklift guide pockets (+£30/unit) ensures safe handling by rough-terrain telehandlers on construction sites.',
    ],
    body: `## Choosing Between Open Post Pallets and Enclosed Bin Stillages

Both post pallets and bin stillages share the same core mission: turning vertical warehouse airspace into dense, modular storage without the permanent cost of fixed pallet racking. However, the right specification depends on whether your load is **self-supporting/palletised** or **loose/granular**, and whether your stillages travel off-site.

## Why Demountable Post Pallets Dominate Closed-Loop Site Logistics

Our **Heavy-Duty Demountable Post Pallet (SSS-PST-1111D)** uses a rigid 1130 × 1130mm steel base frame fitted with four heavy-gauge corner receiver sockets and flared self-locating stacking cups.

- **4:1 Empty Nesting Ratio:** Once unloaded on a construction site or customer depot, operatives simply lift out the four 60x60x3mm vertical corner posts and lay them flat across the base deck. Four demounted post pallets occupy the same height as a single rigid stillage, slashing return haulage costs by up to 75%.
- **5-High Vertical Stacking:** With a 1,000 kg SWL and low 46 kg tare weight, demountable post pallets stack 5-high when loaded with timber packs, bagged aggregate, extrusions, or boxed goods.

## When to Specify Solid Sheet or Half-Drop Mesh Bin Stillages

If you are storing loose metal stampings, automotive castings, rubber mouldings, or boxed ecommerce SKUs, an open post pallet won't contain the load.

- **Solid Sheet Steel Bin Stillages (SSS-SHT-1210):** Built with 2mm corrugated steel sides to contain heavy, sharp, or oily metal components up to 1,000 kg SWL.
- **Mesh Sided Half-Drop Gate Cages (SSS-MSH-1210HD):** Provide 360-degree visual stock checks via 50x50x4mm weldmesh and feature a fold-down front gate so operatives can pick items from stacked tiers without unstacking the column.`,
    relatedProductSkus: ['SSS-PST-1111D', 'SSS-MSH-1210HD', 'SSS-SHT-1210'],
  },
  {
    id: 'blog-hgv-pallet-delivery-tail-lift-offloading-guide',
    title: 'Planning HGV Pallet Delivery, Tail-Lift Offloading & Bulk Tier Discounts for Stillage Orders',
    slug: 'hgv-pallet-delivery-tail-lift-offloading-guide',
    excerpt:
      'How our automated HGV pallet calculator groups up to 4 stillages per pallet space across UK zones A–D, when to book tail-lift offloading, and how 5+ and 10+ bulk price tiers work.',
    category: 'Buying Guides',
    author: 'Gareth Davies',
    authorRole: 'Head of Steel Fabrication & Structural Compliance',
    publishedAt: '2026-09-29',
    readingTimeMinutes: 4,
    featured: false,
    heroImage: '/images/products/stacked-hopper-stillage.png',
    backdropStyle: 'sand',
    tags: ['HGV Pallet Delivery', 'Tail-Lift Offload', 'Bulk Discounts', 'UK VAT Proforma', 'Procurement'],
    keyTakeaways: [
      'Up to 4 standard stillages stack or nest per oversized HGV pallet footprint, meaning ordering in multiples of 4 maximises freight efficiency per unit.',
      'Automatic online trade discounts apply at 5+ units (-5% off configured unit price) and 10+ units (-10% off configured unit price).',
      'Sites without a counterbalance forklift or telehandler can select Lorry Tail-Lift + Pump Truck Offload for a flat £15.00 Ex. VAT surcharge.',
      'Procurement teams can toggle between instant Stripe card checkout and 1-click official UK 20% VAT Proforma Invoices on every product page.',
    ],
    body: `## How Stillage Pallet Multiples Reduce Per-Unit Freight Cost

Because industrial steel stillages and post pallets are engineered to stack or nest cleanly into one another during transit, up to **4 units ship on a single oversized HGV pallet space**.

Our live Rust serverless quote engine automatically calculates your exact pallet count using the formula \`ceil(quantity / 4)\`:

- **1 to 4 Stillages:** Ships on **1 HGV Pallet Space** (e.g., £65.00 in Zone A North West & Wales, or £79.00 across Zone B UK Mainland).
- **5 to 8 Stillages:** Ships on **2 HGV Pallet Spaces** — while simultaneously unlocking our **5% Bulk Tier Discount** on every unit and configuration option.
- **10+ Stillages:** Unlocks our maximum online **10% Trade Tier Discount** across the entire line item, including custom RAL finishes, castors, and forklift pockets.

## Forklift Offload vs. Lorry Tail-Lift Offloading (+£15.00 Ex. VAT)

Standard industrial stillage deliveries arrive on an 18-tonne curtain-sided HGV and are easiest to offload from the side of the trailer using a site counterbalance forklift or telehandler (1,500 kg+ capacity).

However, if your delivery address is a retail depot, university workshop, or urban site without a forklift on hand, simply tick **Require Lorry Tail-Lift & Pump Truck Offload (+£15.00 Ex. VAT)** in the online configurator. We will allocate a tail-lift vehicle and pallet truck so the driver can lower your stillages safely to kerbside level.

## Instant B2B UK VAT Proforma Invoices

Many engineering and construction buyers require a formal VAT Proforma Invoice to raise a purchase order with their accounts payable department before releasing BACS funds. Every product configurator on **stillagestoragesolutions.co.uk** lets you generate an instant, itemised UK 20% VAT Proforma Invoice with a unique reference number alongside standard card checkout.`,
    relatedProductSkus: ['SSS-HOP-4T1000', 'SSS-CANT-3B8A', 'SSS-SHT-1210'],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function toContentfulFields(entry, locale = 'en-US') {
  const fields = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key === 'id') continue;
    fields[key] = { [locale]: value };
  }
  return { fields };
}

async function cmaFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${CMA_TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    ...(options.headers || {}),
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 429) {
      const waitSec = Number(res.headers.get('x-contentful-ratelimit-reset')) || 2;
      await sleep(waitSec * 1000 + 300);
      continue;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error(`CMA ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${text}`);
    }
    return data;
  }
}

async function upsertAndPublishContentType(envPath, contentTypeDef) {
  const { id, ...body } = contentTypeDef;
  const ctPath = `${envPath}/content_types/${id}`;
  let existing = null;
  try {
    existing = await cmaFetch(ctPath);
  } catch {
    existing = null;
  }

  const headers = existing ? { 'X-Contentful-Version': String(existing.sys.version) } : {};
  const saved = await cmaFetch(ctPath, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  await cmaFetch(`${ctPath}/published`, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(saved.sys.version) },
  });
  console.log(`Published Contentful content type: ${id} (${body.name})`);
}

async function upsertAndPublishEntry(envPath, contentTypeId, entryData, locale = 'en-US') {
  const entryPath = `${envPath}/entries/${entryData.id}`;
  let existing = null;
  try {
    existing = await cmaFetch(entryPath);
  } catch {
    existing = null;
  }

  const headers = {
    'X-Contentful-Content-Type': contentTypeId,
    ...(existing ? { 'X-Contentful-Version': String(existing.sys.version) } : {}),
  };

  const saved = await cmaFetch(entryPath, {
    method: 'PUT',
    headers,
    body: JSON.stringify(toContentfulFields(entryData, locale)),
  });

  await cmaFetch(`${entryPath}/published`, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(saved.sys.version) },
  });
  console.log(`Published ${contentTypeId} entry: ${entryData.id} (${entryData.slug})`);
}

async function main() {
  if (!CMA_TOKEN) {
    console.error('Error: Please set CONTENTFUL_MANAGEMENT_TOKEN in your environment.');
    process.exit(1);
  }

  const spacesRes = await cmaFetch('/spaces');
  const spaces = spacesRes.items || [];
  const space = spaces.find((s) => s.sys.id === TARGET_SPACE_ID) || spaces[0];
  if (!space) throw new Error('No Contentful spaces found.');
  console.log(`Connected to Contentful space: ${space.name} (${space.sys.id})`);

  const envPath = `/spaces/${space.sys.id}/environments/${ENVIRONMENT_ID}`;
  const localesRes = await cmaFetch(`${envPath}/locales`);
  const defaultLocale =
    (localesRes.items || []).find((l) => l.default)?.code || 'en-US';

  await upsertAndPublishContentType(envPath, BLOG_POST_CONTENT_TYPE);

  for (const post of SEED_BLOG_ENTRIES) {
    await upsertAndPublishEntry(envPath, BLOG_POST_CONTENT_TYPE.id, post, defaultLocale);
  }

  console.log(`Successfully synced ${SEED_BLOG_ENTRIES.length} blogPost entries to Contentful.`);
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
