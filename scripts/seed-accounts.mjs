// Idempotent Postgres seeder for Stillage Storage Solutions accounts, orders & analytics events
// Run with: node scripts/seed-accounts.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

function loadEnvFile(filename) {
  const envPath = path.resolve(process.cwd(), filename);
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

loadEnvFile('.env.local');
loadEnvFile('.env');

function daysAgo(days, hourUtc = 10, minuteUtc = 15) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return d;
}

const SEED_USERS = [
  {
    email: 'timdbowden@gmail.com',
    name: 'Tim Bowden',
    role: 'admin',
    provider: 'google',
    companyName: 'Stillage Storage Solutions',
    phone: '01978 800 500',
    defaultPostcode: 'LL13 9UG',
    defaultTailLift: false,
    daysAgoCreated: 120,
    daysAgoLogin: 1,
  },
  {
    email: 'admin@plantandrobinson.com',
    name: 'Plant & Robinson Admin',
    role: 'admin',
    provider: 'microsoft-entra-id',
    companyName: 'Plant & Robinson Ltd',
    phone: null,
    defaultPostcode: null,
    defaultTailLift: false,
    daysAgoCreated: 90,
    daysAgoLogin: 2,
  },
  {
    email: 'tim@valleychapel.co.uk',
    name: 'Tim (Valley Chapel)',
    role: 'customer',
    provider: 'google',
    companyName: 'Valley Chapel Storage & Logistics',
    phone: '01978 800 512',
    defaultPostcode: 'LL13 9UG',
    defaultTailLift: false,
    daysAgoCreated: 45,
    daysAgoLogin: 3,
  },
  {
    email: 'procurement@midlandspressings.co.uk',
    name: 'Claire Henderson',
    role: 'customer',
    provider: 'microsoft-entra-id',
    companyName: 'Midlands Pressings & Stamping Ltd',
    phone: '0121 496 0321',
    defaultPostcode: 'B46 1AB',
    defaultTailLift: false,
    daysAgoCreated: 28,
    daysAgoLogin: 2,
  },
  {
    email: 'yards@clydebankcivil.co.uk',
    name: 'Callum MacLeod',
    role: 'customer',
    provider: 'google',
    companyName: 'Clydebank Civil Engineering Ltd',
    phone: '0141 496 0780',
    defaultPostcode: 'G81 1AB',
    defaultTailLift: true,
    daysAgoCreated: 19,
    daysAgoLogin: 5,
  },
  {
    email: 'buying@yorkshiresteelworks.co.uk',
    name: 'Hannah Whitaker',
    role: 'customer',
    provider: 'facebook',
    companyName: 'Yorkshire Structural Steelworks Ltd',
    phone: '0114 496 0442',
    defaultPostcode: 'S9 2TN',
    defaultTailLift: false,
    daysAgoCreated: 12,
    daysAgoLogin: 4,
  },
];

