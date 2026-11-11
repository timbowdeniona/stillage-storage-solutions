// Contentful Content Model, Media Asset Uploader & Entry Seeder for Stillage Storage Solutions
// Run with: npm run contentful:sync

import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function resolveManagementToken() {
  if (process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
    return process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  }
  for (const envFile of ['.env.local', '.env']) {
    try {
      const envPath = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^\s*CONTENTFUL_MANAGEMENT_TOKEN\s*=\s*(.+)\s*$/m);
        if (match && match[1]) {
          const val = match[1].trim().replace(/^['"]|['"]$/g, '');
          if (val && val !== 'your_contentful_cma_pat_token_here') {
            return val;
          }
        }
      }
    } catch {
      // Ignore if unreadable
    }
  }
  try {
    const rcPath = path.join(os.homedir(), '.contentfulrc.json');
    if (fs.existsSync(rcPath)) {
      const parsed = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
      if (parsed.managementToken) return parsed.managementToken;
    }
  } catch {
    // Ignore if unreadable
  }
  return undefined;
}

const CMA_TOKEN = resolveManagementToken();
const TARGET_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'q9ktabz6dqby';
const ENVIRONMENT_ID = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
const BASE_URL = 'https://api.contentful.com';
const UPLOAD_BASE_URL = 'https://upload.contentful.com';

export const PRODUCT_MEDIA_ASSETS = [
  {
    id: 'asset-cantilever-rack-cutout',
    localPath: '/images/products/cantilever-rack-cutout.png',
    fileName: 'cantilever-rack-cutout.png',
    contentType: 'image/png',
    title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack (Cutout)',
    description:
      'Studio cutout of RAL 5010 Stillage Blue 3-bay double-sided cantilever bar and pipe storage rack.',
  },
  {
    id: 'asset-cantilever-rack-sand',
    localPath: '/images/products/cantilever-rack-sand.png',
    fileName: 'cantilever-rack-sand.png',
    contentType: 'image/png',
    title: 'Double-Sided Cantilever Bar & Tube Stillage Rack (Workshop Sand Stage)',
    description:
      'Heavy-duty steel cantilever bar rack and mesh stillage photographed on warm workshop sand backdrop.',
  },
  {
    id: 'asset-stacked-hopper-stillage',
    localPath: '/images/products/stacked-hopper-stillage.png',
    fileName: 'stacked-hopper-stillage.png',
    contentType: 'image/png',
    title: 'Modular 4-Tier Stackable Hopper & Solid Sheet Bin Stillage System',
    description:
      '4-high interlocking steel bin and top-feed conical hopper stillage tower with pressed steel stacking feet.',
  },
  {
    id: 'asset-sss-cant-3b8a-blueprint',
    localPath: '/images/products/sss-cant-3b8a-blueprint.jpg',
    fileName: 'sss-cant-3b8a-blueprint.jpg',
    contentType: 'image/jpeg',
    title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack — Technical Blueprint (SSS-CANT-3B8A)',
    description:
      'CAD technical dimensional blueprint drawing for SSS-CANT-3B8A showing 2400x1100x1450mm external dimensions, 80x80x4mm upright and 50x50x3mm arm steel section callouts, and 1,500 kg SWL rating.',
  },
  {
    id: 'asset-sss-msh-1210hd-blueprint',
    localPath: '/images/products/sss-msh-1210hd-blueprint.jpg',
    fileName: 'sss-msh-1210hd-blueprint.jpg',
    contentType: 'image/jpeg',
    title: 'Mesh Sided Half-Drop Gate Stillage Cage — Technical Blueprint (SSS-MSH-1210HD)',
    description:
      'CAD technical dimensional blueprint drawing for SSS-MSH-1210HD showing 1200x1000x900mm external dimensions, 50x50x3mm RHS and 50x50x4mm weldmesh callouts, 150mm forklift clearance, and 1,000 kg SWL 4-high stackable rating.',
  },
  {
    id: 'asset-bbfh2-1-blueprint',
    localPath: '/images/products/bbfh2-1-blueprint.jpg',
    fileName: 'bbfh2-1-blueprint.jpg',
    contentType: 'image/jpeg',
    title: 'Free Standing Bulk Bag Filling Hopper with Stand — Technical Blueprint (BBFH2-1)',
    description:
      'CAD technical dimensional blueprint drawing for BBFH2-1 showing 1120x1120x1850mm assembled dimensions, 1080mm foot centres, 600mm upper hopper (450mm funnel + 150mm collar), 200x200mm flush bottom opening, and 165x75mm forklift pockets at 665mm centres.',
  },
  {
    id: 'asset-base-render-bbfh2-1',
    localPath: '/images/products/base-render-bbfh2-1.jpg',
    fileName: 'base-render-bbfh2-1.jpg',
    contentType: 'image/jpeg',
    title: 'Free Standing Bulk Bag Filling Hopper with Stand — Clean 3D CAD Render (BBFH2-1)',
    description:
      'Clean isometric 3D CAD render of BBFH2-1 Free Standing Bulk Bag Filling Hopper with Stand in RAL 5010 Stillage Blue.',
  },
  {
    id: 'asset-base-render-sss-cant-3b8a',
    localPath: '/images/products/base-render-sss-cant-3b8a.jpg',
    fileName: 'base-render-sss-cant-3b8a.jpg',
    contentType: 'image/jpeg',
    title: '3-Bay Cantilever Bar Rack — Clean 3D CAD Render (SSS-CANT-3B8A)',
    description:
      'Clean isometric 3D CAD render of 3-Bay Cantilever Bar Rack in RAL 5010 Stillage Blue.',
  },
  {
    id: 'asset-base-render-sss-msh-1210hd',
    localPath: '/images/products/base-render-sss-msh-1210hd.jpg',
    fileName: 'base-render-sss-msh-1210hd.jpg',
    contentType: 'image/jpeg',
    title: 'Mesh Sided Half-Drop Gate Stillage Cage — Clean 3D CAD Render (SSS-MSH-1210HD)',
    description:
      'Clean isometric 3D CAD render of Mesh Sided Half-Drop Gate Stillage Cage in RAL 5010 Stillage Blue.',
  },
];

