import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  extractSkuAndTitleFromStripeDescription,
  extractConfigFromStripeDescription,
  normalizeStripeCheckoutSession,
  normalizeStripeInvoice,
  mergeAndDeduplicateStripeOrders,
  computeUniqueStripeCustomerCounts,
} from '../src/lib/stripeAnalytics.ts';
import {
  normalizeGa4PropertyId,
  normalizeServiceAccountPrivateKey,
  createGoogleServiceAccountJwt,
  getGa4DateRanges,
  parseGa4BatchReportResponse,
  parseGa4InsightsBatchResponse,
} from '../src/lib/ga4Analytics.ts';
import { buildAdminAnalyticsSummary } from '../src/lib/adminAnalytics.ts';

const FIXED_NOW = new Date('2026-11-20T10:00:00.000Z');

test('Stripe description parsers ignore VAT & freight lines and extract SKU, title, and config safely', () => {
  assert.equal(extractSkuAndTitleFromStripeDescription('UK Standard Rate VAT (20%)'), null);
  assert.equal(
    extractSkuAndTitleFromStripeDescription('UK HGV Pallet Network Freight (2 Pallets)'),
    null
  );

  // "Post Pallet" in a stillage name must NOT be misclassified as freight
  assert.deepEqual(
    extractSkuAndTitleFromStripeDescription(
      'Heavy-Duty Post Pallet with Demountable Corner Posts [SSS-PST-1111D]'
    ),
    {
      sku: 'SSS-PST-1111D',
      title: 'Heavy-Duty Post Pallet with Demountable Corner Posts',
    }
  );

  assert.deepEqual(
    extractSkuAndTitleFromStripeDescription(
      '3-Bay Cantilever Rack (SSS-CANT-3B8A) — Hot-Dip Galvanised, Standard Feet [-5% Bulk Tier] (Ex. VAT)'
    ),
    {
      sku: 'SSS-CANT-3B8A',
      title: '3-Bay Cantilever Rack',
    }
  );

  assert.deepEqual(
    extractConfigFromStripeDescription(
      'Finish: RAL 5010 Stillage Blue | Base: 4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed) (5% Bulk Discount Applied) — Ex. VAT'
    ),
    {
      finishName: 'RAL 5010 Stillage Blue',
      mobilityName: '4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed)',
    }
  );

  assert.deepEqual(
    extractConfigFromStripeDescription(
      'Mesh Cage (SSS-MSH-1210HD) — Hot-Dip Galvanised, 4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed) [-10% Bulk Tier] (Ex. VAT)'
    ),
    {
      finishName: 'Hot-Dip Galvanised',
      mobilityName: '4x Heavy-Duty Lockable Castors (2 Swivel Braked, 2 Fixed)',
    }
  );
});

