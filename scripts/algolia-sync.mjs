// Algolia Free-Tier Maximization Sync Script:
// Configures Primary Index, Sorting Replicas, Synonyms, Programmable Query Rules,
// Enriched Variant Pricing Attributes, and Federated Technical Articles Index.
// Run with: npm run algolia:sync

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_BLOG_ENTRIES } from './contentful-sync.mjs';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

export function getReplicaIndexNames(baseIndexName = 'stillage_products') {
  return {
    priceAsc: `${baseIndexName}_price_asc`,
    priceDesc: `${baseIndexName}_price_desc`,
    swlDesc: `${baseIndexName}_swl_desc`,
  };
}

export const ALGOLIA_INDEX_SETTINGS = {
  searchableAttributes: [
    'unordered(sku)',
    'unordered(title)',
    'unordered(categoryName)',
    'unordered(shortDescription)',
    'unordered(highlights)',
    'unordered(steelSpecification)',
    'unordered(dimensionsText)',
    'unordered(footprintMm)',
    'unordered(useCases)',
    'unordered(environmentTags)',
    'unordered(availableFinishes)',
    'unordered(availableMobility)',
    'unordered(fullDescription)',
  ],
  attributesForFaceting: [
    'searchable(id)',
    'searchable(sku)',
    'searchable(categorySlug)',
    'searchable(categoryName)',
    'searchable(footprintMm)',
    'searchable(stackableHeight)',
    'searchable(standardFinish)',
    'searchable(compatibleSkus)',
    'searchable(environmentTags)',
    'searchable(availableFinishes)',
    'searchable(availableMobility)',
    'filterOnly(inStock)',
    'filterOnly(ukcaCertified)',
    'filterOnly(swlKg)',
    'filterOnly(basePriceExVatPence)',
  ],
  customRanking: ['desc(featured)', 'desc(inStock)', 'desc(swlKg)'],
  attributesToHighlight: [
    'title',
    'sku',
    'shortDescription',
    'steelSpecification',
    'footprintMm',
    'highlights',
  ],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
};

