import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdminAnalyticsSummary,
  serializeOrdersToCsv,
  parseAnalyticsRange,
} from '../src/lib/adminAnalytics.ts';

const FIXED_NOW = new Date('2026-11-19T12:00:00.000Z');

test('parseAnalyticsRange parses valid ranges case-insensitively and defaults invalid inputs to 30d', () => {
  assert.equal(parseAnalyticsRange('7d'), '7d');
  assert.equal(parseAnalyticsRange(' 7D '), '7d');
  assert.equal(parseAnalyticsRange('30d'), '30d');
  assert.equal(parseAnalyticsRange('90D'), '90d');
  assert.equal(parseAnalyticsRange('all'), 'all');
  assert.equal(parseAnalyticsRange(' ALL '), 'all');
  assert.equal(parseAnalyticsRange(''), '30d');
  assert.equal(parseAnalyticsRange('365d'), '30d');
  assert.equal(parseAnalyticsRange(null), '30d');
  assert.equal(parseAnalyticsRange(undefined), '30d');
});

test('buildAdminAnalyticsSummary computes revenue Ex VAT, card vs proforma split, period deltas, top 5 products, and 4-step funnel', () => {
  const orders = [
    // Current 30d window (2026-10-21 .. 2026-11-19):
    // Order 1: Card order, 100,000 + 5,000 delivery = 105,000 Ex VAT
    {
      id: 1,
      orderReference: 'SSS-ORD-101',
      customerEmail: 'buyer1@example.co.uk',
      companyName: 'Alpha Fabrication Ltd',
      paymentMode: 'card',
      status: 'paid',
      totalUnits: 10,
      subtotalExVatPence: 100_000,
      deliveryExVatPence: 5_000,
      vatPence: 21_000,
      totalIncVatPence: 126_000,
      postcode: 'B1 1AA',
      purchaseOrderNumber: 'PO-101',
      createdAt: '2026-11-18T10:00:00.000Z',
      itemsJson: [
        {
          sku: 'SKU-A',
          title: 'Heavy Mesh Cage',
          quantity: 10,
          lineSubtotalExVatPence: 100_000,
          finishOption: 'standard-blue',
          mobilityOption: 'forklift-pockets',
        },
      ],
    },
    // Order 2: Proforma order using totalIncVatPence - vatPence fallback = 45,000 Ex VAT
    {
      id: 2,
      orderReference: 'SSS-ORD-102',
      customerEmail: 'buyer2@example.co.uk',
      companyName: 'Beta Logistics Ltd',
      paymentMode: 'b2b_proforma',
      status: 'invoiced',
      totalUnits: 8,
      vatPence: 9_000,
      totalIncVatPence: 54_000,
      postcode: 'LS1 2AB',
      purchaseOrderNumber: 'PO-102',
      createdAt: '2026-11-10T14:30:00.000Z',
      itemsJson: [
        {
          sku: 'SKU-B',
          title: 'Cantilever Rack',
          quantity: 8,
          lineSubtotalExVatPence: 45_000,
          finishOption: 'galvanised',
          mobilityOption: 'standard-feet',
        },
      ],
    },
    // Order 3: Stripe card order, 150,000 Ex VAT (current period total active revenue = 300,000, orders = 3)
    {
      id: 3,
      orderReference: 'SSS-ORD-103',
      customerEmail: 'buyer3@example.co.uk',
      companyName: 'Gamma Engineering Ltd',
      paymentMode: 'stripe_card',
      status: 'dispatched',
      totalUnits: 6,
      subtotalExVatPence: 140_000,
      deliveryExVatPence: 10_000,
      vatPence: 30_000,
      totalIncVatPence: 180_000,
      postcode: 'M1 3CD',
      purchaseOrderNumber: null,
      createdAt: '2026-11-05T09:00:00.000Z',
      itemsJson: [
        {
          sku: 'SKU-C',
          title: 'Solid Sheet Bin',
          quantity: 6,
          lineSubtotalExVatPence: 140_000,
          finishOption: 'raw-steel',
          mobilityOption: 'heavy-duty-castors',
        },
      ],
    },
    // Order 4: Cancelled order in period — excluded from active revenue, card/proforma counts, and completed funnel count
    {
      id: 4,
      orderReference: 'SSS-ORD-104',
      customerEmail: 'cancelled@example.co.uk',
      companyName: 'Cancelled Co',
      paymentMode: 'card',
      status: 'cancelled',
      totalUnits: 99,
      subtotalExVatPence: 500_000,
      deliveryExVatPence: 0,
      vatPence: 100_000,
      totalIncVatPence: 600_000,
      postcode: 'SW1A 1AA',
      purchaseOrderNumber: null,
      createdAt: '2026-11-02T09:00:00.000Z',
      itemsJson: [
        {
          sku: 'SKU-CANCELLED',
          title: 'Should Not Count',
          quantity: 99,
          lineSubtotalExVatPence: 500_000,
        },
      ],
    },
    // Previous 30d window (2026-09-21 .. 2026-10-20): 2 orders totaling 200,000 Ex VAT
    // Expected deltas: revenue +50.0% ((300k - 200k)/200k), orders +50.0% ((3 - 2)/2)
    {
      id: 5,
      orderReference: 'SSS-ORD-090',
      customerEmail: 'prev1@example.co.uk',
      paymentMode: 'card',
      status: 'paid',
      totalUnits: 5,
      subtotalExVatPence: 120_000,
      deliveryExVatPence: 0,
      vatPence: 24_000,
      totalIncVatPence: 144_000,
      postcode: 'B1 1AA',
      createdAt: '2026-10-15T12:00:00.000Z',
      itemsJson: [],
    },
    {
      id: 6,
      orderReference: 'SSS-ORD-091',
      customerEmail: 'prev2@example.co.uk',
      paymentMode: 'proforma',
      status: 'invoiced',
      totalUnits: 4,
      subtotalExVatPence: 80_000,
      deliveryExVatPence: 0,
      vatPence: 16_000,
      totalIncVatPence: 96_000,
      postcode: 'B1 1AA',
      createdAt: '2026-10-01T12:00:00.000Z',
      itemsJson: [],
    },
  ];

  // Events in current 30d window:
  // - 10 page_view events across SKUs (scores: SKU-A=10+3=13, SKU-B=8+1=9, SKU-C=6+1=7, SKU-D=5, SKU-E=3, SKU-F=1 -> top 5 excludes SKU-F)
  // - 5 configurator events (4 configurator_option_select + 1 bulk_tier_unlocked)
  // - 2 quote_or_proforma_submitted events (totalExVatPence 25,000 + 15,000 = 40,000)
  const events = [
    // 10 page_views (4 on SKU-D, 2 on SKU-E, 1 on SKU-F, 3 on SKU-A)
    { eventName: 'page_view', sku: 'SKU-A', productTitle: 'Heavy Mesh Cage', createdAt: '2026-11-17T10:00:00Z' },
    { eventName: 'page_view', sku: 'SKU-A', productTitle: 'Heavy Mesh Cage', createdAt: '2026-11-17T10:01:00Z' },
    { eventName: 'page_view', sku: 'SKU-A', productTitle: 'Heavy Mesh Cage', createdAt: '2026-11-17T10:02:00Z' },
    { eventName: 'page_view', sku: 'SKU-D', productTitle: 'Post Pallet', createdAt: '2026-11-16T10:00:00Z' },
    { eventName: 'page_view', sku: 'SKU-D', productTitle: 'Post Pallet', createdAt: '2026-11-16T10:01:00Z' },
    { eventName: 'page_view', sku: 'SKU-D', productTitle: 'Post Pallet', createdAt: '2026-11-16T10:02:00Z' },
    { eventName: 'page_view', sku: 'SKU-D', productTitle: 'Post Pallet', createdAt: '2026-11-16T10:03:00Z' },
    { eventName: 'page_view', sku: 'SKU-E', productTitle: 'Hopper Bin', createdAt: '2026-11-15T10:00:00Z' },
    { eventName: 'page_view', sku: 'SKU-E', productTitle: 'Hopper Bin', createdAt: '2026-11-15T10:01:00Z' },
    { eventName: 'page_view', sku: 'SKU-F', productTitle: 'Lowest Score SKU', createdAt: '2026-11-14T10:00:00Z' },

    // 5 configurator interactions
    {
      eventName: 'configurator_option_select',
      sku: 'SKU-A',
      optionType: 'finish',
      optionValue: 'standard-blue',
      createdAt: '2026-11-17T11:00:00Z',
    },
    {
      eventName: 'configurator_option_select',
      sku: 'SKU-B',
      optionType: 'mobility',
      optionValue: 'standard-feet',
      createdAt: '2026-11-17T11:05:00Z',
    },
    {
      eventName: 'configurator_option_select',
      sku: 'SKU-D',
      optionType: 'finish',
      optionValue: 'custom-ral',
      createdAt: '2026-11-17T11:10:00Z',
    },
    {
      eventName: 'configurator_option_select',
      sku: 'SKU-E',
      optionType: 'mobility',
      optionValue: 'both-castors-pockets',
      createdAt: '2026-11-17T11:15:00Z',
    },
    {
      eventName: 'bulk_tier_unlocked',
      sku: 'SKU-A',
      createdAt: '2026-11-17T11:20:00Z',
    },

    // 2 quote submissions (give +1 quote score to SKU-B and SKU-C; +1 to SKU-D and SKU-E? Keep SKU-D=4+1=5, SKU-E=2+1=3? Use SKU-B & SKU-C)
    {
      eventName: 'quote_or_proforma_submitted',
      sku: 'SKU-B',
      totalExVatPence: 25_000,
      createdAt: '2026-11-12T10:00:00Z',
    },
    {
      eventName: 'quote_or_proforma_submitted',
      sku: 'SKU-C',
      totalExVatPence: 15_000,
      createdAt: '2026-11-12T11:00:00Z',
    },
    // Out-of-range event (before 30d window) — must be ignored
    {
      eventName: 'page_view',
      sku: 'SKU-F',
      createdAt: '2026-09-01T10:00:00Z',
    },
  ];

  const summary = buildAdminAnalyticsSummary({
    orders,
    events,
    totalCustomers: 12,
    newCustomersInPeriod: 4,
    range: '30d',
    now: FIXED_NOW,
  });

  // Revenue Ex VAT & order split
  assert.equal(summary.range, '30d');
  assert.equal(summary.kpis.revenueExVatPence, 300_000);
  assert.equal(summary.kpis.totalOrders, 3);
  assert.equal(summary.kpis.cardOrders, 2);
  assert.equal(summary.kpis.proformaOrders, 1);
  assert.equal(summary.kpis.cardOrders + summary.kpis.proformaOrders, summary.kpis.totalOrders);
  assert.equal(summary.kpis.quotePipelineExVatPence, 85_000); // 40,000 quote events + 45,000 proforma order
  assert.equal(summary.kpis.quoteCount, 3); // 2 quote events + 1 proforma order
  assert.equal(summary.kpis.totalCustomers, 12);
  assert.equal(summary.kpis.newCustomers, 4);

  // Period delta % vs previous 30 days
  assert.equal(summary.kpis.revenueChangePct, 50);
  assert.equal(summary.kpis.ordersChangePct, 50);

  // Trend series has 30 daily buckets for '30d'
  assert.equal(summary.trendSeries.length, 30);

  // Top 5 products sorted by (ordersUnits + quotes + views) descending
  assert.equal(summary.topProducts.length, 5);
  assert.deepEqual(
    summary.topProducts.map((p) => p.sku),
    ['SKU-A', 'SKU-B', 'SKU-C', 'SKU-D', 'SKU-E']
  );
  assert.equal(summary.topProducts[0].ordersUnits, 10);
  assert.equal(summary.topProducts[0].views, 3);
  assert.equal(
    summary.topProducts[0].popularConfig,
    'RAL 5010 Blue • Forklift Pockets'
  );
  assert.equal(
    summary.topProducts.some((p) => p.sku === 'SKU-F'),
    false
  );
  assert.equal(
    summary.topProducts.some((p) => p.sku === 'SKU-CANCELLED'),
    false
  );

  // 4-step funnel conversion percentages (relative to 10 product views)
  assert.equal(summary.funnel.length, 4);
  assert.deepEqual(summary.funnel, [
    { step: 1, label: 'Product Views', count: 10, conversionPct: 100 },
    { step: 2, label: 'Configurator Used', count: 5, conversionPct: 50 },
    { step: 3, label: 'Quote / Basket Added', count: 2, conversionPct: 20 },
    { step: 4, label: 'Paid / Invoiced Order', count: 3, conversionPct: 30 },
  ]);

  // All-time range disables period-over-period delta
  const allTimeSummary = buildAdminAnalyticsSummary({
    orders,
    events,
    totalCustomers: 12,
    newCustomersInPeriod: 12,
    range: 'all',
    now: FIXED_NOW,
  });
  assert.equal(allTimeSummary.kpis.revenueChangePct, null);
  assert.equal(allTimeSummary.kpis.ordersChangePct, null);
  assert.equal(allTimeSummary.kpis.totalOrders, 5);
  assert.equal(allTimeSummary.kpis.revenueExVatPence, 500_000);
});