test('normalizeStripeCheckoutSession parses paid GBP sessions, ignores unpaid/non-GBP, and reconciles VAT/freight', () => {
  const unpaid = normalizeStripeCheckoutSession({
    id: 'cs_unpaid',
    payment_status: 'unpaid',
    status: 'open',
    currency: 'gbp',
    amount_total: 120000,
    created: 1795000000,
  });
  assert.equal(unpaid, null);

  const nonGbp = normalizeStripeCheckoutSession({
    id: 'cs_usd',
    payment_status: 'paid',
    status: 'complete',
    currency: 'usd',
    amount_total: 120000,
    created: 1795000000,
  });
  assert.equal(nonGbp, null);

  const paidWithMetadata = normalizeStripeCheckoutSession(
    {
      id: 'cs_live_101',
      payment_status: 'paid',
      status: 'complete',
      currency: 'gbp',
      amount_total: 264000,
      created: Math.floor(Date.parse('2026-11-18T14:00:00Z') / 1000),
      customer_details: {
        email: 'Buyer@MidlandsSteel.co.uk ',
        name: 'Midlands Steel Fabrications',
      },
      custom_fields: [
        {
          key: 'purchase_order_ref',
          text: { value: 'PO-MID-77' },
        },
      ],
      metadata: {
        orderReference: 'SSS-SSS-MSH-1210HD-10201',
        postcode: 'B2 4QA',
        companyName: 'Midlands Steel Ltd',
        totalExVatPence: '220000',
        vatAmountPence: '44000',
        totalIncVatPence: '264000',
      },
    },
    [
      {
        description: 'Mesh Sided Half-Drop Gate Stillage Cage [SSS-MSH-1210HD]',
        quantity: 10,
        amount_subtotal: 210000,
        price: {
          product: {
            description: 'Finish: RAL 5010 Stillage Blue | Base: Enclosed 4-Way Forklift Pockets',
          },
        },
      },
      {
        description: 'UK HGV Pallet Network Freight (3 Pallets)',
        quantity: 1,
        amount_subtotal: 10000,
      },
      {
        description: 'UK Standard Rate VAT (20%)',
        quantity: 1,
        amount_subtotal: 44000,
      },
    ]
  );

  assert.ok(paidWithMetadata);
  assert.equal(paidWithMetadata.orderReference, 'SSS-SSS-MSH-1210HD-10201');
  assert.equal(paidWithMetadata.customerEmail, 'buyer@midlandssteel.co.uk');
  assert.equal(paidWithMetadata.companyName, 'Midlands Steel Ltd');
  assert.equal(paidWithMetadata.purchaseOrderNumber, 'PO-MID-77');
  assert.equal(paidWithMetadata.paymentMode, 'card');
  assert.equal(paidWithMetadata.status, 'paid');
  assert.equal(paidWithMetadata.totalUnits, 10);
  assert.equal(paidWithMetadata.deliveryExVatPence, 10000);
  assert.equal(paidWithMetadata.subtotalExVatPence, 210000);
  assert.equal(paidWithMetadata.vatPence, 44000);
  assert.equal(paidWithMetadata.totalIncVatPence, 264000);
  assert.equal(paidWithMetadata.itemsJson.length, 1);
  assert.equal(paidWithMetadata.itemsJson[0].sku, 'SSS-MSH-1210HD');
  assert.equal(paidWithMetadata.itemsJson[0].finishName, 'RAL 5010 Stillage Blue');
  assert.equal(paidWithMetadata.itemsJson[0].mobilityName, 'Enclosed 4-Way Forklift Pockets');

  // Fallback 20% UK VAT derivation when metadata totals aren't set
  const fallbackVat = normalizeStripeCheckoutSession({
    id: 'cs_fallback_102',
    payment_status: 'paid',
    status: 'complete',
    currency: 'gbp',
    amount_total: 120000,
    created: Math.floor(Date.parse('2026-11-17T09:00:00Z') / 1000),
    customer_email: 'ops@northwarehousing.co.uk',
  });
  assert.ok(fallbackVat);
  assert.equal(fallbackVat.subtotalExVatPence, 100000);
  assert.equal(fallbackVat.vatPence, 20000);
  assert.equal(fallbackVat.totalIncVatPence, 120000);
});

