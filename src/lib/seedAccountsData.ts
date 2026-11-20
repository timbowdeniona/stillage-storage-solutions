import { FINISH_OPTIONS, MOBILITY_OPTIONS, SEED_PRODUCTS } from '@/data/seedCatalog';
import { calculateBasketSummary } from '@/lib/pricing';
import type {
  AnalyticsEventRecord,
  OrderItemRecord,
  OrderRecord,
  UserRecord,
} from '../../db/schema';

function daysAgo(base: Date, days: number, hourUtc = 10, minuteUtc = 15): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return d;
}

export function buildSeedUsers(now: Date = new Date()): UserRecord[] {
  return [
    {
      id: 1,
      email: 'timdbowden@gmail.com',
      name: 'Tim Bowden',
      image: null,
      role: 'admin',
      provider: 'google',
      companyName: 'Stillage Storage Solutions',
      phone: '01978 800 500',
      defaultPostcode: 'LL13 9UG',
      defaultTailLift: false,
      createdAt: daysAgo(now, 120, 9, 0),
      lastLoginAt: daysAgo(now, 1, 8, 30),
    },
    {
      id: 2,
      email: 'admin@plantandrobinson.com',
      name: 'Plant & Robinson Admin',
      image: null,
      role: 'admin',
      provider: 'microsoft-entra-id',
      companyName: 'Plant & Robinson Ltd',
      phone: null,
      defaultPostcode: null,
      defaultTailLift: false,
      createdAt: daysAgo(now, 90, 9, 30),
      lastLoginAt: daysAgo(now, 2, 11, 0),
    },
    {
      id: 3,
      email: 'tim@valleychapel.co.uk',
      name: 'Tim (Valley Chapel)',
      image: null,
      role: 'customer',
      provider: 'google',
      companyName: 'Valley Chapel Storage & Logistics',
      phone: '01978 800 512',
      defaultPostcode: 'LL13 9UG',
      defaultTailLift: false,
      createdAt: daysAgo(now, 45, 10, 0),
      lastLoginAt: daysAgo(now, 3, 14, 20),
    },
    {
      id: 4,
      email: 'procurement@midlandspressings.co.uk',
      name: 'Claire Henderson',
      image: null,
      role: 'customer',
      provider: 'microsoft-entra-id',
      companyName: 'Midlands Pressings & Stamping Ltd',
      phone: '0121 496 0321',
      defaultPostcode: 'B46 1AB',
      defaultTailLift: false,
      createdAt: daysAgo(now, 28, 11, 15),
      lastLoginAt: daysAgo(now, 2, 9, 45),
    },
    {
      id: 5,
      email: 'yards@clydebankcivil.co.uk',
      name: 'Callum MacLeod',
      image: null,
      role: 'customer',
      provider: 'google',
      companyName: 'Clydebank Civil Engineering Ltd',
      phone: '0141 496 0780',
      defaultPostcode: 'G81 1AB',
      defaultTailLift: true,
      createdAt: daysAgo(now, 19, 13, 10),
      lastLoginAt: daysAgo(now, 5, 16, 5),
    },
    {
      id: 6,
      email: 'buying@yorkshiresteelworks.co.uk',
      name: 'Hannah Whitaker',
      image: null,
      role: 'customer',
      provider: 'facebook',
      companyName: 'Yorkshire Structural Steelworks Ltd',
      phone: '0114 496 0442',
      defaultPostcode: 'S9 2TN',
      defaultTailLift: false,
      createdAt: daysAgo(now, 12, 15, 40),
      lastLoginAt: daysAgo(now, 4, 12, 10),
    },
  ];
}

interface SeedOrderSpec {
  id: number;
  orderReference: string;
  userId: number;
  customerEmail: string;
  companyName: string;
  purchaseOrderNumber: string | null;
  paymentMode: 'card' | 'b2b_proforma';
  status: string;
  stripeSessionId: string | null;
  stripeInvoiceId: string | null;
  invoiceNumber: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  sku: string;
  quantity: number;
  finishOption: string;
  mobilityOption: string;
  postcode: string;
  requiresTailLift: boolean;
  daysAgo: number;
  hourUtc: number;
}