test('buildAdminAnalyticsSummary handles empty orders and events without NaN or division-by-zero', () => {
  for (const range of ['7d', '30d', '90d', 'all']) {
    const summary = buildAdminAnalyticsSummary({
      orders: [],
      events: [],
      totalCustomers: 0,
      newCustomersInPeriod: 0,
      range,
      now: FIXED_NOW,
    });

    assert.equal(summary.kpis.revenueExVatPence, 0);
    assert.equal(summary.kpis.totalOrders, 0);
    assert.equal(summary.kpis.cardOrders, 0);
    assert.equal(summary.kpis.proformaOrders, 0);
    assert.equal(summary.kpis.quotePipelineExVatPence, 0);
    assert.equal(summary.kpis.quoteCount, 0);
    assert.equal(summary.kpis.totalCustomers, 0);
    assert.equal(summary.kpis.newCustomers, 0);
    assert.equal(summary.kpis.revenueChangePct, range === 'all' ? null : 0);
    assert.equal(summary.kpis.ordersChangePct, range === 'all' ? null : 0);

    assert.deepEqual(summary.topProducts, []);
    assert.deepEqual(summary.recentOrders, []);
    assert.equal(summary.funnel.length, 4);
    for (const step of summary.funnel) {
      assert.equal(step.count, 0);
      assert.equal(step.conversionPct, 0);
      assert.equal(Number.isNaN(step.conversionPct), false);
    }

    assert.ok(summary.trendSeries.length >= 1);
    for (const point of summary.trendSeries) {
      assert.equal(point.revenueExVatPence, 0);
      assert.equal(point.ordersCount, 0);
      assert.equal(Number.isNaN(point.revenueExVatPence), false);
    }
  }

  // Also ensure zero views + non-zero orders yields 0% conversion without Infinity or NaN
  const zeroViewsSummary = buildAdminAnalyticsSummary({
    orders: [
      {
        id: 1,
        orderReference: 'SSS-NO-VIEWS',
        customerEmail: 'buyer@example.co.uk',
        paymentMode: 'card',
        status: 'paid',
        totalUnits: 2,
        subtotalExVatPence: 50_000,
        deliveryExVatPence: 0,
        vatPence: 10_000,
        totalIncVatPence: 60_000,
        postcode: 'B1 1AA',
        createdAt: '2026-11-18T10:00:00.000Z',
        itemsJson: [],
      },
    ],
    events: [],
    totalCustomers: 1,
    newCustomersInPeriod: 1,
    range: '30d',
    now: FIXED_NOW,
  });

  for (const step of zeroViewsSummary.funnel) {
    assert.equal(step.conversionPct, 0);
    assert.equal(Number.isFinite(step.conversionPct), true);
  }
});