export const ALGOLIA_ARTICLES_SETTINGS = {
  searchableAttributes: [
    'unordered(title)',
    'unordered(tags)',
    'unordered(keyTakeaways)',
    'unordered(excerpt)',
    'unordered(category)',
    'unordered(relatedProductSkus)',
    'unordered(body)',
  ],
  attributesForFaceting: [
    'searchable(category)',
    'searchable(tags)',
    'searchable(relatedProductSkus)',
    'filterOnly(featured)',
  ],
  customRanking: ['desc(featured)', 'desc(readingTimeMinutes)'],
  attributesToHighlight: ['title', 'excerpt', 'tags', 'keyTakeaways'],
  attributesToSnippet: ['excerpt:24', 'body:24'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
};

export const ALGOLIA_SYNONYMS = [
  {
    objectID: 'syn-stillage-cage-bin',
    type: 'synonym',
    synonyms: ['stillage', 'stillages', 'cage', 'cages', 'bin', 'bins', 'tote'],
  },
  {
    objectID: 'syn-cantilever-bar-rack',
    type: 'synonym',
    synonyms: [
      'cantilever',
      'bar rack',
      'tube rack',
      'pipe rack',
      'extrusion rack',
      'band saw rack',
    ],
  },
  {
    objectID: 'syn-post-pallet',
    type: 'synonym',
    synonyms: ['post pallet', 'demountable pallet', 'stacking pallet', 'pipe cradle'],
  },
  {
    objectID: 'syn-galvanised-outdoor',
    type: 'synonym',
    synonyms: [
      'galvanised',
      'galvanized',
      'hdg',
      'iso 1461',
      'outdoor',
      'rust proof',
      'weatherproof',
    ],
  },
  {
    objectID: 'syn-swl-capacity',
    type: 'synonym',
    synonyms: ['swl', 'safe working load', 'capacity', 'udl', 'load rating'],
  },
  {
    objectID: 'syn-castors-wheels',
    type: 'synonym',
    synonyms: ['castors', 'casters', 'wheels', 'mobile', 'trolley'],
  },
  {
    objectID: 'syn-telehandler-pockets',
    type: 'synonym',
    synonyms: ['telehandler', 'forklift pockets', '4-way pockets', 'captive pockets'],
  },
];

export const ALGOLIA_QUERY_RULES = [
  {
    objectID: 'rule-outdoor-galvanised',
    description:
      'Surface BS EN ISO 1461 Hot-Dip Galvanised engineering banner on outdoor/corrosion queries',
    conditions: [
      { anchoring: 'contains', pattern: 'outdoor', alternatives: true },
      { anchoring: 'contains', pattern: 'yard' },
      { anchoring: 'contains', pattern: 'corrosion' },
    ],
    consequence: {
      userData: {
        bannerType: 'hdg-iso-1461',
        badge: 'BS EN ISO 1461 CORROSION ADVISORY',
        title: 'Outdoor & Yard Specification: Hot-Dip Galvanised (+£45/unit)',
        description:
          'Full-immersion molten zinc coating protects internal and external box-section walls for 25+ years of outdoor yard service.',
        ctaText: 'Read Galvanised vs RAL 5010 Guide',
        ctaHref: '/blog/hot-dip-galvanised-vs-ral-5010-painted-steel-stillages',
        autoConfigFinish: 'galvanised',
      },
    },
  },
  {
    objectID: 'rule-crane-loler-bespoke',
    description:
      'Surface LOLER 1998 crane lifting & bespoke CAD brief banner when crane/bespoke terms are searched',
    conditions: [
      { anchoring: 'contains', pattern: 'crane' },
      { anchoring: 'contains', pattern: 'loler' },
      { anchoring: 'contains', pattern: 'hoist' },
      { anchoring: 'contains', pattern: 'bespoke' },
      { anchoring: 'contains', pattern: 'custom' },
    ],
    consequence: {
      userData: {
        bannerType: 'loler-bespoke-cad',
        badge: 'LOLER 1998 & BESPOKE CAD',
        title: 'Overhead Crane-Lifting Lugs & Custom Footprint Fabrication',
        description:
          'Crane-slung stillages require certified top lifting eyes under LOLER 1998. Use our AI Steel Engineer above to generate an instant CAD specification sheet.',
        ctaText: 'Open AI Bespoke CAD Engineer',
        ctaAction: 'open-ai-advisor',
      },
    },
  },
  {
    objectID: 'rule-saw-station-cantilever',
    description:
      'Promote 3-Bay and 2-Bay Cantilever Bar Racks on saw-station and bar/tube storage queries',
    conditions: [{ anchoring: 'contains', pattern: 'cantilever', alternatives: true }],
    consequence: {
      promote: [
        { objectID: 'prod-triple-cantilever-rack', position: 0 },
        { objectID: 'prod-double-bay-cantilever-rack', position: 1 },
      ],
      userData: {
        bannerType: 'cantilever-saw-station',
        badge: 'SAW STATION & BAR STORAGE',
        title: 'Double-Sided Cantilever Bar & Tube Racks (1,200kg–1,500kg SWL)',
        description:
          'Segregate up to 8 bar or extrusion grades on a single forklift-portable footprint with upturned anti-roll safety lugs.',
        ctaText: 'Read Bar Storage Guide',
        ctaHref: '/blog/optimising-long-bar-tube-storage-cantilever-stillage-racks',
      },
    },
  },
];

// Algolia Free (Build) tier allows up to 3 Manual Query Rules per index.
// Distributing federated merchandising rules onto `stillage_articles` unlocks up to 6 total server-side rules!
export const ALGOLIA_ARTICLES_QUERY_RULES = [
  {
    objectID: 'rule-bulk-pallet-fleet',
    description:
      'Surface HGV 4-unit pallet consolidation and 5%-10% trade bulk discount banner',
    conditions: [
      { anchoring: 'contains', pattern: 'bulk' },
      { anchoring: 'contains', pattern: 'discount' },
      { anchoring: 'contains', pattern: 'trade' },
      { anchoring: 'contains', pattern: 'fleet' },
      { anchoring: 'contains', pattern: 'hgv' },
    ],
    consequence: {
      userData: {
        bannerType: 'bulk-pallet-fleet',
        badge: 'TRADE FLEET ECONOMICS',
        title: '4 Stillages per HGV Pallet Space + Up to 10% Automatic Trade Discount',
        description:
          'Up to 4 stillages stack on 1 oversized HGV pallet space. Unlock 5% Off on 5+ units and 10% Off on 10+ units automatically online.',
        ctaText: 'View HGV Freight & Bulk Guide',
        ctaHref: '/blog/hgv-pallet-delivery-tail-lift-offloading-guide',
      },
    },
  },
];

export const SEED_ALGOLIA_PRODUCTS = [
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
    backdropStyle: 'sand',
    highlights: [
      '3 Heavy-duty vertical stanchions with 4 double-sided arm tiers',
      'Welded anti-roll upturned safety end lugs on every arm and base rail',
      'Full perimeter box-section base frame for 4-way forklift handling',
      '1,500 kg Safe Working Load (SWL) evenly distributed',
    ],
    compatibleSkus: ['SSS-CANT-2B4A', 'SSS-PST-1111D', 'SSS-SHT-1210'],
    useCases: [
      '6m steel bar storage',
      'long tube and pipe rack',
      'RHS box section storage',
      'extrusion rack',
      'scaffold tube storage',
      'double sided cantilever rack',
    ],
    environmentTags: [
      'indoor fabrication shop',
      'outdoor yard galvanised',
      'forklift skid base',
      '1500kg heavy duty',
    ],
    recommendedFinishIds: ['standard-blue', 'galvanised'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
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
    compatibleSkus: ['SSS-SHT-1210', 'SSS-MSH-1210HD', 'SSS-PST-1111D'],
    useCases: [
      'gravity feed hopper',
      'bulk aggregate dispensing',
      '4-high modular bin tower',
      'fastener and casting hopper',
      'interlocking bin stillage',
    ],
    environmentTags: [
      'high density warehouse',
      '4-high stacking',
      'forklift guide hoops',
      'ukca certified',
    ],
    recommendedFinishIds: ['standard-blue', 'galvanised', 'raw-steel'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
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
    compatibleSkus: ['SSS-MSH-1210HD', 'SSS-HOP-4T1000', 'SSS-PST-1111D'],
    useCases: [
      'heavy metal castings',
      'oily press shop stampings',
      'scrap metal bin',
      'solid sheet steel tote',
      'automotive WIP bin',
      '1200x1000 euro footprint stillage',
    ],
    environmentTags: [
      'foundry raw steel',
      'outdoor yard galvanised',
      'indoor warehouse',
      '4-high stackable',
    ],
    recommendedFinishIds: ['standard-blue', 'raw-steel', 'galvanised'],
    recommendedMobilityIds: ['standard-feet', 'forklift-pockets', 'heavy-duty-castors'],
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
    backdropStyle: 'white',
    highlights: [
      'Fold-down half front gate for accessible picking when stacked',
      '50x50x4mm heavy-gauge welded wire mesh sides',
      'Reinforced sheet steel floor over box-section crossbearers',
      'Compatible with 360-degree lockable polyurethane castors',
    ],
    compatibleSkus: ['SSS-SHT-1210', 'SSS-HOP-4T1000', 'SSS-PST-1111D'],
    useCases: [
      'order picking cage',
      'half drop gate mesh stillage',
      'visible stock storage',
      'warehouse aisle picking',
      'boxed component cage',
      '1200x1000 inter-stacking cage',
    ],
    environmentTags: [
      '3PL logistics warehouse',
      'order picking',
      'high visibility mesh',
      '4-high stackable',
    ],
    recommendedFinishIds: ['standard-blue', 'custom-ral', 'galvanised'],
    recommendedMobilityIds: ['heavy-duty-castors', 'standard-feet', 'both-castors-pockets'],
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
    backdropStyle: 'sand',
    highlights: [
      '4 Demountable corner posts reduce empty storage height by 75%',
      'Available with 1000mm, 1200mm, or 1500mm post heights',
      'Heavy-duty pressed steel stacking cups for 5-high stability',
      'Optional 4-way enclosed forklift pockets for site telehandlers',
    ],
    compatibleSkus: ['SSS-CANT-3B8A', 'SSS-SHT-1210', 'SSS-MSH-1210HD'],
    useCases: [
      'returnable transport packaging',
      'demountable post pallet',
      'collapsible corner posts',
      'construction site telehandler pallet',
      'timber and extrusion pallet',
      '5-high stackable pallet',
    ],
    environmentTags: [
      'outdoor construction site',
      'return HGV fleet',
      'telehandler handling',
      'space saving',
    ],
    recommendedFinishIds: ['galvanised', 'standard-blue'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
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
    technicalDrawing: '/images/products/sss-msh-1210hd-blueprint.jpg',
    gallery: [
      '/images/products/base-render-sss-msh-1210hd.jpg',
      '/images/products/cantilever-rack-cutout.png',
      '/images/products/stacked-hopper-stillage.png',
    ],
    backdropStyle: 'sand',
    highlights: [
      'Compact 1800mm length fits workshop saw bays and flatbed transits',
      'Double-sided load arms keep multiple bar profiles segregated',
      'Integrated forklift base skids with end retaining lugs',
      '1,200 kg certified Safe Working Load',
    ],
    compatibleSkus: ['SSS-CANT-3B8A', 'SSS-PST-1111D', 'SSS-MSH-1210HD'],
    useCases: [
      'band saw station rack',
      'CNC tube laser infeed',
      '3m bar and conduit storage',
      'transit van loading rack',
      'compact cantilever stillage',
    ],
    environmentTags: [
      'machine shop',
      'saw station workflow',
      'forklift base pockets',
      '1200kg swl',
    ],
    recommendedFinishIds: ['standard-blue', 'custom-ral'],
    recommendedMobilityIds: ['forklift-pockets', 'heavy-duty-castors'],
  },
];

export function buildAlgoliaProductRecord(product) {
  return {
    ...product,
    objectID: product.id,
    footprintMm: `${product.externalLengthMm}x${product.externalWidthMm}`,
    dimensionsText: `${product.externalLengthMm}x${product.externalWidthMm}x${product.externalHeightMm}mm`,
    bulkPrice5PlusExVatPence: Math.round(product.basePriceExVatPence * 0.95),
    bulkPrice10PlusExVatPence: Math.round(product.basePriceExVatPence * 0.9),
    availableFinishes: [
      'RAL 5010 Stillage Blue (Standard)',
      'Raw Unpainted Mill Steel',
      'Custom Corporate RAL Finish',
      'Hot-Dip Galvanised (BS EN ISO 1461)',
    ],
    availableMobility: [
      'Standard Pressed Steel Stacking Feet',
      'Enclosed 4-Way Forklift Guide Pockets',
      '4x Heavy-Duty Lockable Castors',
      'Castors + Enclosed Forklift Guide Pockets',
    ],
    palletsPer4Units: 1,
  };
}

export function buildAlgoliaArticleRecord(post) {
  return {
    objectID: post.id,
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    readingTimeMinutes: post.readingTimeMinutes,
    publishedAt: post.publishedAt,
    featured: Boolean(post.featured),
    tags: post.tags || [],
    keyTakeaways: post.keyTakeaways || [],
    relatedProductSkus: post.relatedProductSkus || [],
    body: post.body || '',
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForAlgoliaTask(appId, adminKey, indexName, taskID) {
  if (!taskID) return;
  for (let i = 0; i < 25; i++) {
    const res = await fetch(
      `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}/task/${taskID}`,
      {
        headers: {
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': adminKey,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'published') return;
    }
    await sleep(300);
  }
}

export async function syncAlgoliaIndex({
  appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  adminKey = process.env.ALGOLIA_ADMIN_API_KEY,
  indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'stillage_products',
  articlesIndexName = process.env.NEXT_PUBLIC_ALGOLIA_ARTICLES_INDEX_NAME || 'stillage_articles',
} = {}) {
  if (!appId || !adminKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY in environment.'
    );
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Algolia-Application-Id': appId,
    'X-Algolia-API-Key': adminKey,
  };

  const replicas = getReplicaIndexNames(indexName);

  // 1. Configure Primary Product Index Settings + Sorting Replicas
  const primarySettings = {
    ...ALGOLIA_INDEX_SETTINGS,
    replicas: [replicas.priceAsc, replicas.priceDesc, replicas.swlDesc],
  };

  const settingsRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}/settings`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(primarySettings),
    }
  );
  if (!settingsRes.ok) {
    const errText = await settingsRes.text();
    throw new Error(`Algolia settings update failed (${settingsRes.status}): ${errText}`);
  }
  const settingsTask = await settingsRes.json();
  await waitForAlgoliaTask(appId, adminKey, indexName, settingsTask.taskID);
  console.log(`Configured Algolia primary index "${indexName}" + 3 sorting replicas`);

  // 2. Configure Replica Rankings (price-asc, price-desc, swl-desc)
  const replicaConfigs = [
    {
      name: replicas.priceAsc,
      ranking: [
        'asc(basePriceExVatPence)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    },
    {
      name: replicas.priceDesc,
      ranking: [
        'desc(basePriceExVatPence)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    },
    {
      name: replicas.swlDesc,
      ranking: [
        'desc(swlKg)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    },
  ];

  for (const rep of replicaConfigs) {
    const repRes = await fetch(
      `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(rep.name)}/settings`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          searchableAttributes: ALGOLIA_INDEX_SETTINGS.searchableAttributes,
          attributesForFaceting: ALGOLIA_INDEX_SETTINGS.attributesForFaceting,
          attributesToHighlight: ALGOLIA_INDEX_SETTINGS.attributesToHighlight,
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          ranking: rep.ranking,
        }),
      }
    );
    if (repRes.ok) {
      const repTask = await repRes.json();
      await waitForAlgoliaTask(appId, adminKey, rep.name, repTask.taskID);
    }
  }

  // 3. Sync Industrial Synonyms
  const synRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}/synonyms/batch?replaceExistingSynonyms=true&forwardToReplicas=true`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(ALGOLIA_SYNONYMS),
    }
  );
  if (synRes.ok) {
    const synTask = await synRes.json();
    await waitForAlgoliaTask(appId, adminKey, indexName, synTask.taskID);
    console.log(`Synced ${ALGOLIA_SYNONYMS.length} industrial synonyms to "${indexName}" (+ replicas)`);
  }

  // 4. Sync Programmable Algolia Query Rules (Merchandising Banners & Pinning)
  const rulesRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}/rules/batch?clearExistingRules=true&forwardToReplicas=true`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(ALGOLIA_QUERY_RULES),
    }
  );
  if (!rulesRes.ok) {
    const errText = await rulesRes.text();
    throw new Error(`Algolia rules sync failed (${rulesRes.status}): ${errText}`);
  }
  const rulesTask = await rulesRes.json();
  await waitForAlgoliaTask(appId, adminKey, indexName, rulesTask.taskID);
  console.log(`Synced ${ALGOLIA_QUERY_RULES.length} programmable Query Rules to "${indexName}"`);

  // 5. Batch Index Enriched Stillage Records
  const records = SEED_ALGOLIA_PRODUCTS.map((p) => buildAlgoliaProductRecord(p));
  const batchRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}/batch`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: records.map((record) => ({ action: 'updateObject', body: record })),
      }),
    }
  );
  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Algolia batch indexing failed (${batchRes.status}): ${errText}`);
  }
  const batchTask = await batchRes.json();
  await waitForAlgoliaTask(appId, adminKey, indexName, batchTask.taskID);
  console.log(
    `Indexed ${records.length} enriched stillage specifications into "${indexName}".`
  );

  // 6. Configure & Populate Federated Technical Articles Index (stillage_articles)
  const artSettingsRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(articlesIndexName)}/settings`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(ALGOLIA_ARTICLES_SETTINGS),
    }
  );
  if (artSettingsRes.ok) {
    const artSettingsTask = await artSettingsRes.json();
    await waitForAlgoliaTask(appId, adminKey, articlesIndexName, artSettingsTask.taskID);
  }

  const articleRecords = SEED_BLOG_ENTRIES.map((post) => buildAlgoliaArticleRecord(post));
  const artBatchRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(articlesIndexName)}/batch`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: articleRecords.map((record) => ({ action: 'updateObject', body: record })),
      }),
    }
  );
  if (artBatchRes.ok) {
    const artBatchTask = await artBatchRes.json();
    await waitForAlgoliaTask(appId, adminKey, articlesIndexName, artBatchTask.taskID);
    console.log(
      `Indexed ${articleRecords.length} technical compliance guides into "${articlesIndexName}".`
    );
  }

  // 7. Sync Federated Query Rules onto stillage_articles (expands 3-rule/index Free Tier ceiling across indexes)
  const artRulesRes = await fetch(
    `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(articlesIndexName)}/rules/batch?clearExistingRules=true`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(ALGOLIA_ARTICLES_QUERY_RULES),
    }
  );
  if (artRulesRes.ok) {
    const artRulesTask = await artRulesRes.json();
    await waitForAlgoliaTask(appId, adminKey, articlesIndexName, artRulesTask.taskID);
    console.log(
      `Synced ${ALGOLIA_ARTICLES_QUERY_RULES.length} federated Query Rule(s) to "${articlesIndexName}"`
    );
  }

  return {
    indexName,
    articlesIndexName,
    indexedCount: records.length,
    articlesIndexedCount: articleRecords.length,
    rulesCount: ALGOLIA_QUERY_RULES.length + ALGOLIA_ARTICLES_QUERY_RULES.length,
  };
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  syncAlgoliaIndex().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