const SEED_ORDER_SPECS: SeedOrderSpec[] = [
  {
    id: 1,
    orderReference: 'SSS-SHT-1210-4821',
    userId: 3,
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
    sku: 'SSS-SHT-1210',
    quantity: 8,
    finishOption: 'standard-blue',
    mobilityOption: 'forklift-pockets',
    postcode: 'LL13 9UG',
    requiresTailLift: false,
    daysAgo: 6,
    hourUtc: 10,
  },
  {
    id: 2,
    orderReference: 'SSS-CANT-3B8A-4819',
    userId: 3,
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
    sku: 'SSS-CANT-3B8A',
    quantity: 4,
    finishOption: 'galvanised',
    mobilityOption: 'standard-feet',
    postcode: 'LL13 9UG',
    requiresTailLift: false,
    daysAgo: 14,
    hourUtc: 14,
  },
  {
    id: 3,
    orderReference: 'SSS-MSH-1210HD-4780',
    userId: 3,
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
    sku: 'SSS-MSH-1210HD',
    quantity: 12,
    finishOption: 'standard-blue',
    mobilityOption: 'heavy-duty-castors',
    postcode: 'LL13 9UG',
    requiresTailLift: true,
    daysAgo: 26,
    hourUtc: 9,
  },
  {
    id: 4,
    orderReference: 'SSS-HOP-4T1000-4890',
    userId: 4,
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
    sku: 'SSS-HOP-4T1000',
    quantity: 4,
    finishOption: 'standard-blue',
    mobilityOption: 'forklift-pockets',
    postcode: 'B46 1AB',
    requiresTailLift: false,
    daysAgo: 2,
    hourUtc: 11,
  },
  {
    id: 5,
    orderReference: 'SSS-PST-1111D-4855',
    userId: 5,
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
    sku: 'SSS-PST-1111D',
    quantity: 16,
    finishOption: 'galvanised',
    mobilityOption: 'forklift-pockets',
    postcode: 'G81 1AB',
    requiresTailLift: true,
    daysAgo: 9,
    hourUtc: 15,
  },
  {
    id: 6,
    orderReference: 'SSS-CANT-2B4A-4802',
    userId: 6,
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
    sku: 'SSS-CANT-2B4A',
    quantity: 6,
    finishOption: 'custom-ral',
    mobilityOption: 'standard-feet',
    postcode: 'S9 2TN',
    requiresTailLift: false,
    daysAgo: 18,
    hourUtc: 13,
  },
  {
    id: 7,
    orderReference: 'SSS-SHT-1210-4791',
    userId: 4,
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
    sku: 'SSS-SHT-1210',
    quantity: 10,
    finishOption: 'raw-steel',
    mobilityOption: 'both-castors-pockets',
    postcode: 'B46 1AB',
    requiresTailLift: false,
    daysAgo: 23,
    hourUtc: 16,
  },
];