const SEED_ORDERS = [
  {
    orderReference: 'SSS-SHT-1210-4821',
    customerEmail: 'tim@valleychapel.co.uk',
    companyName: 'Valley Chapel Storage & Logistics',
    purchaseOrderNumber: 'PO-VC-2026-044',
    paymentMode: 'card',
    status: 'paid',
    stripeSessionId: 'cs_test_seed_valleychapel_4821',
    stripeInvoiceId: null,
    invoiceNumber: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null,
    itemsJson: [
      {
        sku: 'SSS-SHT-1210',
        title: 'Heavy-Duty Solid Sheet Steel Bin Stillage (1200 x 1000mm)',
        slug: 'heavy-duty-solid-sheet-steel-bin-stillage-1200x1000',
        quantity: 8,
        basePriceExVatPence: 18900,
        finishOption: 'standard-blue',
        finishName: 'RAL 5010 Stillage Blue (Standard)',
        mobilityOption: 'forklift-pockets',
        mobilityName: 'Enclosed 4-Way Forklift Guide Pockets',
        primaryImage: '/images/products/stacked-hopper-stillage.png',
        discountedUnitExVatPence: 20805,
        lineSubtotalExVatPence: 166440,
      },
    ],
    totalUnits: 8,
    subtotalExVatPence: 166440,
    deliveryExVatPence: 13000,
    vatPence: 35888,
    totalIncVatPence: 215328,
    postcode: 'LL13 9UG',
    deliveryZone: 'North West & Wales Hub (Zone A)',
    requiresTailLift: false,
    daysAgo: 6,
  },
  {
    orderReference: 'SSS-CANT-3B8A-4819',
    customerEmail: 'tim@valleychapel.co.uk',
    companyName: 'Valley Chapel Storage & Logistics',
    purchaseOrderNumber: 'PO-VC-2026-041',
    paymentMode: 'b2b_proforma',
    status: 'invoiced',
    stripeSessionId: null,
    stripeInvoiceId: 'in_test_seed_valleychapel_4819',
    invoiceNumber: 'INV-2026-4819',
    hostedInvoiceUrl: 'https://invoice.stripe.com/i/acct_seed_demo/INV-2026-4819',
    invoicePdfUrl: 'https://pay.stripe.com/invoice/acct_seed_demo/INV-2026-4819/pdf',
    itemsJson: [
      {
        sku: 'SSS-CANT-3B8A',
        title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
        slug: '3-bay-double-sided-cantilever-bar-rack',
        quantity: 4,
        basePriceExVatPence: 38500,
        finishOption: 'galvanised',
        finishName: 'Hot-Dip Galvanised (BS EN ISO 1461)',
        mobilityOption: 'standard-feet',
        mobilityName: 'Standard Pressed Steel Stacking Feet',
        primaryImage: '/images/products/cantilever-rack-cutout.png',
        discountedUnitExVatPence: 43000,
        lineSubtotalExVatPence: 172000,
      },
    ],
    totalUnits: 4,
    subtotalExVatPence: 172000,
    deliveryExVatPence: 6500,
    vatPence: 35700,
    totalIncVatPence: 214200,
    postcode: 'LL13 9UG',
    deliveryZone: 'North West & Wales Hub (Zone A)',
    requiresTailLift: false,
    daysAgo: 14,
  },
  {
    orderReference: 'SSS-MSH-1210HD-4780',
    customerEmail: 'tim@valleychapel.co.uk',
    companyName: 'Valley Chapel Storage & Logistics',
    purchaseOrderNumber: 'PO-VC-2026-033',
    paymentMode: 'card',
    status: 'dispatched',
    stripeSessionId: 'cs_test_seed_valleychapel_4780',
    stripeInvoiceId: null,
    invoiceNumber: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null,
    itemsJson: [
      {
        sku: 'SSS-MSH-1210HD',
        title: 'Mesh Sided Half-Drop Gate Stillage Cage (1200 x 1000 x 900mm)',
        slug: 'mesh-sided-half-drop-gate-stillage-cage',
        quantity: 12,
        basePriceExVatPence: 17400,
        finishOption: 'standard-blue',
        finishName: 'RAL 5010 Stillage Blue (Standard)',
        mobilityOption: 'heavy-duty-castors',
        mobilityName: '4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed)',
        primaryImage: '/images/products/cantilever-rack-sand.png',
        discountedUnitExVatPence: 20610,
        lineSubtotalExVatPence: 247320,
      },
    ],
    totalUnits: 12,
    subtotalExVatPence: 247320,
    deliveryExVatPence: 21000,
    vatPence: 53664,
    totalIncVatPence: 321984,
    postcode: 'LL13 9UG',
    deliveryZone: 'North West & Wales Hub (Zone A)',
    requiresTailLift: true,
    daysAgo: 26,
  },
  {
    orderReference: 'SSS-HOP-4T1000-4890',
    customerEmail: 'procurement@midlandspressings.co.uk',
    companyName: 'Midlands Pressings & Stamping Ltd',
    purchaseOrderNumber: 'MP-88412',
    paymentMode: 'card',
    status: 'paid',
    stripeSessionId: 'cs_test_seed_midlands_4890',
    stripeInvoiceId: null,
    invoiceNumber: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null,
    itemsJson: [
      {
        sku: 'SSS-HOP-4T1000',
        title: 'Modular 4-Tier Stackable Hopper & Bin Stillage System',
        slug: 'modular-4-tier-stackable-hopper-bin-stillage',
        quantity: 4,
        basePriceExVatPence: 54000,
        finishOption: 'standard-blue',
        finishName: 'RAL 5010 Stillage Blue (Standard)',
        mobilityOption: 'forklift-pockets',
        mobilityName: 'Enclosed 4-Way Forklift Guide Pockets',
        primaryImage: '/images/products/stacked-hopper-stillage.png',
        discountedUnitExVatPence: 57000,
        lineSubtotalExVatPence: 228000,
      },
    ],
    totalUnits: 4,
    subtotalExVatPence: 228000,
    deliveryExVatPence: 7900,
    vatPence: 47180,
    totalIncVatPence: 283080,
    postcode: 'B46 1AB',
    deliveryZone: 'UK Mainland Standard Pallet Network (Zone B)',
    requiresTailLift: false,
    daysAgo: 2,
  },
  {
    orderReference: 'SSS-PST-1111D-4855',
    customerEmail: 'yards@clydebankcivil.co.uk',
    companyName: 'Clydebank Civil Engineering Ltd',
    purchaseOrderNumber: 'CCE-2026-109',
    paymentMode: 'b2b_proforma',
    status: 'invoiced',
    stripeSessionId: null,
    stripeInvoiceId: 'in_test_seed_clydebank_4855',
    invoiceNumber: 'INV-2026-4855',
    hostedInvoiceUrl: 'https://invoice.stripe.com/i/acct_seed_demo/INV-2026-4855',
    invoicePdfUrl: 'https://pay.stripe.com/invoice/acct_seed_demo/INV-2026-4855/pdf',
    itemsJson: [
      {
        sku: 'SSS-PST-1111D',
        title: 'Heavy-Duty Post Pallet with Demountable Corner Posts (1130 x 1130mm)',
        slug: 'heavy-duty-post-pallet-demountable-posts',
        quantity: 16,
        basePriceExVatPence: 14200,
        finishOption: 'galvanised',
        finishName: 'Hot-Dip Galvanised (BS EN ISO 1461)',
        mobilityOption: 'forklift-pockets',
        mobilityName: 'Enclosed 4-Way Forklift Guide Pockets',
        primaryImage: '/images/products/cantilever-rack-cutout.png',
        discountedUnitExVatPence: 19530,
        lineSubtotalExVatPence: 312480,
      },
    ],
    totalUnits: 16,
    subtotalExVatPence: 312480,
    deliveryExVatPence: 33100,
    vatPence: 69116,
    totalIncVatPence: 414696,
    postcode: 'G81 1AB',
    deliveryZone: 'UK Mainland Standard Pallet Network (Zone B)',
    requiresTailLift: true,
    daysAgo: 9,
  },
  {
    orderReference: 'SSS-CANT-2B4A-4802',
    customerEmail: 'buying@yorkshiresteelworks.co.uk',
    companyName: 'Yorkshire Structural Steelworks Ltd',
    purchaseOrderNumber: 'YSS-PO-772',
    paymentMode: 'b2b_proforma',
    status: 'dispatched',
    stripeSessionId: null,
    stripeInvoiceId: 'in_test_seed_yorkshire_4802',
    invoiceNumber: 'INV-2026-4802',
    hostedInvoiceUrl: 'https://invoice.stripe.com/i/acct_seed_demo/INV-2026-4802',
    invoicePdfUrl: 'https://pay.stripe.com/invoice/acct_seed_demo/INV-2026-4802/pdf',
    itemsJson: [
      {
        sku: 'SSS-CANT-2B4A',
        title: '2-Bay Compact Cantilever Bar & Tube Stillage (1800mm Long)',
        slug: '2-bay-compact-cantilever-bar-tube-stillage',
        quantity: 6,
        basePriceExVatPence: 29500,
        finishOption: 'custom-ral',
        finishName: 'Custom Corporate RAL Finish',
        mobilityOption: 'standard-feet',
        mobilityName: 'Standard Pressed Steel Stacking Feet',
        primaryImage: '/images/products/cantilever-rack-sand.png',
        discountedUnitExVatPence: 30400,
        lineSubtotalExVatPence: 182400,
      },
    ],
    totalUnits: 6,
    subtotalExVatPence: 182400,
    deliveryExVatPence: 15800,
    vatPence: 39640,
    totalIncVatPence: 237840,
    postcode: 'S9 2TN',
    deliveryZone: 'UK Mainland Standard Pallet Network (Zone B)',
    requiresTailLift: false,
    daysAgo: 18,
  },
  {
    orderReference: 'SSS-SHT-1210-4791',
    customerEmail: 'procurement@midlandspressings.co.uk',
    companyName: 'Midlands Pressings & Stamping Ltd',
    purchaseOrderNumber: 'MP-88104',
    paymentMode: 'card',
    status: 'dispatched',
    stripeSessionId: 'cs_test_seed_midlands_4791',
    stripeInvoiceId: null,
    invoiceNumber: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null,
    itemsJson: [
      {
        sku: 'SSS-SHT-1210',
        title: 'Heavy-Duty Solid Sheet Steel Bin Stillage (1200 x 1000mm)',
        slug: 'heavy-duty-solid-sheet-steel-bin-stillage-1200x1000',
        quantity: 10,
        basePriceExVatPence: 18900,
        finishOption: 'raw-steel',
        finishName: 'Raw Unpainted Mill Steel',
        mobilityOption: 'both-castors-pockets',
        mobilityName: 'Castors + Enclosed Forklift Guide Pockets',
        primaryImage: '/images/products/stacked-hopper-stillage.png',
        discountedUnitExVatPence: 23310,
        lineSubtotalExVatPence: 233100,
      },
    ],
    totalUnits: 10,
    subtotalExVatPence: 233100,
    deliveryExVatPence: 23700,
    vatPence: 51360,
    totalIncVatPence: 308160,
    postcode: 'B46 1AB',
    deliveryZone: 'UK Mainland Standard Pallet Network (Zone B)',
    requiresTailLift: false,
    daysAgo: 23,
  },
];

