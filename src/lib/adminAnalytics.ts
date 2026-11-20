import type {
  Ga4DeviceMetric,
  Ga4PageMetric,
  Ga4ParsedMetrics,
  Ga4ProductMetric,
  Ga4RegionMetric,
} from './ga4Analytics';

export type AnalyticsRange = '7d' | '30d' | '90d' | 'all';

export interface AnalyticsChannelBreakdown {
  channel: string;
  sessions: number;
  visitors: number;
  sharePct: number;
}

export type AnalyticsTopPage = Ga4PageMetric;
export type AnalyticsTopRegion = Ga4RegionMetric;
export type AnalyticsDeviceBreakdown = Ga4DeviceMetric;

export interface AnalyticsDataSources {
  stripe: {
    status: 'live' | 'test' | 'unconfigured' | 'error';
    usingFallback: boolean;
    message?: string;
  };
  googleAnalytics: {
    status: 'live' | 'unconfigured' | 'error';
    usingFallback: boolean;
    measurementIdConfigured: boolean;
    propertyIdMasked?: string;
    message?: string;
  };
}

export interface AdminAnalyticsKpis {
  revenueExVatPence: number;
  revenueChangePct: number | null;
  totalOrders: number;
  cardOrders: number;
  proformaOrders: number;
  ordersChangePct: number | null;
  quotePipelineExVatPence: number;
  quoteCount: number;
  totalCustomers: number;
  newCustomers: number;
  siteVisitors: number;
  visitorsChangePct: number | null;
  siteSessions: number;
  pageViews: number;
  newVisitors?: number;
  engagementRatePct?: number | null;
  avgSessionDurationSec?: number | null;
  tradeContactClicks: number;
}

export interface AnalyticsTrendPoint {
  isoDate: string;
  dateLabel: string;
  revenueExVatPence: number;
  ordersCount: number;
  visitors?: number;
  pageViews?: number;
}

export interface AnalyticsTopProduct {
  sku: string;
  title: string;
  views: number;
  quotes: number;
  ordersUnits: number;
  revenueExVatPence: number;
  popularConfig: string;
}

export interface AnalyticsFunnelStep {
  step: number;
  label: string;
  count: number;
  conversionPct: number;
}

export interface AdminRecentOrder {
  id: number;
  orderReference: string;
  customerEmail: string;
  companyName: string | null;
  paymentMode: string;
  status: string;
  totalUnits: number;
  totalExVatPence: number;
  totalIncVatPence: number;
  postcode: string;
  purchaseOrderNumber: string | null;
  createdAt: string;
  hostedInvoiceUrl?: string | null;
  source?: 'stripe' | 'local';
}

export interface AdminAnalyticsSummary {
  range: AnalyticsRange;
  generatedAt: string;
  kpis: AdminAnalyticsKpis;
  trendSeries: AnalyticsTrendPoint[];
  topProducts: AnalyticsTopProduct[];
  funnel: AnalyticsFunnelStep[];
  recentOrders: AdminRecentOrder[];
  sources?: AnalyticsDataSources;
  topChannels?: AnalyticsChannelBreakdown[];
  topPages?: AnalyticsTopPage[];
  topRegions?: AnalyticsTopRegion[];
  deviceBreakdown?: AnalyticsDeviceBreakdown[];
}

export interface BuildAdminAnalyticsSummaryInput {
  orders: any[];
  events: any[];
  ga4Metrics?: Ga4ParsedMetrics | null;
  sources?: AnalyticsDataSources;
  totalCustomers: number;
  newCustomersInPeriod: number;
  range: AnalyticsRange;
  now?: Date;
}

const MS_PER_DAY = 86_400_000;
const COMPLETED_ORDER_STATUSES = new Set([
  'paid',
  'invoiced',
  'dispatched',
  'delivered',
  'completed',
]);
const CSV_FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

const FINISH_LABELS: Record<string, string> = {
  'standard-blue': 'RAL 5010 Blue',
  'raw-steel': 'Raw Mill Steel',
  'custom-ral': 'Custom RAL',
  galvanised: 'Hot-Dip Galvanised',
};