function computeOrderFromSpec(spec: SeedOrderSpec, now: Date): OrderRecord {
  const product = SEED_PRODUCTS.find((p) => p.sku === spec.sku) ?? SEED_PRODUCTS[0];
  const finish = FINISH_OPTIONS.find((f) => f.id === spec.finishOption) ?? FINISH_OPTIONS[0];
  const mobility = MOBILITY_OPTIONS.find((m) => m.id === spec.mobilityOption) ?? MOBILITY_OPTIONS[0];

  const summary = calculateBasketSummary(
    [
      {
        sku: product.sku,
        title: product.title,
        slug: product.slug,
        basePriceExVatPence: product.basePriceExVatPence,
        quantity: spec.quantity,
        finishOption: finish.id,
        finishName: finish.name,
        mobilityOption: mobility.id,
        mobilityName: mobility.name,
        primaryImage: product.primaryImage,
      },
    ],
    spec.postcode,
    spec.requiresTailLift
  );

  const itemsJson: OrderItemRecord[] = summary.items.map((item) => ({
    sku: item.sku,
    title: item.title,
    slug: item.slug,
    quantity: item.quantity,
    basePriceExVatPence: item.basePriceExVatPence,
    finishOption: item.finishOption,
    finishName: item.finishName,
    mobilityOption: item.mobilityOption,
    mobilityName: item.mobilityName,
    primaryImage: item.primaryImage,
    discountedUnitExVatPence: item.discountedUnitExVatPence,
    lineSubtotalExVatPence: item.lineSubtotalExVatPence,
  }));

  const timestamp = daysAgo(now, spec.daysAgo, spec.hourUtc, 20);

  return {
    id: spec.id,
    orderReference: spec.orderReference,
    userId: spec.userId,
    customerEmail: spec.customerEmail.trim().toLowerCase(),
    companyName: spec.companyName,
    purchaseOrderNumber: spec.purchaseOrderNumber,
    paymentMode: spec.paymentMode,
    status: spec.status,
    stripeSessionId: spec.stripeSessionId,
    stripeInvoiceId: spec.stripeInvoiceId,
    invoiceNumber: spec.invoiceNumber,
    hostedInvoiceUrl: spec.hostedInvoiceUrl,
    invoicePdfUrl: spec.invoicePdfUrl,
    itemsJson,
    totalUnits: summary.totalUnits,
    subtotalExVatPence: summary.goodsSubtotalExVatPence,
    deliveryExVatPence: summary.deliveryExVatPence,
    vatPence: summary.vatAmountPence,
    totalIncVatPence: summary.totalIncVatPence,
    postcode: summary.postcode,
    deliveryZone: summary.deliveryZone,
    requiresTailLift: summary.requiresTailLift,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildSeedOrders(now: Date = new Date()): OrderRecord[] {
  return SEED_ORDER_SPECS.map((spec) => computeOrderFromSpec(spec, now));
}

interface SeedAnalyticsBlueprint {
  daysAgo: number;
  hourUtc: number;
  eventName:
    | 'page_view'
    | 'configurator_option_select'
    | 'bulk_tier_unlocked'
    | 'quote_or_proforma_submitted'
    | 'trade_contact_click';
  userId?: number | null;
  sessionId: string;
  sku?: string | null;
  optionType?: string | null;
  optionValue?: string | null;
  quantity?: number | null;
  discountPercentage?: number | null;
  totalExVatPence?: number | null;
  paymentMethod?: string | null;
  contactMethod?: string | null;
  path?: string | null;
}

const SEED_ANALYTICS_BLUEPRINTS: SeedAnalyticsBlueprint[] = [
  // Last 7 days (rich recent funnel & order activity)
  { daysAgo: 0, hourUtc: 9, eventName: 'page_view', sessionId: 'seed-session-01', path: '/' },
  { daysAgo: 0, hourUtc: 9, eventName: 'page_view', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210' },
  { daysAgo: 0, hourUtc: 10, eventName: 'configurator_option_select', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210', optionType: 'finish', optionValue: 'galvanised', quantity: 8 },
  { daysAgo: 0, hourUtc: 10, eventName: 'bulk_tier_unlocked', sessionId: 'seed-session-01', sku: 'SSS-SHT-1210', quantity: 8, discountPercentage: 5 },
  { daysAgo: 1, hourUtc: 11, eventName: 'page_view', sessionId: 'seed-session-02', sku: 'SSS-CANT-3B8A' },
  { daysAgo: 1, hourUtc: 11, eventName: 'configurator_option_select', sessionId: 'seed-session-02', sku: 'SSS-CANT-3B8A', optionType: 'mobility', optionValue: 'forklift-pockets', quantity: 4 },
  { daysAgo: 1, hourUtc: 14, eventName: 'trade_contact_click', sessionId: 'seed-session-02', contactMethod: 'phone', path: '/contact' },
  { daysAgo: 2, hourUtc: 10, eventName: 'page_view', userId: 4, sessionId: 'seed-session-03', sku: 'SSS-HOP-4T1000' },
  { daysAgo: 2, hourUtc: 10, eventName: 'configurator_option_select', userId: 4, sessionId: 'seed-session-03', sku: 'SSS-HOP-4T1000', optionType: 'mobility', optionValue: 'forklift-pockets', quantity: 4 },
  { daysAgo: 2, hourUtc: 11, eventName: 'quote_or_proforma_submitted', userId: 4, sessionId: 'seed-session-03', sku: 'SSS-HOP-4T1000', quantity: 4, totalExVatPence: 235900, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 3, hourUtc: 9, eventName: 'page_view', userId: 3, sessionId: 'seed-session-04', path: '/' },
  { daysAgo: 3, hourUtc: 10, eventName: 'page_view', userId: 3, sessionId: 'seed-session-04', sku: 'SSS-MSH-1210HD' },
  { daysAgo: 3, hourUtc: 15, eventName: 'trade_contact_click', sessionId: 'seed-session-05', contactMethod: 'email', path: '/contact' },
  { daysAgo: 4, hourUtc: 11, eventName: 'page_view', userId: 6, sessionId: 'seed-session-06', sku: 'SSS-CANT-2B4A' },
  { daysAgo: 4, hourUtc: 12, eventName: 'configurator_option_select', userId: 6, sessionId: 'seed-session-06', sku: 'SSS-CANT-2B4A', optionType: 'finish', optionValue: 'custom-ral', quantity: 10 },
  { daysAgo: 4, hourUtc: 12, eventName: 'bulk_tier_unlocked', userId: 6, sessionId: 'seed-session-06', sku: 'SSS-CANT-2B4A', quantity: 10, discountPercentage: 10 },
  { daysAgo: 5, hourUtc: 10, eventName: 'page_view', userId: 5, sessionId: 'seed-session-07', sku: 'SSS-PST-1111D' },
  { daysAgo: 5, hourUtc: 16, eventName: 'trade_contact_click', userId: 5, sessionId: 'seed-session-07', contactMethod: 'phone', path: '/products/heavy-duty-post-pallet-demountable-posts' },
  { daysAgo: 6, hourUtc: 9, eventName: 'page_view', userId: 3, sessionId: 'seed-session-08', sku: 'SSS-SHT-1210' },
  { daysAgo: 6, hourUtc: 9, eventName: 'configurator_option_select', userId: 3, sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', optionType: 'mobility', optionValue: 'forklift-pockets', quantity: 8 },
  { daysAgo: 6, hourUtc: 10, eventName: 'bulk_tier_unlocked', userId: 3, sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', quantity: 8, discountPercentage: 5 },
  { daysAgo: 6, hourUtc: 10, eventName: 'quote_or_proforma_submitted', userId: 3, sessionId: 'seed-session-08', sku: 'SSS-SHT-1210', quantity: 8, totalExVatPence: 179440, paymentMethod: 'stripe_card', path: '/checkout' },

  // Days 8 to 29 (full 30-day trend history)
  { daysAgo: 8, hourUtc: 10, eventName: 'page_view', sessionId: 'seed-session-09', sku: 'SSS-SHT-1210' },
  { daysAgo: 8, hourUtc: 11, eventName: 'configurator_option_select', sessionId: 'seed-session-09', sku: 'SSS-SHT-1210', optionType: 'finish', optionValue: 'standard-blue', quantity: 6 },
  { daysAgo: 9, hourUtc: 14, eventName: 'page_view', userId: 5, sessionId: 'seed-session-10', sku: 'SSS-PST-1111D' },
  { daysAgo: 9, hourUtc: 14, eventName: 'configurator_option_select', userId: 5, sessionId: 'seed-session-10', sku: 'SSS-PST-1111D', optionType: 'finish', optionValue: 'galvanised', quantity: 16 },
  { daysAgo: 9, hourUtc: 15, eventName: 'bulk_tier_unlocked', userId: 5, sessionId: 'seed-session-10', sku: 'SSS-PST-1111D', quantity: 16, discountPercentage: 10 },
  { daysAgo: 9, hourUtc: 15, eventName: 'quote_or_proforma_submitted', userId: 5, sessionId: 'seed-session-10', sku: 'SSS-PST-1111D', quantity: 16, totalExVatPence: 345580, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 11, hourUtc: 9, eventName: 'page_view', sessionId: 'seed-session-11', path: '/' },
  { daysAgo: 11, hourUtc: 10, eventName: 'page_view', sessionId: 'seed-session-11', sku: 'SSS-MSH-1210HD' },
  { daysAgo: 12, hourUtc: 13, eventName: 'configurator_option_select', sessionId: 'seed-session-12', sku: 'SSS-MSH-1210HD', optionType: 'mobility', optionValue: 'heavy-duty-castors', quantity: 5 },
  { daysAgo: 12, hourUtc: 13, eventName: 'bulk_tier_unlocked', sessionId: 'seed-session-12', sku: 'SSS-MSH-1210HD', quantity: 5, discountPercentage: 5 },
  { daysAgo: 14, hourUtc: 13, eventName: 'page_view', userId: 3, sessionId: 'seed-session-13', sku: 'SSS-CANT-3B8A' },
  { daysAgo: 14, hourUtc: 14, eventName: 'configurator_option_select', userId: 3, sessionId: 'seed-session-13', sku: 'SSS-CANT-3B8A', optionType: 'finish', optionValue: 'galvanised', quantity: 4 },
  { daysAgo: 14, hourUtc: 14, eventName: 'quote_or_proforma_submitted', userId: 3, sessionId: 'seed-session-13', sku: 'SSS-CANT-3B8A', quantity: 4, totalExVatPence: 178500, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 16, hourUtc: 11, eventName: 'trade_contact_click', sessionId: 'seed-session-14', contactMethod: 'email', path: '/contact' },
  { daysAgo: 17, hourUtc: 10, eventName: 'page_view', sessionId: 'seed-session-15', sku: 'SSS-HOP-4T1000' },
  { daysAgo: 18, hourUtc: 12, eventName: 'page_view', userId: 6, sessionId: 'seed-session-16', sku: 'SSS-CANT-2B4A' },
  { daysAgo: 18, hourUtc: 12, eventName: 'configurator_option_select', userId: 6, sessionId: 'seed-session-16', sku: 'SSS-CANT-2B4A', optionType: 'finish', optionValue: 'custom-ral', quantity: 6 },
  { daysAgo: 18, hourUtc: 13, eventName: 'bulk_tier_unlocked', userId: 6, sessionId: 'seed-session-16', sku: 'SSS-CANT-2B4A', quantity: 6, discountPercentage: 5 },
  { daysAgo: 18, hourUtc: 13, eventName: 'quote_or_proforma_submitted', userId: 6, sessionId: 'seed-session-16', sku: 'SSS-CANT-2B4A', quantity: 6, totalExVatPence: 198200, paymentMethod: 'proforma_invoice', path: '/checkout' },
  { daysAgo: 20, hourUtc: 9, eventName: 'page_view', sessionId: 'seed-session-17', sku: 'SSS-SHT-1210' },
  { daysAgo: 21, hourUtc: 14, eventName: 'trade_contact_click', sessionId: 'seed-session-17', contactMethod: 'phone', path: '/' },
  { daysAgo: 23, hourUtc: 15, eventName: 'page_view', userId: 4, sessionId: 'seed-session-18', sku: 'SSS-SHT-1210' },
  { daysAgo: 23, hourUtc: 15, eventName: 'configurator_option_select', userId: 4, sessionId: 'seed-session-18', sku: 'SSS-SHT-1210', optionType: 'mobility', optionValue: 'both-castors-pockets', quantity: 10 },
  { daysAgo: 23, hourUtc: 16, eventName: 'bulk_tier_unlocked', userId: 4, sessionId: 'seed-session-18', sku: 'SSS-SHT-1210', quantity: 10, discountPercentage: 10 },
  { daysAgo: 23, hourUtc: 16, eventName: 'quote_or_proforma_submitted', userId: 4, sessionId: 'seed-session-18', sku: 'SSS-SHT-1210', quantity: 10, totalExVatPence: 256800, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 26, hourUtc: 8, eventName: 'page_view', userId: 3, sessionId: 'seed-session-19', sku: 'SSS-MSH-1210HD' },
  { daysAgo: 26, hourUtc: 9, eventName: 'configurator_option_select', userId: 3, sessionId: 'seed-session-19', sku: 'SSS-MSH-1210HD', optionType: 'mobility', optionValue: 'heavy-duty-castors', quantity: 12 },
  { daysAgo: 26, hourUtc: 9, eventName: 'bulk_tier_unlocked', userId: 3, sessionId: 'seed-session-19', sku: 'SSS-MSH-1210HD', quantity: 12, discountPercentage: 10 },
  { daysAgo: 26, hourUtc: 9, eventName: 'quote_or_proforma_submitted', userId: 3, sessionId: 'seed-session-19', sku: 'SSS-MSH-1210HD', quantity: 12, totalExVatPence: 268320, paymentMethod: 'stripe_card', path: '/checkout' },
  { daysAgo: 28, hourUtc: 11, eventName: 'page_view', sessionId: 'seed-session-20', sku: 'SSS-CANT-3B8A' },
  { daysAgo: 28, hourUtc: 11, eventName: 'trade_contact_click', sessionId: 'seed-session-20', contactMethod: 'phone', path: '/products/3-bay-double-sided-cantilever-bar-rack' },
];

export function buildSeedAnalyticsEvents(now: Date = new Date()): AnalyticsEventRecord[] {
  const productBySku = new Map(SEED_PRODUCTS.map((p) => [p.sku, p]));

  return SEED_ANALYTICS_BLUEPRINTS.map((bp, index) => {
    const product = bp.sku ? productBySku.get(bp.sku) : undefined;
    const resolvedPath =
      bp.path ?? (product ? `/products/${product.slug}` : '/');

    return {
      id: index + 1,
      eventName: bp.eventName,
      userId: bp.userId ?? null,
      sessionId: bp.sessionId,
      sku: bp.sku ?? null,
      productTitle: product ? product.title : null,
      optionType: bp.optionType ?? null,
      optionValue: bp.optionValue ?? null,
      quantity: bp.quantity ?? null,
      discountPercentage: bp.discountPercentage ?? null,
      totalExVatPence: bp.totalExVatPence ?? null,
      paymentMethod: bp.paymentMethod ?? null,
      contactMethod: bp.contactMethod ?? null,
      searchQuery: null,
      path: resolvedPath,
      createdAt: daysAgo(now, bp.daysAgo, bp.hourUtc, (index * 7) % 60),
    };
  });
}

export const SEED_USERS: UserRecord[] = buildSeedUsers();
export const SEED_ORDERS: OrderRecord[] = buildSeedOrders();
export const SEED_ANALYTICS_EVENTS: AnalyticsEventRecord[] = buildSeedAnalyticsEvents();
