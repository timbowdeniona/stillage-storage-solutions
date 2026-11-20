import crypto from 'node:crypto';

export interface Ga4CatalogProductRef {
  slug: string;
  sku: string;
  title: string;
}

export interface Ga4ProductMetric {
  sku: string;
  title: string;
  views: number;
  quotes: number;
  configInteractions: number;
}

export interface Ga4ChannelMetric {
  channel: string;
  sessions: number;
  visitors: number;
  sharePct: number;
}

export interface Ga4DailyTrafficEntry {
  visitors: number;
  pageViews: number;
}

export interface Ga4PageMetric {
  path: string;
  title: string;
  views: number;
  visitors: number;
  engagementRatePct: number;
}

export interface Ga4RegionMetric {
  label: string;
  region: string;
  country: string;
  visitors: number;
  sessions: number;
  sharePct: number;
}

export interface Ga4DeviceMetric {
  device: string;
  sessions: number;
  visitors: number;
  sharePct: number;
}

export interface Ga4InsightsMetrics {
  topPages: Ga4PageMetric[];
  topRegions: Ga4RegionMetric[];
  deviceBreakdown: Ga4DeviceMetric[];
}

export interface Ga4ParsedMetrics {
  siteVisitors: number;
  previousSiteVisitors: number | null;
  visitorsChangePct: number | null;
  siteSessions: number;
  pageViews: number;
  newVisitors: number;
  engagementRatePct?: number | null;
  avgSessionDurationSec?: number | null;
  productPageViews: number;
  configuratorEvents: number;
  quoteSubmittedEvents: number;
  quoteEventValueExVatPence: number;
  tradeContactClicks: number;
  dailyTraffic: Record<string, Ga4DailyTrafficEntry>;
  productMetrics: Ga4ProductMetric[];
  topChannels: Ga4ChannelMetric[];
  topPages?: Ga4PageMetric[];
  topRegions?: Ga4RegionMetric[];
  deviceBreakdown?: Ga4DeviceMetric[];
}

export interface Ga4AnalyticsFetchResult {
  status: 'live' | 'unconfigured' | 'error';
  measurementIdConfigured: boolean;
  propertyIdMasked?: string;
  metrics?: Ga4ParsedMetrics;
  errorMessage?: string;
}

export interface Ga4DateRangePair {
  current: { startDate: string; endDate: string };
  previous?: { startDate: string; endDate: string };
}

const GA4_ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta/properties';
const DEFAULT_ALL_TIME_START_DATE = '2020-01-01';

let cachedAccessToken: {
  cacheKey: string;
  token: string;
  expiresAtMs: number;
} | null = null;

function readRuntimeEnv(name: string): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return (process.env[name] || '').trim();
}

export function isGa4MeasurementIdConfigured(): boolean {
  const gaId = readRuntimeEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  const gtmId = readRuntimeEnv('NEXT_PUBLIC_GTM_ID');
  const hasGa = Boolean(gaId && gaId.toUpperCase() !== 'G-XXXXXXXXXX' && /^G-[A-Z0-9]+$/i.test(gaId));
  const hasGtm = Boolean(gtmId && gtmId.toUpperCase() !== 'GTM-XXXXXXXX' && /^GTM-[A-Z0-9]+$/i.test(gtmId));
  return hasGa || hasGtm;
}

export function normalizeGa4PropertyId(raw?: string | null): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/^properties\//i, '').trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function normalizeServiceAccountPrivateKey(raw?: string | null): string | null {
  if (typeof raw !== 'string') return null;
  let cleaned = raw.trim();
  if (!cleaned) return null;

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  cleaned = cleaned.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

  if (!cleaned.includes('-----BEGIN') || !cleaned.includes('PRIVATE KEY-----')) {
    return null;
  }

  // Reject unfilled template placeholder
  if (cleaned.includes('...\n')) {
    return null;
  }

  return cleaned.endsWith('\n') ? cleaned : `${cleaned}\n`;
}

export function maskPropertyId(propertyId: string): string {
  const cleaned = propertyId.trim();
  if (cleaned.length <= 4) {
    return `•••${cleaned}`;
  }
  return `•••${cleaned.slice(-4)}`;
}

export function createGoogleServiceAccountJwt(
  clientEmail: string,
  privateKeyPem: string,
  nowEpochSeconds: number = Math.floor(Date.now() / 1000)
): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' }), 'utf8').toString(
    'base64url'
  );
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: GA4_ANALYTICS_SCOPE,
      aud: GOOGLE_OAUTH_TOKEN_URL,
      iat: nowEpochSeconds,
      exp: nowEpochSeconds + 3600,
    }),
    'utf8'
  ).toString('base64url');

  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput, 'utf8');
  signer.end();
  const signature = signer.sign(privateKeyPem, 'base64url');

  return `${signingInput}.${signature}`;
}

function formatUtcIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDate(baseUtcMidnight: Date, deltaDays: number): Date {
  return new Date(
    Date.UTC(
      baseUtcMidnight.getUTCFullYear(),
      baseUtcMidnight.getUTCMonth(),
      baseUtcMidnight.getUTCDate() + deltaDays,
      0,
      0,
      0,
      0
    )
  );
}

export function getGa4DateRanges(range: string, now: Date = new Date()): Ga4DateRangePair {
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endDate = formatUtcIsoDate(todayUtc);

  let days: number | null = null;
  const normalizedRange = range.trim().toLowerCase();
  if (normalizedRange === '7d') days = 7;
  else if (normalizedRange === '30d') days = 30;
  else if (normalizedRange === '90d') days = 90;

  if (!days) {
    return {
      current: {
        startDate: DEFAULT_ALL_TIME_START_DATE,
        endDate,
      },
    };
  }

  const currentStart = shiftUtcDate(todayUtc, -(days - 1));
  const prevEnd = shiftUtcDate(currentStart, -1);
  const prevStart = shiftUtcDate(currentStart, -days);

  return {
    current: {
      startDate: formatUtcIsoDate(currentStart),
      endDate,
    },
    previous: {
      startDate: formatUtcIsoDate(prevStart),
      endDate: formatUtcIsoDate(prevEnd),
    },
  };
}