test('normalizeStripeInvoice, mergeAndDeduplicateStripeOrders, and computeUniqueStripeCustomerCounts handle proformas and repeated customer records', () => {
  assert.equal(normalizeStripeInvoice({ id: 'in_draft', status: 'draft', currency: 'gbp' }), null);
  assert.equal(normalizeStripeInvoice({ id: 'in_void', status: 'void', currency: 'gbp' }), null);

  const openProforma = normalizeStripeInvoice({
    id: 'in_proforma_201',
    number: 'PRO-2026-201',
    status: 'open',
    currency: 'gbp',
    total: 360000,
    amount_due: 360000,
    created: Math.floor(Date.parse('2026-11-19T11:00:00Z') / 1000),
    customer_email: 'accounts@valleychapel.co.uk',
    customer_name: 'Valley Chapel Logistics Ltd',
    hosted_invoice_url: 'https://invoice.stripe.com/i/acct_1/proforma_201',
    invoice_pdf: 'https://invoice.stripe.com/i/acct_1/proforma_201/pdf',
    metadata: {
      orderReference: 'SSS-SSS-CANT-3B8A-99201',
      postcode: 'LL11 1AA',
      purchaseOrderNumber: 'PO-VC-88',
    },
    lines: {
      data: [
        {
          description:
            '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack (SSS-CANT-3B8A) — Hot-Dip Galvanised, Standard Feet (Ex. VAT)',
          quantity: 4,
          amount: 285000,
        },
        {
          description: 'HGV Pallet Freight (2 Pallets to LL11 1AA)',
          quantity: 1,
          amount: 15000,
        },
        {
          description: 'UK Standard Rate VAT (20%)',
          quantity: 1,
          amount: 60000,
        },
      ],
    },
  });

  assert.ok(openProforma);
  assert.equal(openProforma.paymentMode, 'b2b_proforma');
  assert.equal(openProforma.status, 'invoiced');
  assert.equal(openProforma.totalUnits, 4);
  assert.equal(openProforma.subtotalExVatPence, 285000);
  assert.equal(openProforma.deliveryExVatPence, 15000);
  assert.equal(openProforma.vatPence, 60000);
  assert.equal(openProforma.hostedInvoiceUrl, 'https://invoice.stripe.com/i/acct_1/proforma_201');
  assert.equal(openProforma.itemsJson[0].sku, 'SSS-CANT-3B8A');

  const duplicateLinkedInvoice = normalizeStripeInvoice({
    id: 'in_linked_999',
    status: 'paid',
    currency: 'gbp',
    total: 120000,
    created: Math.floor(Date.parse('2026-11-18T14:05:00Z') / 1000),
    customer_email: 'buyer@midlandssteel.co.uk',
    metadata: { orderReference: 'SSS-OTHER-REF' },
    lines: { data: [] },
  });

  const sessionOrder = normalizeStripeCheckoutSession({
    id: 'cs_with_invoice',
    invoice: 'in_linked_999',
    payment_status: 'paid',
    status: 'complete',
    currency: 'gbp',
    amount_total: 120000,
    created: Math.floor(Date.parse('2026-11-18T14:00:00Z') / 1000),
    customer_email: 'buyer@midlandssteel.co.uk',
    metadata: { orderReference: 'SSS-SESS-999' },
  });

  const merged = mergeAndDeduplicateStripeOrders(
    [sessionOrder],
    [openProforma, duplicateLinkedInvoice],
    new Set(['in_linked_999'])
  );
  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((o) => o.orderReference),
    ['SSS-SSS-CANT-3B8A-99201', 'SSS-SESS-999']
  );

  // Multiple Stripe Customer objects with same email deduplicate cleanly
  const customerCounts = computeUniqueStripeCustomerCounts(
    [
      {
        id: 'cus_1',
        email: 'Accounts@ValleyChapel.co.uk',
        created: Math.floor(Date.parse('2026-10-01T10:00:00Z') / 1000),
      },
      {
        id: 'cus_2',
        email: 'accounts@valleychapel.co.uk',
        created: Math.floor(Date.parse('2026-11-19T11:00:00Z') / 1000),
      },
      {
        id: 'cus_3',
        email: 'buyer@midlandssteel.co.uk',
        created: Math.floor(Date.parse('2026-11-18T14:00:00Z') / 1000),
      },
    ],
    merged,
    new Date('2026-10-22T00:00:00Z')
  );

  assert.equal(customerCounts.totalCustomers, 2);
  // Valley Chapel earliest created was 2026-10-01 (before Oct 22), only Midlands Steel is new in period
  assert.equal(customerCounts.newCustomersInPeriod, 1);
});

