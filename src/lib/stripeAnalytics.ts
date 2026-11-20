export type StripeAnalyticsSourceStatus = 'live' | 'test' | 'unconfigured' | 'error';

export interface StripeNormalizedOrderItem {
  sku: string;
  title: string;
  quantity: number;
  lineSubtotalExVatPence: number;
  finishName?: string;
  mobilityName?: string;
}

export interface NormalizedStripeOrder {
  id: number;
  orderReference: string;
  customerEmail: string;
  companyName: string | null;
  paymentMode: 'card' | 'b2b_proforma';
  status: 'paid' | 'invoiced';
  totalUnits: number;
  subtotalExVatPence: number;
  deliveryExVatPence: number;
  vatPence: number;
  totalIncVatPence: number;
  postcode: string;
  purchaseOrderNumber: string | null;
  createdAt: string;
  itemsJson: StripeNormalizedOrderItem[];
  stripeSessionId?: string | null;
  stripeInvoiceId?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  source: 'stripe';
}

export interface StripeAnalyticsFetchResult {
  status: StripeAnalyticsSourceStatus;
  livemode: boolean;
  orders: NormalizedStripeOrder[];
  totalCustomers: number;
  newCustomersInPeriod: number;
  errorMessage?: string;
}

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const MS_PER_DAY = 86_400_000;
const MAX_STRIPE_PAGES = 5;
const MAX_SESSION_LINE_ITEM_FETCHES = 25;
const LINE_ITEM_BATCH_SIZE = 5;

function readStripeSecretKey(): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key || key === 'sk_test_your_stripe_secret_key') {
    return undefined;
  }
  return key;
}

