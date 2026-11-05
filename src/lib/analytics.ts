export type B2BAnalyticsEventName =
  | 'configurator_option_select'
  | 'bulk_tier_unlocked'
  | 'quote_or_proforma_submitted'
  | 'trade_contact_click'
  | 'ai_spec_advisor_query';

export interface B2BAnalyticsEventPayload {
  event: B2BAnalyticsEventName;
  sku?: string;
  productTitle?: string;
  optionType?: 'finish' | 'mobility' | 'quantity' | 'tail_lift';
  optionValue?: string | number;
  quantity?: number;
  discountPercentage?: number;
  totalExVatPence?: number;
  contactMethod?: 'phone' | 'email';
  paymentMethod?: 'proforma_invoice' | 'stripe_card' | 'basket_add';
  searchQuery?: string;
  timestamp?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean | undefined> }
    ) => void;
  }
}

const LOCAL_EVENT_STORAGE_KEY = 'sss_b2b_analytics_events';

/**
 * Tracks a high-value B2B commercial action across:
 * 1. Google Analytics 4 (feeding the client's 1-page Looker Studio Monthly PDF Email)
 * 2. Plausible Analytics (optional cookie-less 1-page live dashboard)
 * 3. Local session log (powering the interactive Client Executive Dashboard preview at /analytics-report)
 */
export function trackB2BEvent(payload: B2BAnalyticsEventPayload): B2BAnalyticsEventPayload {
  const enriched: B2BAnalyticsEventPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  if (typeof window === 'undefined') {
    return enriched;
  }

  // 1. Send to Google Analytics 4 (GA4) if configured
  if (typeof window.gtag === 'function') {
    window.gtag('event', enriched.event, {
      item_id: enriched.sku,
      item_name: enriched.productTitle,
      option_type: enriched.optionType,
      option_value: enriched.optionValue,
      quantity: enriched.quantity,
      discount_percentage: enriched.discountPercentage,
      value:
        typeof enriched.totalExVatPence === 'number'
          ? Number((enriched.totalExVatPence / 100).toFixed(2))
          : undefined,
      currency: 'GBP',
      contact_method: enriched.contactMethod,
      payment_method: enriched.paymentMethod,
    });
  }

  // 2. Send to Plausible Analytics (cookie-less lightweight dashboard) if configured
  if (typeof window.plausible === 'function') {
    window.plausible(enriched.event, {
      props: {
        sku: enriched.sku,
        optionType: enriched.optionType,
        optionValue: enriched.optionValue,
        quantity: enriched.quantity,
        paymentMethod: enriched.paymentMethod,
        contactMethod: enriched.contactMethod,
      },
    });
  }

  // 3. Persist recent events in localStorage for the Client Executive Dashboard preview
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    const existing: B2BAnalyticsEventPayload[] = raw ? JSON.parse(raw) : [];
    const updated = [enriched, ...existing].slice(0, 25);
    window.localStorage.setItem(LOCAL_EVENT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sss-analytics-event', { detail: enriched }));
  } catch {
    // Ignore storage errors in private browsing
  }

  return enriched;
}

export function getRecentB2BEvents(): B2BAnalyticsEventPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sample executive scorecard dataset & Looker Studio specification for the non-technical client.
 */
export const EXECUTIVE_MONTHLY_REPORT_SAMPLE = {
  periodLabel: 'October 2026 — Monthly Executive Summary',
  scheduledDelivery: 'Automatically emailed as a 1-page PDF on the 1st of every month at 08:00 GMT',
  kpis: [
    {
      label: 'Total UK Trade Visitors',
      value: '4,820',
      change: '+18.4% vs last month',
      explanation: 'Unique warehouse, construction, and manufacturing buyers visiting the site.',
    },
    {
      label: 'Proforma Invoices & Orders',
      value: '64',
      change: '+22.0% vs last month',
      explanation: 'Completed online Stripe checkouts and official UK 20% VAT Proforma requests.',
    },
    {
      label: 'Trade Desk Phone & Email Clicks',
      value: '118',
      change: '+14.5% vs last month',
      explanation: 'Direct clicks on 01978 800 500 or sales@stillagestoragesolutions.co.uk.',
    },
    {
      label: 'Pipeline Value Configured',
      value: '£94,650',
      change: '+26.1% vs last month',
      explanation: 'Total Ex. VAT value of stillage fleets configured in the online calculator.',
    },
  ],
  topProducts: [
    {
      sku: 'SSS-SHT-1210',
      title: 'Heavy-Duty Solid Sheet Steel Bin Stillage (1200 x 1000mm)',
      views: 1420,
      quotes: 24,
      mostPopularConfig: 'RAL 5010 Blue • 8 Units (5% Bulk Tier)',
    },
    {
      sku: 'SSS-CANT-3B8A',
      title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
      views: 1185,
      quotes: 16,
      mostPopularConfig: 'Hot-Dip Galvanised • 4 Units',
    },
    {
      sku: 'SSS-MSH-1210HD',
      title: 'Mesh Sided Half-Drop Gate Stillage Cage (1200 x 1000 x 900mm)',
      views: 940,
      quotes: 12,
      mostPopularConfig: 'RAL 5010 Blue + Lockable Castors • 12 Units (10% Bulk Tier)',
    },
    {
      sku: 'SSS-HOP-4T1000',
      title: 'Modular 4-Tier Stackable Hopper & Bin Stillage System',
      views: 710,
      quotes: 7,
      mostPopularConfig: 'RAL 5010 Blue + Forklift Pockets • 4 Units',
    },
    {
      sku: 'SSS-PST-1111D',
      title: 'Heavy-Duty Post Pallet with Demountable Corner Posts',
      views: 565,
      quotes: 5,
      mostPopularConfig: 'Hot-Dip Galvanised • 20 Units (10% Bulk Tier)',
    },
  ],
  topSearchTerms: [
    { query: 'heavy duty steel stillages uk', clicks: 310, source: 'Google Organic' },
    { query: 'double sided cantilever bar rack', clicks: 245, source: 'Google Organic' },
    { query: '1000kg swl stackable bin stillage', clicks: 190, source: 'Google + AI Overviews' },
    { query: 'ukca certified post pallets demountable', clicks: 154, source: 'Perplexity / ChatGPT Search' },
    { query: 'hot dip galvanised mesh stillage cage', clicks: 128, source: 'Google Organic' },
  ],
  topUkRegions: [
    { region: 'West Midlands (Birmingham, Wolverhampton, Coventry)', sharePercent: 28 },
    { region: 'North West & North Wales (Manchester, Warrington, Wrexham)', sharePercent: 24 },
    { region: 'Yorkshire & Humber (Sheffield, Leeds, Doncaster)', sharePercent: 19 },
    { region: 'East Midlands & South East (Leicester, Milton Keynes, London)', sharePercent: 17 },
    { region: 'Scotland & North East (Glasgow, Newcastle)', sharePercent: 12 },
  ],
};