const MOBILITY_LABELS: Record<string, string> = {
  'standard-feet': 'Standard Stacking Feet',
  'forklift-pockets': 'Forklift Pockets',
  'heavy-duty-castors': 'Heavy-Duty Castors',
  'both-castors-pockets': 'Castors + Forklift Pockets',
};

export function parseAnalyticsRange(value?: string | null): AnalyticsRange {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === '7d' || normalized === '30d' || normalized === '90d' || normalized === 'all') {
    return normalized;
  }
  return '30d';
}

function getRangeDays(range: AnalyticsRange): number | undefined {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return undefined;
  }
}

export function getRangeStartDate(range: AnalyticsRange, now: Date = new Date()): Date | undefined {
  const days = getRangeDays(range);
  if (!days) {
    return undefined;
  }
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0)
  );
}

function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function filterRecordsInRange<T extends { createdAt?: unknown }>(
  records: T[],
  range: AnalyticsRange,
  now: Date = new Date()
): T[] {
  const start = getRangeStartDate(range, now);
  if (!start) {
    return [...records];
  }
  const startMs = start.getTime();
  return records.filter((record) => {
    const date = toValidDate(record?.createdAt);
    return date !== null && date.getTime() >= startMs;
  });
}

function toUtcIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatShortUkDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function getUtcWeekMonday(date: Date): Date {
  const utcMidnight = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
  const day = utcMidnight.getUTCDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() + offsetToMonday);
  return utcMidnight;
}

function isCancelledOrder(order: any): boolean {
  return String(order?.status ?? '').trim().toLowerCase() === 'cancelled';
}

function isProformaPaymentMode(paymentMode: unknown): boolean {
  const mode = String(paymentMode ?? '').trim().toLowerCase();
  return mode === 'b2b_proforma' || mode === 'proforma' || mode === 'proforma_invoice';
}