function toNumberMetric(row: any, index: number): number {
  const raw = row?.metricValues?.[index]?.value;
  if (typeof raw !== 'string' && typeof raw !== 'number') return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDimensionValue(row: any, index: number): string {
  const val = row?.dimensionValues?.[index]?.value;
  return typeof val === 'string' ? val.trim() : '';
}

function computeVisitorsChangePct(current: number, previous: number | null): number | null {
  if (previous === null) return null;
  if (previous <= 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function formatSlugFallbackTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function parseGa4BatchReportResponse(
  payload: any,
  catalogProducts: Ga4CatalogProductRef[] = [],
  range = '30d'
): Ga4ParsedMetrics {
  const reports = Array.isArray(payload?.reports) ? payload.reports : [];
  const overviewReport = reports[0] ?? {};
  const dailyReport = reports[1] ?? {};
  const eventsReport = reports[2] ?? {};
  const productPagesReport = reports[3] ?? {};
  const channelsReport = reports[4] ?? {};

  // Report 0: Overview (activeUsers, sessions, screenPageViews, newUsers, engagementRate?, averageSessionDuration?)
  let siteVisitors = 0;
  let siteSessions = 0;
  let pageViews = 0;
  let newVisitors = 0;
  let engagementRatePct: number | null = null;
  let avgSessionDurationSec: number | null = null;
  let previousSiteVisitors: number | null = range.trim().toLowerCase() === 'all' ? null : 0;

  const overviewDimHeaders: any[] = Array.isArray(overviewReport?.dimensionHeaders)
    ? overviewReport.dimensionHeaders
    : [];
  const dateRangeDimIdx = overviewDimHeaders.findIndex((h) => h?.name === 'dateRange');

  for (const row of Array.isArray(overviewReport?.rows) ? overviewReport.rows : []) {
    const dateRangeName =
      dateRangeDimIdx >= 0 ? getDimensionValue(row, dateRangeDimIdx) : 'date_range_0';

    if (dateRangeName === 'date_range_1') {
      previousSiteVisitors = Math.round(toNumberMetric(row, 0));
    } else {
      siteVisitors = Math.round(toNumberMetric(row, 0));
      siteSessions = Math.round(toNumberMetric(row, 1));
      pageViews = Math.round(toNumberMetric(row, 2));
      newVisitors = Math.round(toNumberMetric(row, 3));
      if (row?.metricValues?.[4]?.value !== undefined) {
        const rawEngagement = toNumberMetric(row, 4);
        engagementRatePct = Math.min(100, Math.max(0, Math.round(rawEngagement * 1000) / 10));
      }
      if (row?.metricValues?.[5]?.value !== undefined) {
        avgSessionDurationSec = Math.max(0, Math.round(toNumberMetric(row, 5)));
      }
    }
  }

  const visitorsChangePct = computeVisitorsChangePct(siteVisitors, previousSiteVisitors);

  // Report 1: Daily traffic by YYYYMMDD
  const dailyTraffic: Record<string, Ga4DailyTrafficEntry> = {};
  for (const row of Array.isArray(dailyReport?.rows) ? dailyReport.rows : []) {
    const rawDate = getDimensionValue(row, 0);
    const match = rawDate.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) continue;
    const isoDate = `${match[1]}-${match[2]}-${match[3]}`;
    dailyTraffic[isoDate] = {
      visitors: Math.round(toNumberMetric(row, 0)),
      pageViews: Math.round(toNumberMetric(row, 1)),
    };
  }

  // Report 2: Custom B2B funnel events
  let configuratorEvents = 0;
  let quoteSubmittedEvents = 0;
  let quoteEventValueExVatPence = 0;
  let tradeContactClicks = 0;

  for (const row of Array.isArray(eventsReport?.rows) ? eventsReport.rows : []) {
    const eventName = getDimensionValue(row, 0);
    const count = Math.round(toNumberMetric(row, 0));
    const eventValueGbp = toNumberMetric(row, 1);

    if (eventName === 'configurator_option_select' || eventName === 'bulk_tier_unlocked') {
      configuratorEvents += count;
    } else if (eventName === 'quote_or_proforma_submitted') {
      quoteSubmittedEvents += count;
      quoteEventValueExVatPence += Math.max(0, Math.round(eventValueGbp * 100));
    } else if (eventName === 'trade_contact_click') {
      tradeContactClicks += count;
    }
  }

  // Report 3: Product page engagement (/products/<slug> + eventName)
  const catalogBySlug = new Map<string, Ga4CatalogProductRef>();
  for (const product of catalogProducts) {
    if (product?.slug) {
      catalogBySlug.set(product.slug.trim().toLowerCase(), product);
    }
  }

  const productMap = new Map<string, Ga4ProductMetric>();
  let rawProductPageViews = 0;

  for (const row of Array.isArray(productPagesReport?.rows) ? productPagesReport.rows : []) {
    const rawPath = getDimensionValue(row, 0);
    const eventName = getDimensionValue(row, 1);
    const count = Math.round(toNumberMetric(row, 0));
    if (!rawPath || count <= 0) continue;

    const normalizedPath = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
    const slugMatch = normalizedPath.match(/^\/products\/([^/]+)$/);
    if (!slugMatch) continue;

    const slug = slugMatch[1];
    const catalogMatch = catalogBySlug.get(slug);
    const sku = catalogMatch?.sku || slug.toUpperCase();
    const title = catalogMatch?.title || formatSlugFallbackTitle(slug);

    let entry = productMap.get(sku);
    if (!entry) {
      entry = { sku, title, views: 0, quotes: 0, configInteractions: 0 };
      productMap.set(sku, entry);
    }

    if (eventName === 'page_view') {
      entry.views += count;
      rawProductPageViews += count;
    } else if (eventName === 'view_item') {
      entry.views += count;
    } else if (eventName === 'quote_or_proforma_submitted') {
      entry.quotes += count;
    } else if (
      eventName === 'configurator_option_select' ||
      eventName === 'bulk_tier_unlocked'
    ) {
      entry.configInteractions += count;
    }
  }

  const productPageViews = rawProductPageViews > 0 ? rawProductPageViews : pageViews;

  // Report 4: Top traffic channels
  const rawChannels: Array<{ channel: string; sessions: number; visitors: number }> = [];
  let totalChannelSessions = 0;

  for (const row of Array.isArray(channelsReport?.rows) ? channelsReport.rows : []) {
    const channel = getDimensionValue(row, 0) || 'Direct';
    const sessions = Math.max(0, Math.round(toNumberMetric(row, 0)));
    const visitors = Math.max(0, Math.round(toNumberMetric(row, 1)));
    totalChannelSessions += sessions;
    rawChannels.push({ channel, sessions, visitors });
  }

  const topChannels: Ga4ChannelMetric[] = rawChannels.map((c) => ({
    channel: c.channel,
    sessions: c.sessions,
    visitors: c.visitors,
    sharePct:
      totalChannelSessions > 0
        ? Math.round((c.sessions / totalChannelSessions) * 1000) / 10
        : 0,
  }));

  return {
    siteVisitors,
    previousSiteVisitors,
    visitorsChangePct,
    siteSessions,
    pageViews,
    newVisitors,
    engagementRatePct,
    avgSessionDurationSec,
    productPageViews,
    configuratorEvents,
    quoteSubmittedEvents,
    quoteEventValueExVatPence,
    tradeContactClicks,
    dailyTraffic,
    productMetrics: Array.from(productMap.values()),
    topChannels,
  };
}

function formatDeviceLabel(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'desktop') return 'Desktop';
  if (normalized === 'mobile') return 'Mobile';
  if (normalized === 'tablet') return 'Tablet';
  if (!normalized || normalized === '(not set)') return 'Other';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function parseGa4InsightsBatchResponse(payload: any): Ga4InsightsMetrics {
  const reports = Array.isArray(payload?.reports) ? payload.reports : [];
  const pagesReport = reports[0] ?? {};
  const regionsReport = reports[1] ?? {};
  const devicesReport = reports[2] ?? {};

  // Report 0: Top Pages (pagePath, pageTitle -> screenPageViews, activeUsers, engagementRate)
  const pageMap = new Map<string, Ga4PageMetric>();
  for (const row of Array.isArray(pagesReport?.rows) ? pagesReport.rows : []) {
    const rawPath = getDimensionValue(row, 0);
    if (!rawPath) continue;
    const normalizedPath = rawPath.split('?')[0].split('#')[0] || '/';
    if (normalizedPath.startsWith('/admin') || normalizedPath.startsWith('/api')) {
      continue;
    }
    const rawTitle = getDimensionValue(row, 1);
    const views = Math.max(0, Math.round(toNumberMetric(row, 0)));
    const visitors = Math.max(0, Math.round(toNumberMetric(row, 1)));
    const engagementRatePct = Math.min(
      100,
      Math.max(0, Math.round(toNumberMetric(row, 2) * 1000) / 10)
    );
    if (views <= 0 && visitors <= 0) continue;

    const existing = pageMap.get(normalizedPath);
    if (existing) {
      existing.views += views;
      existing.visitors = Math.max(existing.visitors, visitors);
    } else {
      const cleanTitle =
        rawTitle && rawTitle !== '(not set)'
          ? rawTitle.replace(/\s*\|\s*Stillage Storage Solutions.*$/i, '').trim()
          : normalizedPath === '/'
            ? 'Homepage'
            : normalizedPath;
      pageMap.set(normalizedPath, {
        path: normalizedPath,
        title: cleanTitle || normalizedPath,
        views,
        visitors,
        engagementRatePct,
      });
    }
  }

  const topPages = Array.from(pageMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Report 1: Top Regions / Cities (city, region, country -> activeUsers, sessions)
  const rawRegions: Array<{
    label: string;
    region: string;
    country: string;
    visitors: number;
    sessions: number;
  }> = [];
  let totalRegionVisitors = 0;

  for (const row of Array.isArray(regionsReport?.rows) ? regionsReport.rows : []) {
    const city = getDimensionValue(row, 0);
    const region = getDimensionValue(row, 1);
    const country = getDimensionValue(row, 2);
    const visitors = Math.max(0, Math.round(toNumberMetric(row, 0)));
    const sessions = Math.max(0, Math.round(toNumberMetric(row, 1)));
    if (visitors <= 0) continue;

    const validCity = city && city !== '(not set)' ? city : '';
    const validRegion = region && region !== '(not set)' ? region : '';
    const validCountry = country && country !== '(not set)' ? country : '';

    const parts = [validCity, validRegion].filter(Boolean);
    let label = parts.join(', ');
    if (!label) {
      label = validCountry || 'Unknown location';
    } else if (validCountry && validCountry !== 'United Kingdom') {
      label = `${label} (${validCountry})`;
    }

    totalRegionVisitors += visitors;
    rawRegions.push({
      label,
      region: validRegion || validCountry || 'Unknown',
      country: validCountry || 'Unknown',
      visitors,
      sessions,
    });
  }

  const topRegions: Ga4RegionMetric[] = rawRegions.slice(0, 6).map((r) => ({
    ...r,
    sharePct:
      totalRegionVisitors > 0
        ? Math.round((r.visitors / totalRegionVisitors) * 1000) / 10
        : 0,
  }));

  // Report 2: Device Category (deviceCategory -> sessions, activeUsers)
  const rawDevices: Array<{ device: string; sessions: number; visitors: number }> = [];
  let totalDeviceSessions = 0;

  for (const row of Array.isArray(devicesReport?.rows) ? devicesReport.rows : []) {
    const device = formatDeviceLabel(getDimensionValue(row, 0));
    const sessions = Math.max(0, Math.round(toNumberMetric(row, 0)));
    const visitors = Math.max(0, Math.round(toNumberMetric(row, 1)));
    if (sessions <= 0 && visitors <= 0) continue;
    totalDeviceSessions += sessions;
    rawDevices.push({ device, sessions, visitors });
  }

  const deviceBreakdown: Ga4DeviceMetric[] = rawDevices.map((d) => ({
    ...d,
    sharePct:
      totalDeviceSessions > 0
        ? Math.round((d.sessions / totalDeviceSessions) * 1000) / 10
        : 0,
  }));

  return {
    topPages,
    topRegions,
    deviceBreakdown,
  };
}

async function getGoogleOAuthAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  const nowMs = Date.now();
  const cacheKey = `${clientEmail}:${privateKeyPem.slice(0, 48)}`;

  if (
    cachedAccessToken &&
    cachedAccessToken.cacheKey === cacheKey &&
    cachedAccessToken.expiresAtMs - 60_000 > nowMs
  ) {
    return cachedAccessToken.token;
  }

  const assertion = createGoogleServiceAccountJwt(
    clientEmail,
    privateKeyPem,
    Math.floor(nowMs / 1000)
  );

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description || json.error || `Google OAuth token error (${response.status})`
    );
  }

  const expiresInSec = typeof json.expires_in === 'number' ? json.expires_in : 3600;
  cachedAccessToken = {
    cacheKey,
    token: json.access_token,
    expiresAtMs: nowMs + expiresInSec * 1000,
  };

  return json.access_token;
}