test('serializeOrdersToCsv escapes commas/quotes and neutralizes CSV formula injection payloads', () => {
  const csv = serializeOrdersToCsv([
    {
      orderReference: '=SUM(A1:A2)',
      createdAt: '2026-11-18T09:30:00.000Z',
      companyName: 'Acme "Steel", Ltd',
      customerEmail: '+cmd@example.com',
      paymentMode: 'b2b_proforma',
      status: 'invoiced',
      totalUnits: 12,
      subtotalExVatPence: 100_000,
      deliveryExVatPence: 5_000,
      vatPence: 21_000,
      totalIncVatPence: 126_000,
      postcode: '-cmd',
      purchaseOrderNumber: '@foo,bar',
    },
  ]);

  const lines = csv.split('\r\n');
  assert.equal(lines.length, 2);
  assert.equal(
    lines[0],
    'Order Reference,Date,Company,Customer Email,Payment Mode,Status,Units,Total Ex VAT (GBP),VAT (GBP),Total Inc VAT (GBP),Postcode,PO Number'
  );
  assert.equal(
    lines[1],
    `'=SUM(A1:A2),2026-11-18,"Acme ""Steel"", Ltd",'+cmd@example.com,b2b_proforma,invoiced,12,1050.00,210.00,1260.00,'-cmd,"'@foo,bar"`
  );
});
