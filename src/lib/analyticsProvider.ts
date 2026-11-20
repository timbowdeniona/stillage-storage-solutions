import { getProducts } from '@/lib/contentful';
import {
  buildAdminAnalyticsSummary,
  filterRecordsInRange,
  getRangeStartDate,
  type AdminAnalyticsSummary,
  type AnalyticsDataSources,
  type AnalyticsRange,
} from '@/lib/adminAnalytics';
import { fetchGa4AnalyticsData, type Ga4CatalogProductRef } from '@/lib/ga4Analytics';
import {
  getCustomerCounts,
  listAllOrders,
  listAnalyticsEvents,
} from '@/lib/repository';
import { fetchStripeAnalyticsData } from '@/lib/stripeAnalytics';

export interface AdminAnalyticsProviderResult {
  summary: AdminAnalyticsSummary;
  exportOrders: any[];
}

const CACHE_TTL_MS = 60_000;
const ERROR_CACHE_TTL_MS = 15_000;

const globalForAnalyticsCache = globalThis as unknown as {
  __sssAdminAnalyticsCache?: Map<
    AnalyticsRange,
    { expiresAtMs: number; result: AdminAnalyticsProviderResult }
  >;
};

function getCacheMap(): Map<
  AnalyticsRange,
  { expiresAtMs: number; result: AdminAnalyticsProviderResult }
> {
  if (!globalForAnalyticsCache.__sssAdminAnalyticsCache) {
    globalForAnalyticsCache.__sssAdminAnalyticsCache = new Map();
  }
  return globalForAnalyticsCache.__sssAdminAnalyticsCache;
}

async function safeGetCatalogProducts(): Promise<Ga4CatalogProductRef[]> {
  try {
    const products = await getProducts();
    return products.map((p) => ({
      slug: p.slug,
      sku: p.sku,
      title: p.title,
    }));
  } catch {
    return [];
  }
}

export async function getAdminAnalyticsData(
  range: AnalyticsRange,
  options: { bypassCache?: boolean; now?: Date } = {}
): Promise<AdminAnalyticsProviderResult> {
  const canUseCache = !options.bypassCache && !options.now;
  const cache = getCacheMap();

  if (canUseCache) {
    const cached = cache.get(range);
    if (cached && cached.expiresAtMs > Date.now()) {
      return cached.result;
    }
  }

  const now = options.now ?? new Date();
  const since = getRangeStartDate(range, now);

  const stripePromise = fetchStripeAnalyticsData(range, now);
  const ga4Promise = safeGetCatalogProducts().then((catalogProducts) =>
    fetchGa4AnalyticsData(range, catalogProducts, now)
  );

  const [stripeResult, ga4Result] = await Promise.all([stripePromise, ga4Promise]);

  const useStripe = stripeResult.status === 'live' || stripeResult.status === 'test';
  const useGa4 = ga4Result.status === 'live' && Boolean(ga4Result.metrics);

  const [fallbackOrders, fallbackCustomerCounts, fallbackEvents] = await Promise.all([
    useStripe ? Promise.resolve(null) : listAllOrders(),
    useStripe ? Promise.resolve(null) : getCustomerCounts(since),
    useGa4 ? Promise.resolve(null) : listAnalyticsEvents(),
  ]);

  const orders: any[] = useStripe ? stripeResult.orders : fallbackOrders ?? [];
  const totalCustomers = useStripe
    ? stripeResult.totalCustomers
    : fallbackCustomerCounts?.totalCustomers ?? 0;
  const newCustomersInPeriod = useStripe
    ? stripeResult.newCustomersInPeriod
    : fallbackCustomerCounts?.newCustomersInPeriod ?? 0;

  const events = useGa4 ? [] : fallbackEvents ?? [];
  const ga4Metrics = useGa4 ? ga4Result.metrics ?? null : null;

  const sources: AnalyticsDataSources = {
    stripe: {
      status: stripeResult.status,
      usingFallback: !useStripe,
      ...(stripeResult.errorMessage ? { message: stripeResult.errorMessage } : {}),
    },
    googleAnalytics: {
      status: ga4Result.status,
      usingFallback: !useGa4,
      measurementIdConfigured: ga4Result.measurementIdConfigured,
      ...(ga4Result.propertyIdMasked ? { propertyIdMasked: ga4Result.propertyIdMasked } : {}),
      ...(ga4Result.errorMessage ? { message: ga4Result.errorMessage } : {}),
    },
  };

  const summary = buildAdminAnalyticsSummary({
    orders,
    events,
    ga4Metrics,
    sources,
    totalCustomers,
    newCustomersInPeriod,
    range,
    now,
  });

  const exportOrders = filterRecordsInRange(orders, range, now);
  const result: AdminAnalyticsProviderResult = { summary, exportOrders };

  if (canUseCache) {
    const hasUpstreamError =
      stripeResult.status === 'error' || ga4Result.status === 'error';
    const ttl = hasUpstreamError ? ERROR_CACHE_TTL_MS : CACHE_TTL_MS;
    cache.set(range, {
      expiresAtMs: Date.now() + ttl,
      result,
    });
  }

  return result;
}
