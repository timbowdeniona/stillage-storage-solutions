import { BlogPost, Category, FinishOption, MobilityOption, Product } from '@/types/catalog';

export const FINISH_OPTIONS: FinishOption[] = [
  {
    id: 'standard-blue',
    name: 'RAL 5010 Stillage Blue (Standard)',
    code: 'RAL 5010',
    swatchHex: '#145DA0',
    priceModifierPence: 0,
    leadTimeNote: 'Standard factory finish — no extra lead time',
  },
  {
    id: 'raw-steel',
    name: 'Raw Unpainted Mill Steel',
    code: 'RAW-MILL',
    swatchHex: '#5A636E',
    priceModifierPence: -1000,
    leadTimeNote: 'Supplied oiled/self-colour (-£10.00 per unit)',
  },
  {
    id: 'custom-ral',
    name: 'Custom Corporate RAL Finish',
    code: 'RAL-CUST',
    swatchHex: '#0F2342',
    priceModifierPence: 2500,
    leadTimeNote: 'Painted to your corporate RAL specification (+3 days)',
  },
  {
    id: 'galvanised',
    name: 'Hot-Dip Galvanised (BS EN ISO 1461)',
    code: 'HDG-1461',
    swatchHex: '#B6C0CB',
    priceModifierPence: 4500,
    leadTimeNote: 'External corrosion protection (+5 working days)',
  },
];