function getRangeDays(range: string): number | undefined {
  switch (range.trim().toLowerCase()) {
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

function getRangeStartMs(range: string, now: Date): number | undefined {
  const days = getRangeDays(range);
  if (!days) return undefined;
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0);
}

function parseOptionalInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeEmailValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function cleanTitleText(raw: string): string {
  return raw
    .replace(/\s+[—-]\s+.*$/, '')
    .replace(/\s+\(Ex\.?\s*VAT\)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function isStripeVatLine(description: string): boolean {
  const text = String(description || '').trim();
  if (!text) return false;
  const withoutExVat = text.replace(/\bex\.?\s*vat\b/gi, '').trim();
  return /\bvat\b|value added tax/i.test(withoutExVat);
}

export function isStripeFreightLine(description: string): boolean {
  const text = String(description || '').trim();
  if (!text) return false;
  return /uk hgv pallet|hgv pallet freight|pallet network freight|pallet freight/i.test(text);
}

export function extractSkuAndTitleFromStripeDescription(
  description: string
): { sku: string; title: string } | null {
  const raw = String(description || '').trim();
  if (!raw || isStripeVatLine(raw) || isStripeFreightLine(raw)) {
    return null;
  }

  // Match Checkout Session format: "Product Title [SSS-CANT-3B8A]"
  const bracketMatches = [...raw.matchAll(/\[([A-Z0-9][A-Z0-9_-]{2,})\]/g)];
  for (const match of bracketMatches) {
    const candidateSku = match[1];
    if (/[A-Z]/.test(candidateSku)) {
      const withoutSku = raw.replace(match[0], '').trim();
      const title = cleanTitleText(withoutSku) || candidateSku;
      return { sku: candidateSku, title };
    }
  }

  // Match B2B Invoice format: "Product Title (SSS-CANT-3B8A) — Finish, Mobility"
  const parenMatches = [...raw.matchAll(/\(([A-Z0-9][A-Z0-9_-]{2,})\)/g)];
  for (const match of parenMatches) {
    const candidateSku = match[1];
    if (/[A-Z]/.test(candidateSku)) {
      const withoutSku = raw.replace(match[0], '').trim();
      const title = cleanTitleText(withoutSku) || candidateSku;
      return { sku: candidateSku, title };
    }
  }

  return null;
}

export function extractConfigFromStripeDescription(description: string): {
  finishName?: string;
  mobilityName?: string;
} {
  const raw = String(description || '').trim();
  if (!raw) return {};

  // Checkout format: "Finish: RAL 5010 Blue | Base: Forklift Pockets (5% Bulk Discount Applied) — Ex. VAT"
  const checkoutFinish = raw.match(/Finish:\s*([^|]+?)(?=\s*\||\s+[—(]|$)/i);
  const checkoutBase = raw.match(/Base:\s*([^—]+?)(?=\s*\(\d+%|\s+[—]|\s*\(Ex\.?\s*VAT|$)/i);
  if (checkoutFinish || checkoutBase) {
    const finishName = checkoutFinish?.[1]?.trim();
    const mobilityName = checkoutBase?.[1]?.trim();
    return {
      ...(finishName ? { finishName } : {}),
      ...(mobilityName ? { mobilityName } : {}),
    };
  }

  // Proforma format: "... (SKU) — RAL 5010, Castors + Forklift [-5% Bulk Tier] (Ex. VAT)"
  const dashIndex = raw.indexOf(' — ');
  if (dashIndex >= 0) {
    let configSegment = raw.slice(dashIndex + 3);
    configSegment = configSegment
      .replace(/\[-\d+%[^\]]*\]/gi, '')
      .replace(/\(Ex\.?\s*VAT\)/gi, '')
      .trim();

    if (configSegment) {
      const commaMatch = configSegment.match(/^([^,]+?),\s*(.+)$/);
      if (commaMatch) {
        return {
          finishName: commaMatch[1].trim(),
          mobilityName: commaMatch[2].trim(),
        };
      }
      return { finishName: configSegment };
    }
  }

  return {};
}

function extractSkuFromOrderReference(orderRef: string): string | null {
  const match = String(orderRef || '')
    .trim()
    .match(/^SSS-([A-Z0-9][A-Z0-9_-]{2,})-\d{4,6}$/i);
  return match ? match[1].toUpperCase() : null;
}

export function normalizeStripeCheckoutSession(
  session: any,
  lineItems: any[] = [],
  numericId = 1
): NormalizedStripeOrder | null {
  if (!session || typeof session !== 'object') return null;

  const paymentStatus = String(session.payment_status ?? '')
    .trim()
    .toLowerCase();
  const sessionStatus = String(session.status ?? '')
    .trim()
    .toLowerCase();
  if (paymentStatus !== 'paid' || sessionStatus === 'expired') {
    return null;
  }

  const currency = String(session.currency ?? 'gbp')
    .trim()
    .toLowerCase();
  if (currency && currency !== 'gbp') {
    return null;
  }

  const metadata = (session.metadata && typeof session.metadata === 'object' ? session.metadata : {}) as Record<
    string,
    string
  >;

  let deliveryExVatPence = 0;
  let vatFromLinesPence = 0;
  let totalUnits = 0;
  const itemsJson: StripeNormalizedOrderItem[] = [];

  for (const line of Array.isArray(lineItems) ? lineItems : []) {
    const desc = String(line?.description ?? line?.price?.product?.name ?? '').trim();
    const productDesc = String(line?.price?.product?.description ?? '').trim();
    const lineAmount = Math.max(
      0,
      parseOptionalInt(line?.amount_subtotal) ?? parseOptionalInt(line?.amount_total) ?? 0
    );
    const qty = Math.max(1, parseOptionalInt(line?.quantity) ?? 1);

    if (isStripeVatLine(desc)) {
      vatFromLinesPence += lineAmount;
      continue;
    }

    if (isStripeFreightLine(desc)) {
      deliveryExVatPence += lineAmount;
      continue;
    }

    const parsedSku = extractSkuAndTitleFromStripeDescription(desc);
    const productMetaSku =
      typeof line?.price?.product?.metadata?.sku === 'string'
        ? line.price.product.metadata.sku.trim()
        : '';
    const sku = parsedSku?.sku || productMetaSku;
    const title = parsedSku?.title || cleanTitleText(desc);
    const config = extractConfigFromStripeDescription(productDesc || desc);

    totalUnits += qty;
    if (sku) {
      itemsJson.push({
        sku,
        title: title || sku,
        quantity: qty,
        lineSubtotalExVatPence: lineAmount,
        ...(config.finishName ? { finishName: config.finishName } : {}),
        ...(config.mobilityName ? { mobilityName: config.mobilityName } : {}),
      });
    }
  }

  const metaExVat = parseOptionalInt(metadata.totalExVatPence);
  const metaVat = parseOptionalInt(metadata.vatAmountPence);
  const metaIncVat = parseOptionalInt(metadata.totalIncVatPence);

  const amountTotal = Math.max(0, parseOptionalInt(session.amount_total) ?? 0);
  const totalIncVatPence =
    metaIncVat !== null && metaIncVat >= 0 ? metaIncVat : amountTotal;

  let vatPence: number;
  let totalExVatPence: number;

  if (metaExVat !== null && metaExVat >= 0) {
    totalExVatPence = metaExVat;
    vatPence =
      metaVat !== null && metaVat >= 0
        ? metaVat
        : Math.max(0, totalIncVatPence - totalExVatPence);
  } else if (vatFromLinesPence > 0) {
    vatPence = vatFromLinesPence;
    totalExVatPence = Math.max(0, totalIncVatPence - vatPence);
  } else {
    totalExVatPence = Math.round(totalIncVatPence / 1.2);
    vatPence = Math.max(0, totalIncVatPence - totalExVatPence);
  }

  const subtotalExVatPence = Math.max(0, totalExVatPence - deliveryExVatPence);
  const orderReference =
    String(metadata.orderReference ?? '').trim() || String(session.id ?? '');

  if (totalUnits === 0) {
    const fallbackSku = extractSkuFromOrderReference(orderReference);
    const fallbackUnits = Math.max(1, parseOptionalInt(metadata.palletCount) ?? 1);
    totalUnits = fallbackUnits;
    if (fallbackSku && itemsJson.length === 0) {
      itemsJson.push({
        sku: fallbackSku,
        title: fallbackSku,
        quantity: fallbackUnits,
        lineSubtotalExVatPence: subtotalExVatPence,
      });
    }
  }

  const customFields = Array.isArray(session.custom_fields) ? session.custom_fields : [];
  const customPo = customFields.find(
    (field: any) => field?.key === 'purchase_order_ref'
  )?.text?.value;

  const customerEmail =
    normalizeEmailValue(session?.customer_details?.email) ||
    normalizeEmailValue(session?.customer_email);

  const companyNameRaw =
    (typeof metadata.companyName === 'string' && metadata.companyName.trim()) ||
    (typeof session?.customer_details?.name === 'string' &&
      session.customer_details.name.trim()) ||
    null;

  const postcodeRaw =
    (typeof metadata.postcode === 'string' && metadata.postcode.trim()) ||
    (typeof session?.customer_details?.address?.postal_code === 'string' &&
      session.customer_details.address.postal_code.trim()) ||
    (typeof session?.shipping_details?.address?.postal_code === 'string' &&
      session.shipping_details.address.postal_code.trim()) ||
    '';

  const poRaw =
    (typeof metadata.purchaseOrderNumber === 'string' && metadata.purchaseOrderNumber.trim()) ||
    (typeof customPo === 'string' && customPo.trim()) ||
    null;

  const createdSec = parseOptionalInt(session.created);
  const createdAt = createdSec
    ? new Date(createdSec * 1000).toISOString()
    : new Date(0).toISOString();

  return {
    id: numericId,
    orderReference,
    customerEmail,
    companyName: companyNameRaw,
    paymentMode: 'card',
    status: 'paid',
    totalUnits,
    subtotalExVatPence,
    deliveryExVatPence,
    vatPence,
    totalIncVatPence,
    postcode: postcodeRaw,
    purchaseOrderNumber: poRaw,
    createdAt,
    itemsJson,
    stripeSessionId: typeof session.id === 'string' ? session.id : null,
    stripeInvoiceId:
      typeof session.invoice === 'string' ? session.invoice : session.invoice?.id ?? null,
    source: 'stripe',
  };
}

export function normalizeStripeInvoice(
  invoice: any,
  numericId = 1
): NormalizedStripeOrder | null {
  if (!invoice || typeof invoice !== 'object') return null;

  const rawStatus = String(invoice.status ?? '')
    .trim()
    .toLowerCase();
  if (rawStatus !== 'open' && rawStatus !== 'paid') {
    return null;
  }

  const currency = String(invoice.currency ?? 'gbp')
    .trim()
    .toLowerCase();
  if (currency && currency !== 'gbp') {
    return null;
  }

  const metadata = (invoice.metadata && typeof invoice.metadata === 'object' ? invoice.metadata : {}) as Record<
    string,
    string
  >;

  const lines = Array.isArray(invoice?.lines?.data) ? invoice.lines.data : [];
  let vatFromLinesPence = 0;
  let deliveryExVatPence = 0;
  let totalUnits = 0;
  const itemsJson: StripeNormalizedOrderItem[] = [];

  for (const line of lines) {
    const desc = String(line?.description ?? '').trim();
    const amount = Math.max(0, parseOptionalInt(line?.amount) ?? 0);
    const qty = Math.max(1, parseOptionalInt(line?.quantity) ?? 1);

    if (isStripeVatLine(desc)) {
      vatFromLinesPence += amount;
      continue;
    }

    if (isStripeFreightLine(desc)) {
      deliveryExVatPence += amount;
      continue;
    }

    const parsedSku = extractSkuAndTitleFromStripeDescription(desc);
    const config = extractConfigFromStripeDescription(desc);
    totalUnits += qty;

    if (parsedSku) {
      itemsJson.push({
        sku: parsedSku.sku,
        title: parsedSku.title,
        quantity: qty,
        lineSubtotalExVatPence: amount,
        ...(config.finishName ? { finishName: config.finishName } : {}),
        ...(config.mobilityName ? { mobilityName: config.mobilityName } : {}),
      });
    }
  }

  const totalIncVatPence = Math.max(
    0,
    parseOptionalInt(invoice.total) ??
      Math.max(
        parseOptionalInt(invoice.amount_due) ?? 0,
        parseOptionalInt(invoice.amount_paid) ?? 0
      )
  );

  const invoiceTax = parseOptionalInt(invoice.tax);
  let vatPence: number;
  if (vatFromLinesPence > 0) {
    vatPence = vatFromLinesPence;
  } else if (invoiceTax !== null && invoiceTax > 0) {
    vatPence = invoiceTax;
  } else {
    vatPence = Math.max(0, totalIncVatPence - Math.round(totalIncVatPence / 1.2));
  }

  const totalExVatPence = Math.max(0, totalIncVatPence - vatPence);
  const subtotalExVatPence = Math.max(0, totalExVatPence - deliveryExVatPence);

  const orderReference =
    String(metadata.orderReference ?? '').trim() ||
    String(invoice.number ?? '').trim() ||
    String(invoice.id ?? '');

  if (totalUnits === 0) {
    totalUnits = 1;
    const fallbackSku = extractSkuFromOrderReference(orderReference);
    if (fallbackSku && itemsJson.length === 0) {
      itemsJson.push({
        sku: fallbackSku,
        title: fallbackSku,
        quantity: 1,
        lineSubtotalExVatPence: subtotalExVatPence,
      });
    }
  }

  const customFields = Array.isArray(invoice.custom_fields) ? invoice.custom_fields : [];
  const customPo = customFields.find((f: any) =>
    /po|purchase order/i.test(String(f?.name ?? ''))
  )?.value;

  const createdSec = parseOptionalInt(invoice.created);
  const createdAt = createdSec
    ? new Date(createdSec * 1000).toISOString()
    : new Date(0).toISOString();

  return {
    id: numericId,
    orderReference,
    customerEmail: normalizeEmailValue(invoice.customer_email),
    companyName:
      (typeof metadata.companyName === 'string' && metadata.companyName.trim()) ||
      (typeof invoice.customer_name === 'string' && invoice.customer_name.trim()) ||
      null,
    paymentMode: 'b2b_proforma',
    status: rawStatus === 'paid' ? 'paid' : 'invoiced',
    totalUnits,
    subtotalExVatPence,
    deliveryExVatPence,
    vatPence,
    totalIncVatPence,
    postcode:
      (typeof metadata.postcode === 'string' && metadata.postcode.trim()) ||
      (typeof invoice.customer_address?.postal_code === 'string' &&
        invoice.customer_address.postal_code.trim()) ||
      '',
    purchaseOrderNumber:
      (typeof metadata.purchaseOrderNumber === 'string' && metadata.purchaseOrderNumber.trim()) ||
      (typeof customPo === 'string' && customPo.trim()) ||
      null,
    createdAt,
    itemsJson,
    stripeInvoiceId: typeof invoice.id === 'string' ? invoice.id : null,
    hostedInvoiceUrl:
      typeof invoice.hosted_invoice_url === 'string' ? invoice.hosted_invoice_url : null,
    invoicePdfUrl: typeof invoice.invoice_pdf === 'string' ? invoice.invoice_pdf : null,
    source: 'stripe',
  };
}

export function mergeAndDeduplicateStripeOrders(
  sessionOrders: NormalizedStripeOrder[],
  invoiceOrders: NormalizedStripeOrder[],
  linkedSessionInvoiceIds: Set<string> = new Set()
): NormalizedStripeOrder[] {
  const seenRefs = new Set<string>();
  const combined: NormalizedStripeOrder[] = [];

  for (const order of sessionOrders) {
    if (order.orderReference) {
      seenRefs.add(order.orderReference);
    }
    combined.push(order);
  }

  for (const invoiceOrder of invoiceOrders) {
    if (
      invoiceOrder.stripeInvoiceId &&
      linkedSessionInvoiceIds.has(invoiceOrder.stripeInvoiceId)
    ) {
      continue;
    }
    if (invoiceOrder.orderReference && seenRefs.has(invoiceOrder.orderReference)) {
      continue;
    }
    if (invoiceOrder.orderReference) {
      seenRefs.add(invoiceOrder.orderReference);
    }
    combined.push(invoiceOrder);
  }

  combined.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return combined.map((order, index) => ({
    ...order,
    id: index + 1,
  }));
}

export function computeUniqueStripeCustomerCounts(
  customers: any[],
  orders: NormalizedStripeOrder[],
  rangeStartDate?: Date
): { totalCustomers: number; newCustomersInPeriod: number } {
  const earliestByEmail = new Map<string, number>();

  const recordEmail = (email: string, createdMs: number) => {
    if (!email) return;
    const validMs = Number.isFinite(createdMs) && createdMs > 0 ? createdMs : Date.now();
    const prev = earliestByEmail.get(email);
    if (prev === undefined || validMs < prev) {
      earliestByEmail.set(email, validMs);
    }
  };

  for (const customer of Array.isArray(customers) ? customers : []) {
    const email = normalizeEmailValue(customer?.email);
    const createdSec = parseOptionalInt(customer?.created);
    if (email && createdSec) {
      recordEmail(email, createdSec * 1000);
    } else if (email) {
      recordEmail(email, Date.now());
    }
  }

  for (const order of orders) {
    const email = normalizeEmailValue(order.customerEmail);
    const parsedMs = Date.parse(order.createdAt);
    if (email) {
      recordEmail(email, Number.isFinite(parsedMs) ? parsedMs : Date.now());
    }
  }

  const startMs = rangeStartDate?.getTime();
  let newCustomersInPeriod = 0;

  for (const createdMs of earliestByEmail.values()) {
    if (startMs === undefined || createdMs >= startMs) {
      newCustomersInPeriod += 1;
    }
  }

  return {
    totalCustomers: earliestByEmail.size,
    newCustomersInPeriod,
  };
}

async function stripeGet<T = any>(
  path: string,
  queryParams: Array<[string, string]>,
  secretKey: string
): Promise<T> {
  const url = new URL(`${STRIPE_API_BASE}${path}`);
  for (const [k, v] of queryParams) {
    url.searchParams.append(k, v);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  const json = await response.json();
  if (!response.ok) {
    const msg = json?.error?.message || `Stripe API error (${response.status})`;
    throw new Error(msg);
  }

  return json as T;
}

async function paginateStripeList(
  path: string,
  baseParams: Array<[string, string]>,
  secretKey: string
): Promise<any[]> {
  const collected: any[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < MAX_STRIPE_PAGES; page += 1) {
    const params: Array<[string, string]> = [...baseParams, ['limit', '100']];
    if (startingAfter) {
      params.push(['starting_after', startingAfter]);
    }

    const res = await stripeGet<{ data?: any[]; has_more?: boolean }>(path, params, secretKey);
    const items = Array.isArray(res?.data) ? res.data : [];
    collected.push(...items);

    if (!res?.has_more || items.length === 0) {
      break;
    }
    const lastId = items[items.length - 1]?.id;
    if (typeof lastId !== 'string' || !lastId) {
      break;
    }
    startingAfter = lastId;
  }

  return collected;
}

async function fetchSessionLineItemsMap(
  sessions: any[],
  secretKey: string,
  activeStartMs?: number
): Promise<Map<string, any[]>> {
  const lineItemsBySession = new Map<string, any[]>();
  const eligible = sessions
    .filter((s) => {
      const isPaid = String(s?.payment_status ?? '').toLowerCase() === 'paid';
      if (!isPaid || typeof s?.id !== 'string') return false;
      if (activeStartMs !== undefined && typeof s?.created === 'number') {
        return s.created * 1000 >= activeStartMs;
      }
      return true;
    })
    .slice(0, MAX_SESSION_LINE_ITEM_FETCHES);

  for (let i = 0; i < eligible.length; i += LINE_ITEM_BATCH_SIZE) {
    const chunk = eligible.slice(i, i + LINE_ITEM_BATCH_SIZE);
    await Promise.all(
      chunk.map(async (session) => {
        try {
          const res = await stripeGet<{ data?: any[] }>(
            `/checkout/sessions/${encodeURIComponent(session.id)}/line_items`,
            [['limit', '25']],
            secretKey
          );
          if (Array.isArray(res?.data)) {
            lineItemsBySession.set(session.id, res.data);
          }
        } catch {
          // Swallow individual line-item expansion errors so dashboard never fails on one session
        }
      })
    );
  }

  return lineItemsBySession;
}

export async function fetchStripeAnalyticsData(
  range: string,
  now: Date = new Date()
): Promise<StripeAnalyticsFetchResult> {
  const secretKey = readStripeSecretKey();
  if (!secretKey) {
    return {
      status: 'unconfigured',
      livemode: false,
      orders: [],
      totalCustomers: 0,
      newCustomersInPeriod: 0,
      errorMessage: 'STRIPE_SECRET_KEY is not configured.',
    };
  }

  const livemode = secretKey.startsWith('sk_live_');
  const activeStartMs = getRangeStartMs(range, now);
  const rangeDays = getRangeDays(range);
  const fetchGteSeconds =
    activeStartMs !== undefined && rangeDays !== undefined
      ? Math.floor((activeStartMs - rangeDays * MS_PER_DAY) / 1000)
      : undefined;

  const listParams: Array<[string, string]> =
    fetchGteSeconds !== undefined ? [['created[gte]', String(fetchGteSeconds)]] : [];

  try {
    // Customers must list all-time for totalCustomers, while sessions/invoices filter to window + prior comparison window
    const [sessions, invoices, customers] = await Promise.all([
      paginateStripeList('/checkout/sessions', listParams, secretKey),
      paginateStripeList('/invoices', listParams, secretKey),
      paginateStripeList('/customers', [], secretKey),
    ]);

    const lineItemsBySession = await fetchSessionLineItemsMap(sessions, secretKey, activeStartMs);

    const linkedInvoiceIds = new Set<string>();
    const sessionOrders: NormalizedStripeOrder[] = [];

    for (const session of sessions) {
      const invId =
        typeof session?.invoice === 'string' ? session.invoice : session?.invoice?.id;
      if (typeof invId === 'string' && invId) {
        linkedInvoiceIds.add(invId);
      }
      const lineItems =
        typeof session?.id === 'string' ? lineItemsBySession.get(session.id) ?? [] : [];
      const normalized = normalizeStripeCheckoutSession(session, lineItems);
      if (normalized) {
        sessionOrders.push(normalized);
      }
    }

    const invoiceOrders: NormalizedStripeOrder[] = [];
    for (const invoice of invoices) {
      const normalized = normalizeStripeInvoice(invoice);
      if (normalized) {
        invoiceOrders.push(normalized);
      }
    }

    const orders = mergeAndDeduplicateStripeOrders(
      sessionOrders,
      invoiceOrders,
      linkedInvoiceIds
    );
    const rangeStartDate = activeStartMs !== undefined ? new Date(activeStartMs) : undefined;
    const customerCounts = computeUniqueStripeCustomerCounts(customers, orders, rangeStartDate);

    return {
      status: livemode ? 'live' : 'test',
      livemode,
      orders,
      totalCustomers: customerCounts.totalCustomers,
      newCustomersInPeriod: customerCounts.newCustomersInPeriod,
    };
  } catch (err) {
    return {
      status: 'error',
      livemode,
      orders: [],
      totalCustomers: 0,
      newCustomersInPeriod: 0,
      errorMessage: err instanceof Error ? err.message : 'Unable to reach Stripe API.',
    };
  }
}