const LOCAL_PATH_TO_ASSET_ID = Object.fromEntries(
  PRODUCT_MEDIA_ASSETS.map((a) => [a.localPath, a.id])
);

export function makeAssetLink(localPathOrAssetId) {
  if (!localPathOrAssetId) return undefined;
  const assetId = LOCAL_PATH_TO_ASSET_ID[localPathOrAssetId] || localPathOrAssetId;
  return {
    sys: {
      type: 'Link',
      linkType: 'Asset',
      id: assetId,
    },
  };
}

export const PRODUCT_CONTENT_TYPE = {
  id: 'product',
  name: 'Stillage Product',
  description: 'Heavy-duty steel stillage, post pallet, or storage rack product',
  displayField: 'title',
  fields: [
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
    { id: 'slug', name: 'Slug', type: 'Symbol', required: true, localized: false },
    { id: 'sku', name: 'SKU', type: 'Symbol', required: true, localized: false },
    { id: 'categorySlug', name: 'Category Slug', type: 'Symbol', required: true, localized: false },
    { id: 'categoryName', name: 'Category Name', type: 'Symbol', required: true, localized: false },
    { id: 'shortDescription', name: 'Short Description', type: 'Text', required: true, localized: false },
    { id: 'fullDescription', name: 'Full Description', type: 'Text', required: true, localized: false },
    {
      id: 'basePriceExVatPence',
      name: 'Base Price Ex VAT (Pence)',
      type: 'Integer',
      required: true,
      localized: false,
    },
    { id: 'swlKg', name: 'Safe Working Load (kg)', type: 'Integer', required: true, localized: false },
    {
      id: 'externalLengthMm',
      name: 'External Length (mm)',
      type: 'Integer',
      required: true,
      localized: false,
    },
    {
      id: 'externalWidthMm',
      name: 'External Width (mm)',
      type: 'Integer',
      required: true,
      localized: false,
    },
    {
      id: 'externalHeightMm',
      name: 'External Height (mm)',
      type: 'Integer',
      required: true,
      localized: false,
    },
    { id: 'unitWeightKg', name: 'Unit Weight (kg)', type: 'Integer', required: true, localized: false },
    { id: 'stackableHeight', name: 'Stackable Rating', type: 'Symbol', required: true, localized: false },
    {
      id: 'steelSpecification',
      name: 'Steel Box Section Specification',
      type: 'Symbol',
      required: true,
      localized: false,
    },
    { id: 'standardFinish', name: 'Standard Finish', type: 'Symbol', required: true, localized: false },
    { id: 'ukcaCertified', name: 'UKCA / LOLER Tested', type: 'Boolean', required: true, localized: false },
    {
      id: 'inStock',
      name: 'In Stock for Immediate Dispatch',
      type: 'Boolean',
      required: true,
      localized: false,
    },
    { id: 'leadTimeText', name: 'Lead Time Text', type: 'Symbol', required: true, localized: false },
    { id: 'featured', name: 'Featured on Homepage', type: 'Boolean', required: false, localized: false },
    {
      id: 'primaryImage',
      name: 'Primary Image',
      type: 'Link',
      linkType: 'Asset',
      required: true,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
    {
      id: 'technicalDrawing',
      name: 'Technical Drawing',
      type: 'Link',
      linkType: 'Asset',
      required: false,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
    {
      id: 'gallery',
      name: 'Extra Gallery Images (Up to 5)',
      type: 'Array',
      required: false,
      localized: false,
      items: {
        type: 'Link',
        linkType: 'Asset',
        validations: [{ linkMimetypeGroup: ['image'] }],
      },
      validations: [{ size: { max: 5 } }],
    },
    {
      id: 'secondaryImage',
      name: 'Secondary Image (Legacy)',
      type: 'Link',
      linkType: 'Asset',
      required: false,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
    {
      id: 'backdropStyle',
      name: 'Preferred Backdrop Style',
      type: 'Symbol',
      required: false,
      localized: false,
    },
    {
      id: 'highlights',
      name: 'Key Engineering Highlights',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
    {
      id: 'seoTitle',
      name: 'SEO Meta Title (Optional)',
      type: 'Symbol',
      required: false,
      localized: false,
      validations: [{ size: { max: 65 } }],
    },
    {
      id: 'seoDescription',
      name: 'SEO Meta Description (Optional)',
      type: 'Text',
      required: false,
      localized: false,
      validations: [{ size: { max: 165 } }],
    },
    {
      id: 'faqItems',
      name: 'Buyer FAQs (Question? | Answer)',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
  ],
};

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
    {
      id: 'heroImage',
      name: 'Hero Image',
      type: 'Link',
      linkType: 'Asset',
      required: true,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
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
    {
      id: 'seoTitle',
      name: 'SEO Meta Title (Optional)',
      type: 'Symbol',
      required: false,
      localized: false,
      validations: [{ size: { max: 65 } }],
    },
    {
      id: 'seoDescription',
      name: 'SEO Meta Description (Optional)',
      type: 'Text',
      required: false,
      localized: false,
      validations: [{ size: { max: 165 } }],
    },
    {
      id: 'faqItems',
      name: 'Article FAQs (Question? | Answer)',
      type: 'Array',
      required: false,
      localized: false,
      items: { type: 'Symbol', validations: [] },
    },
  ],
};

export const SEED_PRODUCT_ENTRIES = [
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
    primaryImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
    technicalDrawing: makeAssetLink('/images/products/sss-cant-3b8a-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/cantilever-rack-sand.png'),
      makeAssetLink('/images/products/base-render-sss-cant-3b8a.jpg'),
      makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    ],
    secondaryImage: makeAssetLink('/images/products/cantilever-rack-sand.png'),
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
    primaryImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    technicalDrawing: makeAssetLink('/images/products/bbfh2-1-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/cantilever-rack-cutout.png'),
      makeAssetLink('/images/products/cantilever-rack-sand.png'),
      makeAssetLink('/images/products/base-render-bbfh2-1.jpg'),
    ],
    secondaryImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
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
    primaryImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    technicalDrawing: makeAssetLink('/images/products/sss-msh-1210hd-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/cantilever-rack-sand.png'),
      makeAssetLink('/images/products/cantilever-rack-cutout.png'),
      makeAssetLink('/images/products/base-render-sss-msh-1210hd.jpg'),
    ],
    secondaryImage: makeAssetLink('/images/products/cantilever-rack-sand.png'),
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
    primaryImage: makeAssetLink('/images/products/cantilever-rack-sand.png'),
    technicalDrawing: makeAssetLink('/images/products/sss-msh-1210hd-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/base-render-sss-msh-1210hd.jpg'),
      makeAssetLink('/images/products/cantilever-rack-cutout.png'),
      makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    ],
    secondaryImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
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
    primaryImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
    technicalDrawing: makeAssetLink('/images/products/sss-cant-3b8a-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/cantilever-rack-sand.png'),
      makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    ],
    secondaryImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
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
    primaryImage: makeAssetLink('/images/products/cantilever-rack-sand.png'),
    technicalDrawing: makeAssetLink('/images/products/sss-cant-3b8a-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/cantilever-rack-cutout.png'),
      makeAssetLink('/images/products/base-render-sss-cant-3b8a.jpg'),
    ],
    secondaryImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
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
    primaryImage: makeAssetLink('/images/products/base-render-bbfh2-1.jpg'),
    technicalDrawing: makeAssetLink('/images/products/bbfh2-1-blueprint.jpg'),
    gallery: [
      makeAssetLink('/images/products/stacked-hopper-stillage.png'),
      makeAssetLink('/images/products/cantilever-rack-sand.png'),
      makeAssetLink('/images/products/cantilever-rack-cutout.png'),
    ],
    secondaryImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
    backdropStyle: 'white',
    highlights: [
      'Flush 200 x 200mm bottom opening on 600mm modular top hopper (450mm cone + 150mm collar)',
      '1250mm tall 50x50mm box-section stand with 1080mm foot centres and FIBC bag loop hooks',
      'Captive 165 x 75mm forklift pockets set at 665mm centres',
      'Option of heavy-duty castors or forklift pockets (either or both)',
    ],
  },
];

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
    heroImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
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
    heroImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
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
    heroImage: makeAssetLink('/images/products/cantilever-rack-sand.png'),
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
    heroImage: makeAssetLink('/images/products/cantilever-rack-cutout.png'),
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
    heroImage: makeAssetLink('/images/products/stacked-hopper-stillage.png'),
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
    if (key === 'id' || value === undefined) continue;
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