export async function fetchGa4AnalyticsData(
  range: string,
  catalogProducts: Ga4CatalogProductRef[] = [],
  now: Date = new Date()
): Promise<Ga4AnalyticsFetchResult> {
  const measurementIdConfigured = isGa4MeasurementIdConfigured();
  const propertyId = normalizeGa4PropertyId(readRuntimeEnv('GA4_PROPERTY_ID'));
  const clientEmail = readRuntimeEnv('GA4_CLIENT_EMAIL');
  const privateKeyPem = normalizeServiceAccountPrivateKey(readRuntimeEnv('GA4_PRIVATE_KEY'));

  if (
    !propertyId ||
    !clientEmail ||
    clientEmail.includes('your-gcp-project') ||
    !privateKeyPem
  ) {
    return {
      status: 'unconfigured',
      measurementIdConfigured,
      ...(propertyId ? { propertyIdMasked: maskPropertyId(propertyId) } : {}),
      errorMessage:
        'Add GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY to pull live Google Analytics 4 traffic.',
    };
  }

  const propertyIdMasked = maskPropertyId(propertyId);

  try {
    const accessToken = await getGoogleOAuthAccessToken(clientEmail, privateKeyPem);
    const { current, previous } = getGa4DateRanges(range, now);
    const overviewRanges = previous ? [current, previous] : [current];

    const batchRequestBody = {
      requests: [
        {
          dateRanges: overviewRanges,
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'newUsers' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
          ],
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
          limit: 120,
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'eventValue' }],
          limit: 50,
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'pagePath' }, { name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: {
              fieldName: 'pagePath',
              stringFilter: {
                matchType: 'BEGINS_WITH',
                value: '/products/',
              },
            },
          },
          limit: 100,
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        },
      ],
    };

    const insightsBatchBody = {
      requests: [
        {
          dateRanges: [current],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'engagementRate' },
          ],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'city' }, { name: 'region' }, { name: 'country' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 10,
        },
        {
          dateRanges: [current],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        },
      ],
    };

    const endpoint = `${GA4_DATA_API_BASE}/${propertyId}:batchRunReports`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const [apiResponse, insightsResponse] = await Promise.all([
      fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(batchRequestBody),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }),
      fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(insightsBatchBody),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
    ]);

    const json = (await apiResponse.json()) as { error?: { message?: string }; reports?: any[] };
    if (!apiResponse.ok) {
      throw new Error(json?.error?.message || `GA4 Data API error (${apiResponse.status})`);
    }

    const metrics = parseGa4BatchReportResponse(json, catalogProducts, range);

    if (insightsResponse && insightsResponse.ok) {
      try {
        const insightsJson = (await insightsResponse.json()) as { reports?: any[] };
        const insights = parseGa4InsightsBatchResponse(insightsJson);
        metrics.topPages = insights.topPages;
        metrics.topRegions = insights.topRegions;
        metrics.deviceBreakdown = insights.deviceBreakdown;
      } catch {
        // Non-critical secondary GA4 insights batch
      }
    }

    return {
      status: 'live',
      measurementIdConfigured,
      propertyIdMasked,
      metrics,
    };
  } catch (err) {
    return {
      status: 'error',
      measurementIdConfigured,
      propertyIdMasked,
      errorMessage: err instanceof Error ? err.message : 'Unable to reach Google Analytics 4 API.',
    };
  }
}