test('GA4 helpers normalize IDs/PEM keys and generate cryptographically verifiable RS256 Service Account JWTs', () => {
  assert.equal(normalizeGa4PropertyId('properties/461298765'), '461298765');
  assert.equal(normalizeGa4PropertyId(' 461298765 '), '461298765');
  assert.equal(normalizeGa4PropertyId('your_ga4_property_id'), null);
  assert.equal(normalizeGa4PropertyId(''), null);

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const envEscapedKey = `"${privateKey.trim().replace(/\n/g, '\\n')}"`;
  const normalizedKey = normalizeServiceAccountPrivateKey(envEscapedKey);
  assert.ok(normalizedKey);
  assert.ok(normalizedKey.includes('\n'));
  assert.equal(normalizeServiceAccountPrivateKey('not-a-pem'), null);

  const jwt = createGoogleServiceAccountJwt(
    'analytics-reader@stillage-storage.iam.gserviceaccount.com',
    normalizedKey,
    1795168800
  );
  const parts = jwt.split('.');
  assert.equal(parts.length, 3);

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  assert.deepEqual(header, { alg: 'RS256', typ: 'JWT' });
  assert.equal(claims.iss, 'analytics-reader@stillage-storage.iam.gserviceaccount.com');
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/analytics.readonly');
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.equal(claims.iat, 1795168800);
  assert.equal(claims.exp, 1795172400);

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`, 'utf8');
  verifier.end();
  assert.equal(verifier.verify(publicKey, Buffer.from(parts[2], 'base64url')), true);

  const ranges30d = getGa4DateRanges('30d', FIXED_NOW);
  assert.deepEqual(ranges30d, {
    current: { startDate: '2026-10-22', endDate: '2026-11-20' },
    previous: { startDate: '2026-09-22', endDate: '2026-10-21' },
  });

  const rangesAll = getGa4DateRanges('all', FIXED_NOW);
  assert.deepEqual(rangesAll, {
    current: { startDate: '2020-01-01', endDate: '2026-11-20' },
  });
});

test('parseGa4BatchReportResponse and buildAdminAnalyticsSummary combine Stripe commerce and GA4 traffic seamlessly', () => {
  const ga4BatchPayload = {
    reports: [
      // Report 0: Overview (2 date ranges)
      {
        dimensionHeaders: [{ name: 'dateRange' }],
        rows: [
          {
            dimensionValues: [{ value: 'date_range_0' }],
            metricValues: [
              { value: '1250' }, // activeUsers
              { value: '1540' }, // sessions
              { value: '4120' }, // screenPageViews
              { value: '890' }, // newUsers
            ],
          },
          {
            dimensionValues: [{ value: 'date_range_1' }],
            metricValues: [
              { value: '1000' },
              { value: '1210' },
              { value: '3300' },
              { value: '700' },
            ],
          },
        ],
      },
      // Report 1: Daily traffic
      {
        rows: [
          {
            dimensionValues: [{ value: '20261118' }],
            metricValues: [{ value: '85' }, { value: '240' }],
          },
          {
            dimensionValues: [{ value: '20261119' }],
            metricValues: [{ value: '110' }, { value: '315' }],
          },
        ],
      },
      // Report 2: Events
      {
        rows: [
          {
            dimensionValues: [{ value: 'configurator_option_select' }],
            metricValues: [{ value: '380' }, { value: '0' }],
          },
          {
            dimensionValues: [{ value: 'bulk_tier_unlocked' }],
            metricValues: [{ value: '45' }, { value: '0' }],
          },
          {
            dimensionValues: [{ value: 'quote_or_proforma_submitted' }],
            metricValues: [{ value: '28' }, { value: '1425.50' }],
          },
          {
            dimensionValues: [{ value: 'trade_contact_click' }],
            metricValues: [{ value: '19' }, { value: '0' }],
          },
        ],
      },
      // Report 3: Product pages
      {
        rows: [
          {
            dimensionValues: [
              { value: '/products/mesh-half-drop-stillage-cage?utm_source=google' },
              { value: 'page_view' },
            ],
            metricValues: [{ value: '620' }],
          },
          {
            dimensionValues: [
              { value: '/products/mesh-half-drop-stillage-cage' },
              { value: 'quote_or_proforma_submitted' },
            ],
            metricValues: [{ value: '11' }],
          },
          {
            dimensionValues: [
              { value: '/products/3-bay-cantilever-bar-rack/' },
              { value: 'page_view' },
            ],
            metricValues: [{ value: '410' }],
          },
        ],
      },
      // Report 4: Traffic channels
      {
        rows: [
          {
            dimensionValues: [{ value: 'Organic Search' }],
            metricValues: [{ value: '900' }, { value: '750' }],
          },
          {
            dimensionValues: [{ value: 'Direct' }],
            metricValues: [{ value: '600' }, { value: '500' }],
          },
        ],
      },
    ],
  };

  const catalog = [
    {
      slug: 'mesh-half-drop-stillage-cage',
      sku: 'SSS-MSH-1210HD',
      title: 'Mesh Sided Half-Drop Gate Stillage Cage',
    },
    {
      slug: '3-bay-cantilever-bar-rack',
      sku: 'SSS-CANT-3B8A',
      title: '3-Bay Cantilever Bar & Pipe Rack',
    },
  ];

  const ga4Metrics = parseGa4BatchReportResponse(ga4BatchPayload, catalog, '30d');
  assert.equal(ga4Metrics.siteVisitors, 1250);
  assert.equal(ga4Metrics.visitorsChangePct, 25);
  assert.equal(ga4Metrics.siteSessions, 1540);
  assert.equal(ga4Metrics.pageViews, 4120);
  assert.equal(ga4Metrics.productPageViews, 1030);
  assert.equal(ga4Metrics.configuratorEvents, 425);
  assert.equal(ga4Metrics.quoteSubmittedEvents, 28);
  assert.equal(ga4Metrics.quoteEventValueExVatPence, 142550);
  assert.equal(ga4Metrics.tradeContactClicks, 19);
  assert.deepEqual(ga4Metrics.dailyTraffic['2026-11-18'], { visitors: 85, pageViews: 240 });
  assert.equal(ga4Metrics.topChannels.length, 2);
  assert.equal(ga4Metrics.topChannels[0].sharePct, 60);

  const stripeOrder = normalizeStripeInvoice({
    id: 'in_merged_1',
    status: 'open',
    currency: 'gbp',
    total: 360000,
    created: Math.floor(Date.parse('2026-11-19T12:00:00Z') / 1000),
    customer_email: 'buyer@example.co.uk',
    customer_name: 'Buyer Co Ltd',
    hosted_invoice_url: 'https://invoice.stripe.com/i/test',
    metadata: { orderReference: 'SSS-SSS-CANT-3B8A-55555' },
    lines: {
      data: [
        {
          description:
            '3-Bay Cantilever Bar & Pipe Rack (SSS-CANT-3B8A) — Hot-Dip Galvanised, Standard Feet',
          quantity: 5,
          amount: 300000,
        },
        {
          description: 'UK Standard Rate VAT (20%)',
          quantity: 1,
          amount: 60000,
        },
      ],
    },
  });

  const summary = buildAdminAnalyticsSummary({
    orders: [stripeOrder],
    events: [],
    ga4Metrics,
    sources: {
      stripe: { status: 'test', usingFallback: false },
      googleAnalytics: {
        status: 'live',
        usingFallback: false,
        measurementIdConfigured: true,
        propertyIdMasked: '•••8765',
      },
    },
    totalCustomers: 9,
    newCustomersInPeriod: 3,
    range: '30d',
    now: FIXED_NOW,
  });

  assert.equal(summary.kpis.revenueExVatPence, 300000);
  assert.equal(summary.kpis.totalOrders, 1);
  assert.equal(summary.kpis.proformaOrders, 1);
  assert.equal(summary.kpis.siteVisitors, 1250);
  assert.equal(summary.kpis.visitorsChangePct, 25);
  assert.equal(summary.kpis.quotePipelineExVatPence, 442550); // 142,550 GA4 + 300,000 Stripe proforma
  assert.equal(summary.kpis.quoteCount, 29); // 28 GA4 quotes + 1 Stripe proforma

  // Trend series has daily visitors merged
  const nov19Point = summary.trendSeries.find((p) => p.isoDate === '2026-11-19');
  assert.ok(nov19Point);
  assert.equal(nov19Point.revenueExVatPence, 300000);
  assert.equal(nov19Point.visitors, 110);
  assert.equal(nov19Point.pageViews, 315);

  // Funnel steps 1-3 come from GA4, step 4 comes from Stripe orders
  assert.deepEqual(summary.funnel, [
    { step: 1, label: 'Product Views', count: 1030, conversionPct: 100 },
    { step: 2, label: 'Configurator Used', count: 425, conversionPct: 41.3 },
    { step: 3, label: 'Quote / Basket Added', count: 28, conversionPct: 2.7 },
    { step: 4, label: 'Paid / Invoiced Order', count: 1, conversionPct: 0.1 },
  ]);

  // Top products combine GA4 views/quotes + Stripe ordered units/revenue
  const cant = summary.topProducts.find((p) => p.sku === 'SSS-CANT-3B8A');
  assert.ok(cant);
  assert.equal(cant.views, 410);
  assert.equal(cant.ordersUnits, 5);
  assert.equal(cant.revenueExVatPence, 300000);

  assert.equal(summary.recentOrders[0].source, 'stripe');
  assert.equal(summary.recentOrders[0].hostedInvoiceUrl, 'https://invoice.stripe.com/i/test');
  assert.equal(summary.sources?.googleAnalytics.propertyIdMasked, '•••8765');
});

test('parseGa4InsightsBatchResponse parses top pages, UK locations, and device split while filtering admin routes', () => {
  const insights = parseGa4InsightsBatchResponse({
    reports: [
      {
        rows: [
          {
            dimensionValues: [
              { value: '/products/heavy-duty-sheet-steel-bin-stillage' },
              { value: 'Heavy-Duty Bin Stillage | Stillage Storage Solutions' },
            ],
            metricValues: [{ value: '620' }, { value: '410' }, { value: '0.742' }],
          },
          {
            dimensionValues: [{ value: '/admin/analytics' }, { value: 'Admin' }],
            metricValues: [{ value: '999' }, { value: '5' }, { value: '0.9' }],
          },
          {
            dimensionValues: [{ value: '/' }, { value: '(not set)' }],
            metricValues: [{ value: '540' }, { value: '380' }, { value: '0.68' }],
          },
        ],
      },
      {
        rows: [
          {
            dimensionValues: [
              { value: 'Birmingham' },
              { value: 'England' },
              { value: 'United Kingdom' },
            ],
            metricValues: [{ value: '300' }, { value: '340' }],
          },
          {
            dimensionValues: [
              { value: 'Wrexham' },
              { value: 'Wales' },
              { value: 'United Kingdom' },
            ],
            metricValues: [{ value: '200' }, { value: '220' }],
          },
        ],
      },
      {
        rows: [
          {
            dimensionValues: [{ value: 'desktop' }],
            metricValues: [{ value: '750' }, { value: '600' }],
          },
          {
            dimensionValues: [{ value: 'mobile' }],
            metricValues: [{ value: '250' }, { value: '220' }],
          },
        ],
      },
    ],
  });

  assert.equal(insights.topPages.length, 2);
  assert.equal(insights.topPages[0].path, '/products/heavy-duty-sheet-steel-bin-stillage');
  assert.equal(insights.topPages[0].title, 'Heavy-Duty Bin Stillage');
  assert.equal(insights.topPages[0].engagementRatePct, 74.2);
  assert.equal(insights.topPages[1].title, 'Homepage');

  assert.equal(insights.topRegions.length, 2);
  assert.equal(insights.topRegions[0].label, 'Birmingham, England');
  assert.equal(insights.topRegions[0].sharePct, 60);
  assert.equal(insights.topRegions[1].sharePct, 40);

  assert.deepEqual(insights.deviceBreakdown, [
    { device: 'Desktop', sessions: 750, visitors: 600, sharePct: 75 },
    { device: 'Mobile', sessions: 250, visitors: 220, sharePct: 25 },
  ]);

  const ga4WithOverview = parseGa4BatchReportResponse(
    {
      reports: [
        {
          dimensionHeaders: [{ name: 'dateRange' }],
          rows: [
            {
              dimensionValues: [{ value: 'date_range_0' }],
              metricValues: [
                { value: '820' },
                { value: '1000' },
                { value: '2600' },
                { value: '610' },
                { value: '0.715' },
                { value: '142.4' },
              ],
            },
          ],
        },
        {},
        {},
        {},
        {},
      ],
    },
    [],
    '30d'
  );
  ga4WithOverview.topPages = insights.topPages;
  ga4WithOverview.topRegions = insights.topRegions;
  ga4WithOverview.deviceBreakdown = insights.deviceBreakdown;

  assert.equal(ga4WithOverview.engagementRatePct, 71.5);
  assert.equal(ga4WithOverview.avgSessionDurationSec, 142);

  const summary = buildAdminAnalyticsSummary({
    orders: [],
    events: [],
    ga4Metrics: ga4WithOverview,
    totalCustomers: 0,
    newCustomersInPeriod: 0,
    range: '30d',
    now: FIXED_NOW,
  });

  assert.equal(summary.kpis.engagementRatePct, 71.5);
  assert.equal(summary.kpis.avgSessionDurationSec, 142);
  assert.equal(summary.kpis.newVisitors, 610);
  assert.equal(summary.topPages?.length, 2);
  assert.equal(summary.topRegions?.length, 2);
  assert.equal(summary.deviceBreakdown?.length, 2);
});