async function uploadAndPublishAsset(spaceId, envPath, assetDef, locale = 'en-US') {
  const filePath = path.resolve(process.cwd(), 'public', assetDef.localPath.replace(/^\//, ''));
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`Uploading binary for ${assetDef.fileName} (${fileBuffer.length} bytes)...`);
  const uploadRes = await cmaFetch(`${UPLOAD_BASE_URL}/spaces/${spaceId}/uploads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer,
  });

  const uploadId = uploadRes.sys.id;
  const assetPath = `${envPath}/assets/${assetDef.id}`;
  let existing = null;
  try {
    existing = await cmaFetch(assetPath);
  } catch {
    existing = null;
  }

  const assetPayload = {
    fields: {
      title: { [locale]: assetDef.title },
      description: { [locale]: assetDef.description },
      file: {
        [locale]: {
          contentType: assetDef.contentType,
          fileName: assetDef.fileName,
          uploadFrom: {
            sys: {
              type: 'Link',
              linkType: 'Upload',
              id: uploadId,
            },
          },
        },
      },
    },
  };

  const savedAsset = await cmaFetch(assetPath, {
    method: 'PUT',
    headers: existing ? { 'X-Contentful-Version': String(existing.sys.version) } : {},
    body: JSON.stringify(assetPayload),
  });

  await cmaFetch(`${assetPath}/files/${locale}/process`, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(savedAsset.sys.version) },
  });

  let processedAsset = null;
  for (let i = 0; i < 20; i++) {
    await sleep(1000);
    const check = await cmaFetch(assetPath);
    if (check?.fields?.file?.[locale]?.url) {
      processedAsset = check;
      break;
    }
  }

  if (!processedAsset) {
    throw new Error(`Timed out waiting for Contentful asset ${assetDef.id} to finish processing`);
  }

  await cmaFetch(`${assetPath}/published`, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(processedAsset.sys.version) },
  });

  console.log(
    `Published Contentful Asset: ${assetDef.id} -> https:${processedAsset.fields.file[locale].url}`
  );
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

  // If any field changed type (e.g. Symbol -> Link for primaryImage / secondaryImage),
  // perform Contentful's two-step omit -> delete migration before adding the new field definition.
  if (existing && Array.isArray(existing.fields)) {
    const fieldsChangingType = [];
    for (const desiredField of body.fields) {
      const currentField = existing.fields.find((f) => f.id === desiredField.id);
      if (currentField && currentField.type !== desiredField.type) {
        fieldsChangingType.push(desiredField.id);
      }
    }

    if (fieldsChangingType.length > 0) {
      console.log(
        `Migrating field types on "${id}" (${fieldsChangingType.join(', ')}) from Symbol to Media Asset Link...`
      );
      // Step 1: Mark old fields as omitted & disabled
      const step1Fields = existing.fields.map((f) =>
        fieldsChangingType.includes(f.id)
          ? { ...f, required: false, omitted: true, disabled: true }
          : f
      );
      const step1Saved = await cmaFetch(ctPath, {
        method: 'PUT',
        headers: { 'X-Contentful-Version': String(existing.sys.version) },
        body: JSON.stringify({
          name: existing.name,
          description: existing.description,
          displayField: existing.displayField,
          fields: step1Fields,
        }),
      });
      const step1Pub = await cmaFetch(`${ctPath}/published`, {
        method: 'PUT',
        headers: { 'X-Contentful-Version': String(step1Saved.sys.version) },
      });

      // Step 2: Delete omitted fields from content type
      const step2Fields = step1Fields.filter((f) => !fieldsChangingType.includes(f.id));
      const step2Saved = await cmaFetch(ctPath, {
        method: 'PUT',
        headers: { 'X-Contentful-Version': String(step1Pub.sys.version) },
        body: JSON.stringify({
          name: existing.name,
          description: existing.description,
          displayField: existing.displayField,
          fields: step2Fields,
        }),
      });
      existing = await cmaFetch(`${ctPath}/published`, {
        method: 'PUT',
        headers: { 'X-Contentful-Version': String(step2Saved.sys.version) },
      });
    }
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
    console.error('Error: Please set CONTENTFUL_MANAGEMENT_TOKEN in your environment or .env.local.');
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

  // 1. Upload, process & publish all required product media assets
  for (const assetDef of PRODUCT_MEDIA_ASSETS) {
    await uploadAndPublishAsset(space.sys.id, envPath, assetDef, defaultLocale);
  }

  // 2. Update & publish Stillage Product content type (primaryImage & secondaryImage as Media Asset Links)
  await upsertAndPublishContentType(envPath, PRODUCT_CONTENT_TYPE);

  // 3. Update & publish all 6 Stillage Product entries with linked Media Assets
  for (const prod of SEED_PRODUCT_ENTRIES) {
    await upsertAndPublishEntry(envPath, PRODUCT_CONTENT_TYPE.id, prod, defaultLocale);
  }

  // 4. Create/update & publish Blog Post content type
  await upsertAndPublishContentType(envPath, BLOG_POST_CONTENT_TYPE);

  // 5. Upsert & publish all 5 test blog posts
  for (const post of SEED_BLOG_ENTRIES) {
    await upsertAndPublishEntry(envPath, BLOG_POST_CONTENT_TYPE.id, post, defaultLocale);
  }

  console.log(
    `Successfully uploaded ${PRODUCT_MEDIA_ASSETS.length} media assets, updated ${SEED_PRODUCT_ENTRIES.length} Stillage Products with media links, and synced ${SEED_BLOG_ENTRIES.length} blogPost entries to Contentful.`
  );
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