export const MOBILITY_OPTIONS: MobilityOption[] = [
  {
    id: 'standard-feet',
    name: 'Standard Pressed Steel Stacking Feet',
    description: 'Self-centring flared steel pyramid/cup feet for safe multi-tier vertical stacking.',
    priceModifierPence: 0,
  },
  {
    id: 'forklift-pockets',
    name: 'Enclosed 4-Way Forklift Guide Pockets',
    description: 'Welded captive box-section base channels for secure telehandler and rough-terrain forklift lifting.',
    priceModifierPence: 3000,
  },
  {
    id: 'heavy-duty-castors',
    name: '4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed)',
    description: '150mm polyurethane-tyred industrial castors mounted inset to preserve stackability.',
    priceModifierPence: 5500,
  },
  {
    id: 'both-castors-pockets',
    name: 'Castors + Enclosed Forklift Guide Pockets',
    description: 'Full workshop mobility combined with captive forklift lifting channels.',
    priceModifierPence: 8000,
  },
];

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-cantilever-racks',
    title: 'Cantilever & Bar Storage Racks',
    slug: 'cantilever-bar-racks',
    description:
      'Heavy-duty multi-tier double-sided cantilever racks engineered for long steel bar, tube, conduit, and extrusions.',
    badgeText: 'Best Seller',
    imageUrl: '/images/products/cantilever-rack-cutout.png',
    displayOrder: 1,
  },
  {
    id: 'cat-hopper-stillages',
    title: 'Stackable Hopper & Bin Stillages',
    slug: 'hopper-bin-stillages',
    description:
      'Multi-tier modular hopper feed towers, self-discharging bulk bins, and solid-sheet stackable stillages with pressed steel feet.',
    badgeText: 'Modular 4-High',
    imageUrl: '/images/products/stacked-hopper-stillage.png',
    displayOrder: 2,
  },
  {
    id: 'cat-sheet-stillages',
    title: 'Solid Sheet Steel Stillages',
    slug: 'sheet-stillages',
    description:
      'Fully welded corrugated or flat sheet steel sided stillages with drop-front options for loose components and heavy castings.',
    badgeText: '1000kg+ SWL',
    imageUrl: '/images/products/stacked-hopper-stillage.png',
    displayOrder: 3,
  },
  {
    id: 'cat-mesh-stillages',
    title: 'Mesh Cages & Folding Stillages',
    slug: 'mesh-stillages',
    description:
      'High-visibility 50x50mm welded steel mesh cages and lockable security stillages for warehouse and site storage.',
    badgeText: 'High Visibility',
    imageUrl: '/images/products/cantilever-rack-sand.png',
    displayOrder: 4,
  },
  {
    id: 'cat-post-pallets',
    title: 'Post Pallets & Pipe Cradles',
    slug: 'post-pallets',
    description:
      'Fixed and demountable-leg post pallets with heavy-duty flared stacking cups and optional forklift guide pockets.',
    badgeText: 'Space Saving',
    imageUrl: '/images/products/cantilever-rack-cutout.png',
    displayOrder: 5,
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-triple-cantilever-rack',
    title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
    slug: '3-bay-double-sided-cantilever-bar-rack',
    sku: 'SSS-CANT-3B8A',
    categorySlug: 'cantilever-bar-racks',
    categoryName: 'Cantilever & Bar Storage Racks',
    shortDescription:
      'Triple-upright double-sided steel cantilever stillage with 4 arm levels per column and anti-roll end stops for bar, pipe, and timber.',
    fullDescription:
      'Engineered in heavy-gauge British box section steel, our 3-Bay Double-Sided Cantilever Bar Stillage provides 24 individual load arms across four vertical tiers. Each arm features welded upturned safety lugs to prevent round tube, scaffolding, or steel bar stock from rolling off during forklift transport. Finished in tough industrial RAL 5010 Gentian Blue.',
    basePriceExVatPence: 38500,
    swlKg: 1500,
    externalLengthMm: 2400,
    externalWidthMm: 1100,
    externalHeightMm: 1450,
    unitWeightKg: 118,
    stackableHeight: 'Base Skid Framed',
    steelSpecification: '80x80x4mm Upright / 50x50x3mm Arms',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: true,
    primaryImage: '/images/products/cantilever-rack-cutout.png',
    secondaryImage: '/images/products/cantilever-rack-sand.png',
    technicalDrawing: '/images/products/sss-cant-3b8a-blueprint.jpg',
    gallery: [
      '/images/products/cantilever-rack-sand.png',
      '/images/products/base-render-sss-cant-3b8a.jpg',
      '/images/products/stacked-hopper-stillage.png',
    ],
    editableBlueprintSvg: '/images/blueprints/sss-cant-3b8a-editable.svg',
    backdropStyle: 'sand',
    highlights: [
      '3 Heavy-duty vertical stanchions with 4 double-sided arm tiers',
      'Welded anti-roll upturned safety end lugs on every arm and base rail',
      'Full perimeter box-section base frame for 4-way forklift handling',
      '1,500 kg Safe Working Load (SWL) evenly distributed',
    ],
  },
  {
    id: 'prod-modular-hopper-tower',
    title: 'Modular 4-Tier Stackable Hopper & Bin Stillage System',
    slug: 'modular-4-tier-stackable-hopper-bin-stillage',
    sku: 'SSS-HOP-4T1000',
    categorySlug: 'hopper-bin-stillages',
    categoryName: 'Stackable Hopper & Bin Stillages',
    shortDescription:
      '4-high interlocking steel bin and top-feed conical hopper stillage tower with pressed pyramid stacking feet and forklift base channels.',
    fullDescription:
      'Designed for high-density aggregate, component, and bulk material processing, this modular stackable stillage system combines an open forklift-pocket base frame, deep solid-sheet steel bin cages, and a top-mounted gravity feed hopper with safety mesh guard. Heavy-duty pressed steel stacking cups lock each unit securely up to 4 units high.',
    basePriceExVatPence: 54000,
    swlKg: 1000,
    externalLengthMm: 1200,
    externalWidthMm: 1200,
    externalHeightMm: 2650,
    unitWeightKg: 165,
    stackableHeight: '4-High Interlocking',
    steelSpecification: '50x50x3mm RHS + 2.5mm Sheet Steel',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: true,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    secondaryImage: '/images/products/cantilever-rack-cutout.png',
    technicalDrawing: '/images/products/bbfh2-1-blueprint.jpg',
    gallery: [
      '/images/products/cantilever-rack-cutout.png',
      '/images/products/cantilever-rack-sand.png',
      '/images/products/base-render-bbfh2-1.jpg',
    ],
    backdropStyle: 'white',
    highlights: [
      'Self-centring pressed steel pyramid stacking feet & receiver cups',
      'Integrated bottom forklift guide hoops for safe mast positioning',
      'Top conical gravity hopper with upper mesh safety enclosure',
      '1,000 kg SWL per tier — tested for 4-high vertical stacking',
    ],
  },
  {
    id: 'prod-solid-sheet-stillage-1200',
    title: 'Heavy-Duty Solid Sheet Steel Bin Stillage (1200 x 1000mm)',
    slug: 'heavy-duty-solid-sheet-steel-bin-stillage-1200x1000',
    sku: 'SSS-SHT-1210',
    categorySlug: 'sheet-stillages',
    categoryName: 'Solid Sheet Steel Stillages',
    shortDescription:
      'Standard UK footprint solid-sided steel bin stillage with reinforced base ribs and pressed stacking feet. 1000kg SWL.',
    fullDescription:
      'Our flagship solid sheet steel stillage is built for demanding foundry, press-shop, and construction environments. Constructed from 50x50x3mm box section corner posts and 2mm corrugated steel side panels, it stacks 4-high at full 1,000 kg capacity.',
    basePriceExVatPence: 18900,
    swlKg: 1000,
    externalLengthMm: 1200,
    externalWidthMm: 1000,
    externalHeightMm: 900,
    unitWeightKg: 68,
    stackableHeight: '4-High Stackable',
    steelSpecification: '50x50x3mm Box + 2mm Sheet Panels',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Next Day / 48hr Pallet Dispatch',
    featured: true,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    secondaryImage: '/images/products/cantilever-rack-sand.png',
    technicalDrawing: '/images/products/sss-msh-1210hd-blueprint.jpg',
    gallery: [
      '/images/products/cantilever-rack-sand.png',
      '/images/products/cantilever-rack-cutout.png',
      '/images/products/base-render-sss-msh-1210hd.jpg',
    ],
    backdropStyle: 'sand',
    highlights: [
      'Standard 1200 x 1000mm Euro/UK industrial footprint',
      'Optional half-drop front gate or heavy-duty swivel castors',
      'Stacks 4-high fully loaded to maximize warehouse floor space',
      'Available in RAL 5010 Blue, Raw Unpainted, or Hot-Dip Galvanised',
    ],
  },
  {
    id: 'prod-half-drop-mesh-cage',
    title: 'Mesh Sided Half-Drop Gate Stillage Cage (1200 x 1000 x 900mm)',
    slug: 'mesh-sided-half-drop-gate-stillage-cage',
    sku: 'SSS-MSH-1210HD',
    categorySlug: 'mesh-stillages',
    categoryName: 'Mesh Cages & Folding Stillages',
    shortDescription:
      '50x50mm welded steel mesh stillage with ergonomic half-drop front access gate for order picking while stacked.',
    fullDescription:
      'Combining 360-degree stock visibility with 1,000 kg structural rigidity, our Mesh Sided Half-Drop Gate Stillage allows warehouse operatives to pick components even when cages are stacked 4-high. Heavy-duty bolt latches keep the front gate rattle-free in transit.',
    basePriceExVatPence: 17400,
    swlKg: 1000,
    externalLengthMm: 1200,
    externalWidthMm: 1000,
    externalHeightMm: 900,
    unitWeightKg: 59,
    stackableHeight: '4-High Stackable',
    steelSpecification: '50x50x3mm RHS + 50x50x4mm Weldmesh',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: true,
    primaryImage: '/images/products/cantilever-rack-sand.png',
    secondaryImage: '/images/products/cantilever-rack-cutout.png',
    technicalDrawing: '/images/products/sss-msh-1210hd-blueprint.jpg',
    gallery: [
      '/images/products/base-render-sss-msh-1210hd.jpg',
      '/images/products/cantilever-rack-cutout.png',
      '/images/products/stacked-hopper-stillage.png',
    ],
    editableBlueprintSvg: '/images/blueprints/sss-msh-1210hd-editable.svg',
    backdropStyle: 'white',
    highlights: [
      'Fold-down half front gate for accessible picking when stacked',
      '50x50x4mm heavy-gauge welded wire mesh sides',
      'Reinforced sheet steel floor over box-section crossbearers',
      'Compatible with 360-degree lockable polyurethane castors',
    ],
  },
  {
    id: 'prod-post-pallet-demountable',
    title: 'Heavy-Duty Post Pallet with Demountable Corner Posts (1130 x 1130mm)',
    slug: 'heavy-duty-post-pallet-demountable-posts',
    sku: 'SSS-PST-1111D',
    categorySlug: 'post-pallets',
    categoryName: 'Post Pallets & Pipe Cradles',
    shortDescription:
      'Open-sided stackable steel post pallet with 4 removable corner posts and flared self-locating cup feet.',
    fullDescription:
      'Ideal for storing scaffold tube, timber packs, extrusions, and palletised goods, our Demountable Post Pallet features four removable 60x60mm vertical posts that nest neatly on the base deck when empty, cutting return transport and idle storage volume by 75%.',
    basePriceExVatPence: 14200,
    swlKg: 1000,
    externalLengthMm: 1130,
    externalWidthMm: 1130,
    externalHeightMm: 1050,
    unitWeightKg: 46,
    stackableHeight: '5-High Stackable',
    steelSpecification: '60x60x3mm Posts / 50x50x3mm Base',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 1–2 Working Days',
    featured: false,
    primaryImage: '/images/products/cantilever-rack-cutout.png',
    secondaryImage: '/images/products/stacked-hopper-stillage.png',
    technicalDrawing: '/images/products/sss-cant-3b8a-blueprint.jpg',
    gallery: [
      '/images/products/cantilever-rack-sand.png',
      '/images/products/stacked-hopper-stillage.png',
    ],
    backdropStyle: 'sand',
    highlights: [
      '4 Demountable corner posts reduce empty storage height by 75%',
      'Available with 1000mm, 1200mm, or 1500mm post heights',
      'Heavy-duty pressed steel stacking cups for 5-high stability',
      'Optional 4-way enclosed forklift pockets for site telehandlers',
    ],
  },
  {
    id: 'prod-double-bay-cantilever-rack',
    title: '2-Bay Compact Cantilever Bar & Tube Stillage (1800mm Long)',
    slug: '2-bay-compact-cantilever-bar-tube-stillage',
    sku: 'SSS-CANT-2B4A',
    categorySlug: 'cantilever-bar-racks',
    categoryName: 'Cantilever & Bar Storage Racks',
    shortDescription:
      'Twin-upright double-sided cantilever bar rack with forklift base pockets for workshop sawing stations and van loading.',
    fullDescription:
      'A compact 1800mm footprint variation of our popular 3-Bay Cantilever Rack, engineered specifically to sit beside horizontal band saws and CNC machining centres. Holds up to 1,200 kg of steel box section, round bar, or plastic extrusions across 4 arm levels.',
    basePriceExVatPence: 29500,
    swlKg: 1200,
    externalLengthMm: 1800,
    externalWidthMm: 1050,
    externalHeightMm: 1400,
    unitWeightKg: 86,
    stackableHeight: 'Base Skid Framed',
    steelSpecification: '80x80x4mm Upright / 50x50x3mm Arms',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: false,
    primaryImage: '/images/products/cantilever-rack-sand.png',
    secondaryImage: '/images/products/cantilever-rack-cutout.png',
    technicalDrawing: '/images/products/sss-cant-3b8a-blueprint.jpg',
    gallery: [
      '/images/products/cantilever-rack-cutout.png',
      '/images/products/base-render-sss-cant-3b8a.jpg',
    ],
    backdropStyle: 'sand',
    highlights: [
      'Compact 1800mm length fits workshop saw bays and flatbed transits',
      'Double-sided load arms keep multiple bar profiles segregated',
      'Integrated forklift base skids with end retaining lugs',
      '1,200 kg certified Safe Working Load',
    ],
  },
  {
    id: 'prod-bulk-bag-filling-hopper',
    title: 'Free Standing Bulk Bag Filling Hopper with Stand (BBFH2-1)',
    slug: 'free-standing-bulk-bag-filling-hopper-with-stand',
    sku: 'BBFH2-1',
    categorySlug: 'hopper-bin-stillages',
    categoryName: 'Stackable Hopper & Bin Stillages',
    shortDescription:
      'Two-part modular bulk bag filling hopper and 1250mm support stand with 200x200mm flush bottom opening, bag loop hooks, and 665mm-centre forklift pockets.',
    fullDescription:
      'Engineered from heavy-duty 50x50mm British box section steel with 30x30mm hopper support legs, the BBFH2-1 Free Standing Bulk Bag Filling Hopper with Stand provides a 1120 × 1120 × 1850mm assembled footprint (1080mm foot centres) for rapid FIBC bulk bag filling. The upper 600mm hopper unit (450mm funnel + 150mm stacking collar) tapers to a flush 200 × 200mm bottom opening and locks onto the 1250mm lower stand via self-centring pressed steel pyramid cups. Available with castors, captive 165 × 75mm forklift pockets (665mm centres), or both.',
    basePriceExVatPence: 46500,
    swlKg: 1000,
    externalLengthMm: 1120,
    externalWidthMm: 1120,
    externalHeightMm: 1850,
    unitWeightKg: 132,
    stackableHeight: '2-Part Interlocking',
    steelSpecification: '50x50mm Stand & Frame / 30x30mm Hopper Legs',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: true,
    primaryImage: '/images/products/base-render-bbfh2-1.jpg',
    secondaryImage: '/images/products/stacked-hopper-stillage.png',
    technicalDrawing: '/images/products/bbfh2-1-blueprint.jpg',
    gallery: [
      '/images/products/stacked-hopper-stillage.png',
      '/images/products/cantilever-rack-sand.png',
      '/images/products/cantilever-rack-cutout.png',
    ],
    editableBlueprintSvg: '/images/blueprints/bbfh2-1-editable.svg',
    backdropStyle: 'white',
    highlights: [
      'Flush 200 x 200mm bottom opening on 600mm modular top hopper (450mm cone + 150mm collar)',
      '1250mm tall 50x50mm box-section stand with 1080mm foot centres and FIBC bag loop hooks',
      'Captive 165 x 75mm forklift pockets set at 665mm centres',
      'Option of heavy-duty castors or forklift pockets (either or both)',
    ],
  },
];

export const SEED_BLOG_POSTS: BlogPost[] = [
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