const PRODUCT_TITLES = {
  'SSS-SHT-1210': 'Heavy-Duty Solid Sheet Steel Bin Stillage (1200 x 1000mm)',
  'SSS-CANT-3B8A': '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
  'SSS-MSH-1210HD': 'Mesh Sided Half-Drop Gate Stillage Cage (1200 x 1000 x 900mm)',
  'SSS-HOP-4T1000': 'Modular 4-Tier Stackable Hopper & Bin Stillage System',
  'SSS-PST-1111D': 'Heavy-Duty Post Pallet with Demountable Corner Posts (1130 x 1130mm)',
  'SSS-CANT-2B4A': '2-Bay Compact Cantilever Bar & Tube Stillage (1800mm Long)',
};

const SEED_ANALYTICS_EVENTS = [
  { daysAgo: 0, eventName: 'page_view', sessionId: 'seed-session-01', path: '/' },
  { daysAgo: 0, eventName: 'page_view', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210', path: '/products/heavy-duty-solid-sheet-steel-bin-stillage-1200x1000' },
  { daysAgo: 0, eventName: 'configurator_option_select', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210', optionType: 'finish', optionValue: 'galvanised', quantity: 8, path: '/products/heavy-duty-solid-sheet-steel-bin-stillage-1200x1000' },
  { daysAgo: 0, eventName: 'bulk_tier_unlocked', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210', quantity: 8, discountPercentage: 5, path: '/products/heavy-duty-solid-sheet-steel-bin-stillage-1200x1000' },
  { daysAgo: 1, eventName: 'page_view', sessionId: 'seed-session-02', sku: 'SSS-CANT-3B8A', path: '/products/3-bay-double-sided-cantilever-bar-rack' },
  { daysAgo: 1, eventName: 'trade_contact_click', sessionId: 'seed-session-02', contactMethod: 'phone', path: '/contact' },
  { daysAgo: 2, eventName: 'page_view', customerEmail: 'procurement@midlandspressings.co.uk', sessionId: 'seed-session-03', sku: 'SSS-HOP-4T1000', path: '/products/modular-4-tier-stackable-hopper-bin-stillage' },
  { daysAgo: 2, eventName: 'quote_or_proforma_submitted', customerEmail: 'procurement@midlandspressings.co.uk', sessionId: 'seed-session-03', sku: 'SSS-HOP-4T1000', quantity: 4, totalExVatPence: 235900, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 6, eventName: 'page_view', customerEmail: 'tim@valleychapel.co.uk', sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', path: '/products/heavy-duty-solid-sheet-steel-bin-stillage-1200x1000' },
  { daysAgo: 6, eventName: 'bulk_tier_unlocked', customerEmail: 'tim@valleychapel.co.uk', sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', quantity: 8, discountPercentage: 5, path: '/products/heavy-duty-solid-sheet-steel-bin-stillage-1200x1000' },
  { daysAgo: 6, eventName: 'quote_or_proforma_submitted', customerEmail: 'tim@valleychapel.co.uk', sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', quantity: 8, totalExVatPence: 179440, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 9, eventName: 'quote_or_proforma_submitted', customerEmail: 'yards@clydebankcivil.co.uk', sessionId: 'seed-session-10', sku: 'SSS-PST-1111D', quantity: 16, totalExVatPence: 345580, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 14, eventName: 'quote_or_proforma_submitted', customerEmail: 'tim@valleychapel.co.uk', sessionId: 'seed-session-13', sku: 'SSS-CANT-3B8A', quantity: 4, totalExVatPence: 178500, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 18, eventName: 'quote_or_proforma_submitted', customerEmail: 'buying@yorkshiresteelworks.co.uk', sessionId: 'seed-session-16', sku: 'SSS-CANT-2B4A', quantity: 6, totalExVatPence: 198200, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 23, eventName: 'quote_or_proforma_submitted', customerEmail: 'procurement@midlandspressings.co.uk', sessionId: 'seed-session-18', sku: 'SSS-SHT-1210', quantity: 10, totalExVatPence: 256800, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 26, eventName: 'quote_or_proforma_submitted', customerEmail: 'tim@valleychapel.co.uk', sessionId: 'seed-session-19', sku: 'SSS-MSH-1210HD', quantity: 12, totalExVatPence: 268320, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 28, eventName: 'trade_contact_click', sessionId: 'seed-session-20', contactMethod: 'email', path: '/contact' },
];

export async function runSeed() {
  const connectionString = (process.env.NETLIFY_DB_URL || process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    console.log(
      '[seed-accounts] No NETLIFY_DB_URL or DATABASE_URL configured; skipping Postgres seed. The app will use its built-in seeded in-memory store.'
    );
    return { skipped: true, users: 0, orders: 0, analyticsEvents: 0 };
  }

  const pool = new pg.Pool({ connectionString });
  const initSqlPath = path.resolve(
    process.cwd(),
    'db/migrations/20261119145000_init_auth_orders_analytics.sql'
  );

  try {
    if (fs.existsSync(initSqlPath)) {
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(initSql);
    }

    const userIdByEmail = new Map();

    for (const user of SEED_USERS) {
      const email = user.email.trim().toLowerCase();
      const res = await pool.query(
        `
          INSERT INTO users (
            email, name, role, provider, company_name, phone, default_postcode,
            default_tail_lift, created_at, last_login_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, users.name),
            role = EXCLUDED.role,
            provider = COALESCE(EXCLUDED.provider, users.provider),
            company_name = COALESCE(users.company_name, EXCLUDED.company_name),
            phone = COALESCE(users.phone, EXCLUDED.phone),
            default_postcode = COALESCE(users.default_postcode, EXCLUDED.default_postcode)
          RETURNING id
        `,
        [
          email,
          user.name,
          user.role,
          user.provider,
          user.companyName,
          user.phone,
          user.defaultPostcode,
          user.defaultTailLift,
          daysAgo(user.daysAgoCreated, 9, 0),
          daysAgo(user.daysAgoLogin, 10, 0),
        ]
      );
      userIdByEmail.set(email, res.rows[0].id);
    }

    for (const order of SEED_ORDERS) {
      const email = order.customerEmail.trim().toLowerCase();
      const userId = userIdByEmail.get(email) ?? null;
      const ts = daysAgo(order.daysAgo, 11, 20);

      await pool.query(
        `
          INSERT INTO orders (
            order_reference, user_id, customer_email, company_name, purchase_order_number,
            payment_mode, status, stripe_session_id, stripe_invoice_id, invoice_number,
            hosted_invoice_url, invoice_pdf_url, items_json, total_units,
            subtotal_ex_vat_pence, delivery_ex_vat_pence, vat_pence, total_inc_vat_pence,
            postcode, delivery_zone, requires_tail_lift, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23
          )
          ON CONFLICT (order_reference) DO UPDATE SET
            user_id = COALESCE(orders.user_id, EXCLUDED.user_id),
            status = EXCLUDED.status,
            invoice_number = COALESCE(EXCLUDED.invoice_number, orders.invoice_number),
            hosted_invoice_url = COALESCE(EXCLUDED.hosted_invoice_url, orders.hosted_invoice_url),
            invoice_pdf_url = COALESCE(EXCLUDED.invoice_pdf_url, orders.invoice_pdf_url),
            updated_at = NOW()
        `,
        [
          order.orderReference,
          userId,
          email,
          order.companyName,
          order.purchaseOrderNumber,
          order.paymentMode,
          order.status,
          order.stripeSessionId,
          order.stripeInvoiceId,
          order.invoiceNumber,
          order.hostedInvoiceUrl,
          order.invoicePdfUrl,
          JSON.stringify(order.itemsJson),
          order.totalUnits,
          order.subtotalExVatPence,
          order.deliveryExVatPence,
          order.vatPence,
          order.totalIncVatPence,
          order.postcode,
          order.deliveryZone,
          order.requiresTailLift,
          ts,
          ts,
        ]
      );
    }

    const existingSeedEvents = await pool.query(
      `SELECT COUNT(*)::int AS count FROM analytics_events WHERE session_id LIKE 'seed-session-%'`
    );
    let insertedEvents = 0;

    if ((existingSeedEvents.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < SEED_ANALYTICS_EVENTS.length; i += 1) {
        const evt = SEED_ANALYTICS_EVENTS[i];
        const userId = evt.customerEmail
          ? userIdByEmail.get(evt.customerEmail.trim().toLowerCase()) ?? null
          : null;
        const productTitle = evt.sku ? PRODUCT_TITLES[evt.sku] ?? null : null;

        await pool.query(
          `
            INSERT INTO analytics_events (
              event_name, user_id, session_id, sku, product_title, option_type, option_value,
              quantity, discount_percentage, total_ex_vat_pence, payment_method,
              contact_method, path, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `,
          [
            evt.eventName,
            userId,
            evt.sessionId,
            evt.sku ?? null,
            productTitle,
            evt.optionType ?? null,
            evt.optionValue ?? null,
            evt.quantity ?? null,
            evt.discountPercentage ?? null,
            evt.totalExVatPence ?? null,
            evt.paymentMethod ?? null,
            evt.contactMethod ?? null,
            evt.path ?? '/',
            daysAgo(evt.daysAgo, 10 + (i % 6), (i * 7) % 60),
          ]
        );
        insertedEvents += 1;
      }
    }

    console.log(
      `[seed-accounts] Seed complete: ${SEED_USERS.length} users upserted, ${SEED_ORDERS.length} orders upserted, ${insertedEvents} analytics events inserted.`
    );
    return {
      skipped: false,
      users: SEED_USERS.length,
      orders: SEED_ORDERS.length,
      analyticsEvents: insertedEvents,
    };
  } finally {
    await pool.end();
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runSeed().catch((err) => {
    console.error('[seed-accounts] Seeding failed:', err);
    process.exit(1);
  });
}