function isCardPaymentMode(paymentMode: unknown): boolean {
  const mode = String(paymentMode ?? '').trim().toLowerCase();
  return mode === 'card' || mode === 'stripe_card';
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getOrderExVatPence(order: any): number {
  if (typeof order?.subtotalExVatPence === 'number' && Number.isFinite(order.subtotalExVatPence)) {
    return order.subtotalExVatPence + toFiniteNumber(order.deliveryExVatPence, 0);
  }
  if (typeof order?.totalIncVatPence === 'number' && Number.isFinite(order.totalIncVatPence)) {
    return order.totalIncVatPence - toFiniteNumber(order.vatPence, 0);
  }
  return 0;
}

function calculateChangePct(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function getEventName(event: any): string {
  return String(event?.eventName ?? event?.event ?? '').trim();
}

function parseOrderItems(order: any): any[] {
  const raw = order?.itemsJson;
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatFinishLabel(rawValue: string): string {
  const key = rawValue.trim();
  return FINISH_LABELS[key] || key;
}

function formatMobilityLabel(rawValue: string): string {
  const key = rawValue.trim();
  return MOBILITY_LABELS[key] || key;
}

function buildTrendSeries(
  activeOrders: any[],
  range: AnalyticsRange,
  startDate: Date | undefined,
  now: Date,
  dailyTraffic?: Ga4ParsedMetrics['dailyTraffic']
): AnalyticsTrendPoint[] {
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const hasTrafficData = Boolean(dailyTraffic);

  if (range === '7d' || range === '30d') {
    const start = startDate ?? todayUtc;
    const buckets = new Map<string, AnalyticsTrendPoint>();
    const cursor = new Date(start.getTime());

    while (cursor.getTime() <= todayUtc.getTime()) {
      const isoDate = toUtcIsoDate(cursor);
      const traffic = dailyTraffic?.[isoDate];
      buckets.set(isoDate, {
        isoDate,
        dateLabel: formatShortUkDate(cursor),
        revenueExVatPence: 0,
        ordersCount: 0,
        ...(hasTrafficData
          ? {
              visitors: traffic?.visitors ?? 0,
              pageViews: traffic?.pageViews ?? 0,
            }
          : {}),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    for (const order of activeOrders) {
      const createdAt = toValidDate(order?.createdAt);
      if (!createdAt) continue;
      const key = toUtcIsoDate(createdAt);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenueExVatPence += getOrderExVatPence(order);
        bucket.ordersCount += 1;
      }
    }

    return Array.from(buckets.values());
  }

  // Weekly buckets for '90d' and 'all'
  const endMonday = getUtcWeekMonday(todayUtc);
  let earliestDate = startDate ?? todayUtc;

  if (!startDate) {
    let minOrderTime = Number.POSITIVE_INFINITY;
    for (const order of activeOrders) {
      const createdAt = toValidDate(order?.createdAt);
      if (createdAt && createdAt.getTime() < minOrderTime) {
        minOrderTime = createdAt.getTime();
      }
    }
    if (dailyTraffic) {
      for (const isoDate of Object.keys(dailyTraffic)) {
        const parsed = toValidDate(isoDate);
        if (parsed && parsed.getTime() < minOrderTime) {
          minOrderTime = parsed.getTime();
        }
      }
    }
    if (Number.isFinite(minOrderTime)) {
      earliestDate = new Date(minOrderTime);
    }
  }

  const startMonday = getUtcWeekMonday(earliestDate);
  const buckets = new Map<string, AnalyticsTrendPoint>();
  const cursor = new Date(startMonday.getTime());

  while (cursor.getTime() <= endMonday.getTime()) {
    const isoDate = toUtcIsoDate(cursor);
    buckets.set(isoDate, {
      isoDate,
      dateLabel: `w/c ${formatShortUkDate(cursor)}`,
      revenueExVatPence: 0,
      ordersCount: 0,
      ...(hasTrafficData ? { visitors: 0, pageViews: 0 } : {}),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  for (const order of activeOrders) {
    const createdAt = toValidDate(order?.createdAt);
    if (!createdAt) continue;
    const monday = getUtcWeekMonday(createdAt);
    const key = toUtcIsoDate(monday);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        isoDate: key,
        dateLabel: `w/c ${formatShortUkDate(monday)}`,
        revenueExVatPence: 0,
        ordersCount: 0,
        ...(hasTrafficData ? { visitors: 0, pageViews: 0 } : {}),
      };
      buckets.set(key, bucket);
    }
    bucket.revenueExVatPence += getOrderExVatPence(order);
    bucket.ordersCount += 1;
  }

  if (dailyTraffic) {
    const startMs = startDate?.getTime();
    for (const [isoDate, entry] of Object.entries(dailyTraffic)) {
      const parsed = toValidDate(isoDate);
      if (!parsed) continue;
      if (startMs !== undefined && parsed.getTime() < startMs) continue;
      const monday = getUtcWeekMonday(parsed);
      const key = toUtcIsoDate(monday);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          isoDate: key,
          dateLabel: `w/c ${formatShortUkDate(monday)}`,
          revenueExVatPence: 0,
          ordersCount: 0,
          visitors: 0,
          pageViews: 0,
        };
        buckets.set(key, bucket);
      }
      bucket.visitors = (bucket.visitors ?? 0) + Math.max(0, toFiniteNumber(entry?.visitors, 0));
      bucket.pageViews = (bucket.pageViews ?? 0) + Math.max(0, toFiniteNumber(entry?.pageViews, 0));
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

function incrementCount(map: Map<string, number>, key: string, amount = 1): void {
  const cleaned = key.trim();
  if (!cleaned) return;
  map.set(cleaned, (map.get(cleaned) ?? 0) + amount);
}

function getTopKey(map: Map<string, number>): string | null {
  let bestKey: string | null = null;
  let bestScore = -1;
  for (const [key, count] of map.entries()) {
    if (count > bestScore) {
      bestScore = count;
      bestKey = key;
    }
  }
  return bestKey;
}

function buildTopProducts(
  activeOrders: any[],
  periodEvents: any[],
  ga4ProductMetrics?: Ga4ProductMetric[]
): AnalyticsTopProduct[] {
  interface ProductAccumulator {
    sku: string;
    title: string;
    views: number;
    quotes: number;
    ordersUnits: number;
    revenueExVatPence: number;
    configInteractions: number;
    finishVotes: Map<string, number>;
    mobilityVotes: Map<string, number>;
  }

  const bySku = new Map<string, ProductAccumulator>();

  const getOrCreate = (sku: string, title?: string | null): ProductAccumulator => {
    const existing = bySku.get(sku);
    if (existing) {
      if (title && existing.title === existing.sku) {
        existing.title = title;
      }
      return existing;
    }
    const created: ProductAccumulator = {
      sku,
      title: title || sku,
      views: 0,
      quotes: 0,
      ordersUnits: 0,
      revenueExVatPence: 0,
      configInteractions: 0,
      finishVotes: new Map(),
      mobilityVotes: new Map(),
    };
    bySku.set(sku, created);
    return created;
  };

  if (Array.isArray(ga4ProductMetrics)) {
    for (const metric of ga4ProductMetrics) {
      const sku = typeof metric?.sku === 'string' ? metric.sku.trim() : '';
      if (!sku) continue;
      const acc = getOrCreate(sku, metric.title);
      acc.views += Math.max(0, Math.round(toFiniteNumber(metric.views, 0)));
      acc.quotes += Math.max(0, Math.round(toFiniteNumber(metric.quotes, 0)));
      acc.configInteractions += Math.max(
        0,
        Math.round(toFiniteNumber(metric.configInteractions, 0))
      );
    }
  }

  for (const event of periodEvents) {
    const sku = typeof event?.sku === 'string' ? event.sku.trim() : '';
    if (!sku) continue;

    const title =
      typeof event?.productTitle === 'string' && event.productTitle.trim()
        ? event.productTitle.trim()
        : null;
    const acc = getOrCreate(sku, title);
    const eventName = getEventName(event);

    if (eventName === 'page_view') {
      acc.views += 1;
    } else if (eventName === 'quote_or_proforma_submitted') {
      acc.quotes += 1;
    } else if (eventName === 'configurator_option_select') {
      acc.configInteractions += 1;
      const optionType = String(event?.optionType ?? '').trim();
      const optionValue = String(event?.optionValue ?? '').trim();
      if (optionType === 'finish' && optionValue) {
        incrementCount(acc.finishVotes, formatFinishLabel(optionValue));
      } else if (optionType === 'mobility' && optionValue) {
        incrementCount(acc.mobilityVotes, formatMobilityLabel(optionValue));
      }
    } else if (eventName === 'bulk_tier_unlocked') {
      acc.configInteractions += 1;
    }
  }

  for (const order of activeOrders) {
    for (const item of parseOrderItems(order)) {
      const sku = typeof item?.sku === 'string' ? item.sku.trim() : '';
      if (!sku) continue;

      const title =
        typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : null;
      const acc = getOrCreate(sku, title);
      const quantity = Math.max(1, Math.round(toFiniteNumber(item?.quantity, 1)));
      const lineRevenue =
        typeof item?.lineSubtotalExVatPence === 'number' &&
        Number.isFinite(item.lineSubtotalExVatPence)
          ? item.lineSubtotalExVatPence
          : toFiniteNumber(item?.discountedUnitExVatPence, 0) * quantity;

      acc.ordersUnits += quantity;
      acc.revenueExVatPence += lineRevenue;

      const finishRaw =
        typeof item?.finishOption === 'string' && item.finishOption.trim()
          ? formatFinishLabel(item.finishOption)
          : typeof item?.finishName === 'string'
            ? item.finishName.trim()
            : '';
      if (finishRaw) {
        incrementCount(acc.finishVotes, finishRaw, quantity);
      }

      const mobilityRaw =
        typeof item?.mobilityOption === 'string' && item.mobilityOption.trim()
          ? formatMobilityLabel(item.mobilityOption)
          : typeof item?.mobilityName === 'string'
            ? item.mobilityName.trim()
            : '';
      if (mobilityRaw) {
        incrementCount(acc.mobilityVotes, mobilityRaw, quantity);
      }
    }
  }

  return Array.from(bySku.values())
    .sort((a, b) => {
      const scoreA = a.ordersUnits + a.quotes + a.views;
      const scoreB = b.ordersUnits + b.quotes + b.views;
      if (scoreB !== scoreA) return scoreB - scoreA;
      if (b.configInteractions !== a.configInteractions) {
        return b.configInteractions - a.configInteractions;
      }
      if (b.revenueExVatPence !== a.revenueExVatPence) {
        return b.revenueExVatPence - a.revenueExVatPence;
      }
      return a.sku.localeCompare(b.sku);
    })
    .slice(0, 5)
    .map((acc) => {
      const topFinish = getTopKey(acc.finishVotes);
      const topMobility = getTopKey(acc.mobilityVotes);
      const configParts = [topFinish, topMobility].filter(Boolean);
      return {
        sku: acc.sku,
        title: acc.title,
        views: acc.views,
        quotes: acc.quotes,
        ordersUnits: acc.ordersUnits,
        revenueExVatPence: acc.revenueExVatPence,
        popularConfig: configParts.length > 0 ? configParts.join(' • ') : 'Standard configuration',
      };
    });
}

function buildFunnel(
  periodOrders: any[],
  periodEvents: any[],
  ga4Metrics?: Ga4ParsedMetrics | null
): AnalyticsFunnelStep[] {
  let productViews = 0;
  let configuratorUsed = 0;
  let quotesSubmitted = 0;

  if (ga4Metrics) {
    productViews = Math.max(0, Math.round(toFiniteNumber(ga4Metrics.productPageViews, 0)));
    configuratorUsed = Math.max(0, Math.round(toFiniteNumber(ga4Metrics.configuratorEvents, 0)));
    quotesSubmitted = Math.max(0, Math.round(toFiniteNumber(ga4Metrics.quoteSubmittedEvents, 0)));
  } else {
    for (const event of periodEvents) {
      const eventName = getEventName(event);
      if (eventName === 'page_view') {
        productViews += 1;
      } else if (
        eventName === 'configurator_option_select' ||
        eventName === 'bulk_tier_unlocked'
      ) {
        configuratorUsed += 1;
      } else if (eventName === 'quote_or_proforma_submitted') {
        quotesSubmitted += 1;
      }
    }
  }

  let completedOrders = 0;
  for (const order of periodOrders) {
    const status = String(order?.status ?? '').trim().toLowerCase();
    if (COMPLETED_ORDER_STATUSES.has(status)) {
      completedOrders += 1;
    }
  }

  const calcPct = (count: number): number => {
    if (productViews <= 0) return 0;
    return Math.min(100, Math.round((count / productViews) * 1000) / 10);
  };

  return [
    {
      step: 1,
      label: 'Product Views',
      count: productViews,
      conversionPct: productViews > 0 ? 100 : 0,
    },
    {
      step: 2,
      label: 'Configurator Used',
      count: configuratorUsed,
      conversionPct: calcPct(configuratorUsed),
    },
    {
      step: 3,
      label: 'Quote / Basket Added',
      count: quotesSubmitted,
      conversionPct: calcPct(quotesSubmitted),
    },
    {
      step: 4,
      label: 'Paid / Invoiced Order',
      count: completedOrders,
      conversionPct: calcPct(completedOrders),
    },
  ];
}

function buildRecentOrders(periodOrders: any[]): AdminRecentOrder[] {
  return [...periodOrders]
    .sort((a, b) => {
      const timeA = toValidDate(a?.createdAt)?.getTime() ?? 0;
      const timeB = toValidDate(b?.createdAt)?.getTime() ?? 0;
      if (timeB !== timeA) return timeB - timeA;
      return toFiniteNumber(b?.id, 0) - toFiniteNumber(a?.id, 0);
    })
    .slice(0, 10)
    .map((order) => ({
      id: toFiniteNumber(order?.id, 0),
      orderReference: String(order?.orderReference ?? ''),
      customerEmail: String(order?.customerEmail ?? ''),
      companyName:
        typeof order?.companyName === 'string' && order.companyName.trim()
          ? order.companyName
          : null,
      paymentMode: String(order?.paymentMode ?? ''),
      status: String(order?.status ?? 'pending'),
      totalUnits: Math.max(0, Math.round(toFiniteNumber(order?.totalUnits, 0))),
      totalExVatPence: getOrderExVatPence(order),
      totalIncVatPence: toFiniteNumber(order?.totalIncVatPence, 0),
      postcode: String(order?.postcode ?? ''),
      purchaseOrderNumber:
        typeof order?.purchaseOrderNumber === 'string' && order.purchaseOrderNumber.trim()
          ? order.purchaseOrderNumber
          : null,
      createdAt: (toValidDate(order?.createdAt) ?? new Date(0)).toISOString(),
      ...(typeof order?.hostedInvoiceUrl === 'string' && order.hostedInvoiceUrl.trim()
        ? { hostedInvoiceUrl: order.hostedInvoiceUrl.trim() }
        : {}),
      ...(order?.source === 'stripe' ? { source: 'stripe' as const } : { source: 'local' as const }),
    }));
}

export function buildAdminAnalyticsSummary(
  input: BuildAdminAnalyticsSummaryInput
): AdminAnalyticsSummary {
  const now = input.now ?? new Date();
  const range = parseAnalyticsRange(input.range);
  const startDate = getRangeStartDate(range, now);
  const rangeDays = getRangeDays(range);
  const ga4Metrics = input.ga4Metrics ?? null;

  const allOrders = Array.isArray(input.orders) ? input.orders : [];
  const allEvents = Array.isArray(input.events) ? input.events : [];

  const periodOrders = filterRecordsInRange(allOrders, range, now);
  const periodEvents = filterRecordsInRange(allEvents, range, now);

  const activePeriodOrders = periodOrders.filter((order) => !isCancelledOrder(order));

  let revenueExVatPence = 0;
  let cardOrders = 0;
  let proformaOrders = 0;
  let proformaOrdersRevenueExVatPence = 0;

  for (const order of activePeriodOrders) {
    const orderExVat = getOrderExVatPence(order);
    revenueExVatPence += orderExVat;

    if (isProformaPaymentMode(order?.paymentMode)) {
      proformaOrders += 1;
      proformaOrdersRevenueExVatPence += orderExVat;
    } else if (isCardPaymentMode(order?.paymentMode)) {
      cardOrders += 1;
    }
  }

  let quoteEventsExVatPence = 0;
  let quoteEventsCount = 0;
  let localPageViews = 0;
  let localTradeContacts = 0;
  const localSessions = new Set<string>();

  if (!ga4Metrics) {
    for (const event of periodEvents) {
      const eventName = getEventName(event);
      if (eventName === 'quote_or_proforma_submitted') {
        quoteEventsCount += 1;
        quoteEventsExVatPence += Math.max(0, toFiniteNumber(event?.totalExVatPence, 0));
      } else if (eventName === 'page_view') {
        localPageViews += 1;
      } else if (eventName === 'trade_contact_click') {
        localTradeContacts += 1;
      }

      if (typeof event?.sessionId === 'string' && event.sessionId.trim()) {
        localSessions.add(event.sessionId.trim());
      }
    }
  }

  let revenueChangePct: number | null = null;
  let ordersChangePct: number | null = null;

  if (startDate && rangeDays) {
    const prevStartMs = startDate.getTime() - rangeDays * MS_PER_DAY;
    const prevEndMs = startDate.getTime();
    let prevRevenue = 0;
    let prevOrdersCount = 0;

    for (const order of allOrders) {
      if (isCancelledOrder(order)) continue;
      const createdAt = toValidDate(order?.createdAt);
      if (!createdAt) continue;
      const time = createdAt.getTime();
      if (time >= prevStartMs && time < prevEndMs) {
        prevRevenue += getOrderExVatPence(order);
        prevOrdersCount += 1;
      }
    }

    revenueChangePct = calculateChangePct(revenueExVatPence, prevRevenue);
    ordersChangePct = calculateChangePct(activePeriodOrders.length, prevOrdersCount);
  }

  const effectiveQuoteExVat = ga4Metrics
    ? ga4Metrics.quoteEventValueExVatPence
    : quoteEventsExVatPence;
  const effectiveQuoteCount = ga4Metrics ? ga4Metrics.quoteSubmittedEvents : quoteEventsCount;

  const siteVisitors = ga4Metrics
    ? ga4Metrics.siteVisitors
    : localSessions.size > 0
      ? localSessions.size
      : localPageViews;
  const siteSessions = ga4Metrics
    ? ga4Metrics.siteSessions
    : localSessions.size > 0
      ? localSessions.size
      : localPageViews;
  const pageViews = ga4Metrics ? ga4Metrics.pageViews : localPageViews;
  const visitorsChangePct =
    ga4Metrics && range !== 'all' ? ga4Metrics.visitorsChangePct : null;
  const tradeContactClicks = ga4Metrics
    ? ga4Metrics.tradeContactClicks
    : localTradeContacts;

  return {
    range,
    generatedAt: now.toISOString(),
    kpis: {
      revenueExVatPence,
      revenueChangePct,
      totalOrders: activePeriodOrders.length,
      cardOrders,
      proformaOrders,
      ordersChangePct,
      quotePipelineExVatPence: effectiveQuoteExVat + proformaOrdersRevenueExVatPence,
      quoteCount: effectiveQuoteCount + proformaOrders,
      totalCustomers: Math.max(0, Math.round(toFiniteNumber(input.totalCustomers, 0))),
      newCustomers: Math.max(0, Math.round(toFiniteNumber(input.newCustomersInPeriod, 0))),
      siteVisitors,
      visitorsChangePct,
      siteSessions,
      pageViews,
      ...(ga4Metrics ? { newVisitors: ga4Metrics.newVisitors } : {}),
      ...(ga4Metrics?.engagementRatePct !== undefined
        ? { engagementRatePct: ga4Metrics.engagementRatePct }
        : {}),
      ...(ga4Metrics?.avgSessionDurationSec !== undefined
        ? { avgSessionDurationSec: ga4Metrics.avgSessionDurationSec }
        : {}),
      tradeContactClicks,
    },
    trendSeries: buildTrendSeries(
      activePeriodOrders,
      range,
      startDate,
      now,
      ga4Metrics?.dailyTraffic
    ),
    topProducts: buildTopProducts(
      activePeriodOrders,
      periodEvents,
      ga4Metrics?.productMetrics
    ),
    funnel: buildFunnel(periodOrders, periodEvents, ga4Metrics),
    recentOrders: buildRecentOrders(periodOrders),
    ...(input.sources ? { sources: input.sources } : {}),
    ...(ga4Metrics?.topChannels ? { topChannels: ga4Metrics.topChannels } : {}),
    ...(ga4Metrics?.topPages ? { topPages: ga4Metrics.topPages } : {}),
    ...(ga4Metrics?.topRegions ? { topRegions: ga4Metrics.topRegions } : {}),
    ...(ga4Metrics?.deviceBreakdown ? { deviceBreakdown: ga4Metrics.deviceBreakdown } : {}),
  };
}

function escapeCsvCell(rawValue: unknown): string {
  let text = rawValue === null || rawValue === undefined ? '' : String(rawValue);
  if (CSV_FORMULA_PREFIX_RE.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function serializeOrdersToCsv(orders: any[]): string {
  const headers = [
    'Order Reference',
    'Date',
    'Company',
    'Customer Email',
    'Payment Mode',
    'Status',
    'Units',
    'Total Ex VAT (GBP)',
    'VAT (GBP)',
    'Total Inc VAT (GBP)',
    'Postcode',
    'PO Number',
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(',')];

  for (const order of orders) {
    const createdAt = toValidDate(order?.createdAt);
    const dateStr = createdAt ? toUtcIsoDate(createdAt) : '';
    const exVatPence = getOrderExVatPence(order);
    const vatPence = toFiniteNumber(order?.vatPence, 0);
    const incVatPence = toFiniteNumber(order?.totalIncVatPence, exVatPence + vatPence);

    const cells = [
      order?.orderReference ?? '',
      dateStr,
      order?.companyName ?? '',
      order?.customerEmail ?? '',
      order?.paymentMode ?? '',
      order?.status ?? '',
      Math.max(0, Math.round(toFiniteNumber(order?.totalUnits, 0))),
      (exVatPence / 100).toFixed(2),
      (vatPence / 100).toFixed(2),
      (incVatPence / 100).toFixed(2),
      order?.postcode ?? '',
      order?.purchaseOrderNumber ?? '',
    ];

    rows.push(cells.map(escapeCsvCell).join(','));
  }

  return rows.join('\r\n');
}
