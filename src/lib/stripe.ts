import crypto from 'crypto';
import { BasketOrderSummary } from '@/types/catalog';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export function getStripeSecretKey(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key === 'sk_test_your_stripe_secret_key') {
    return undefined;
  }
  return key;
}

export function getStripePublishableKey(): string | undefined {
  const key = (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  if (!key || key === 'pk_test_your_stripe_publishable_key') {
    return undefined;
  }
  return key;
}

/**
 * Encodes nested objects/arrays into Stripe's application/x-www-form-urlencoded bracket syntax
 * e.g. { line_items: [{ quantity: 1 }] } -> "line_items[0][quantity]=1"
 */
export function encodeStripeFormParams(
  data: Record<string, unknown>,
  prefix = ''
): URLSearchParams {
  const params = new URLSearchParams();

  const appendRecursive = (val: unknown, key: string) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        appendRecursive(item, `${key}[${idx}]`);
      });
    } else if (typeof val === 'object') {
      Object.entries(val as Record<string, unknown>).forEach(([subKey, subVal]) => {
        appendRecursive(subVal, `${key}[${subKey}]`);
      });
    } else {
      params.append(key, String(val));
    }
  };

  Object.entries(data).forEach(([k, v]) => {
    const fullKey = prefix ? `${prefix}[${k}]` : k;
    appendRecursive(v, fullKey);
  });

  return params;
}

export async function stripeRequest<T = Record<string, any>>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE';
    params?: Record<string, unknown>;
    secretKey?: string;
  } = {}
): Promise<T> {
  const secretKey = options.secretKey || getStripeSecretKey();
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is missing or not configured in .env.local. Add your sk_test_... key to enable Stripe Sandbox.'
    );
  }

  const method = options.method || 'GET';
  let url = `${STRIPE_API_BASE}${path}`;
  let body: string | undefined;

  if (options.params) {
    const encoded = encodeStripeFormParams(options.params).toString();
    if (method === 'GET') {
      url += (url.includes('?') ? '&' : '?') + encoded;
    } else {
      body = encoded;
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  const json = await response.json();
  if (!response.ok) {
    const errMsg =
      json?.error?.message || `Stripe API error (${response.status} ${response.statusText})`;
    throw new Error(errMsg);
  }

  return json as T;
}

export interface CreateEmbeddedCheckoutOptions {
  orderReference: string;
  summary: BasketOrderSummary;
  origin: string;
  customerEmail?: string;
  companyName?: string;
  purchaseOrderNumber?: string;
}

export interface StripeEmbeddedSessionResult {
  sessionId: string;
  clientSecret: string;
  url?: string;
  livemode: boolean;
}

/**
 * Creates a Stripe Embedded Checkout Session (ui_mode: 'embedded') with itemized
 * configured stillages, UK HGV pallet freight, and 20% UK VAT.
 */
export async function createStripeEmbeddedCheckoutSession(
  opts: CreateEmbeddedCheckoutOptions
): Promise<StripeEmbeddedSessionResult> {
  const { orderReference, summary, origin, customerEmail, companyName, purchaseOrderNumber } = opts;

  const lineItems: Array<Record<string, unknown>> = summary.items.map((item) => {
    const discountNote =
      item.discountPercentage > 0 ? ` (${item.discountPercentage}% Bulk Discount Applied)` : '';
    return {
      quantity: item.quantity,
      price_data: {
        currency: 'gbp',
        unit_amount: item.discountedUnitExVatPence,
        product_data: {
          name: `${item.title} [${item.sku}]`,
          description: `Finish: ${item.finishName} | Base: ${item.mobilityName}${discountNote} — Ex. VAT`,
          metadata: {
            sku: item.sku,
            finishOption: item.finishOption,
            mobilityOption: item.mobilityOption,
          },
        },
      },
    };
  });

  // Add HGV Pallet Delivery & Offloading Line Item (Ex. VAT)
  if (summary.deliveryExVatPence > 0) {
    const offloadLabel = summary.requiresTailLift
      ? 'Includes Tail-Lift Offloading (+£15.00)'
      : 'Forklift On-Site Required for Offloading';
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'gbp',
        unit_amount: summary.deliveryExVatPence,
        product_data: {
          name: `UK HGV Pallet Network Freight (${summary.palletCount} Pallet${
            summary.palletCount > 1 ? 's' : ''
          })`,
          description: `${summary.deliveryZone} — Postcode: ${summary.postcode} (${offloadLabel}) — Ex. VAT`,
        },
      },
    });
  }

  // Add 20% UK VAT Line Item so total matches the exact pence quote
  if (summary.vatAmountPence > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'gbp',
        unit_amount: summary.vatAmountPence,
        product_data: {
          name: 'UK Standard Rate VAT (20%)',
          description: '20% UK Value Added Tax on Configured Stillages & HGV Pallet Freight',
        },
      },
    });
  }

  const sessionParams: Record<string, unknown> = {
    ui_mode: 'embedded_page',
    mode: 'payment',
    line_items: lineItems,
    return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    shipping_address_collection: {
      allowed_countries: ['GB'],
    },
    phone_number_collection: {
      enabled: true,
    },
    custom_fields: [
      {
        key: 'purchase_order_ref',
        label: {
          type: 'custom',
          custom: 'Purchase Order (PO) / Site Contact Note',
        },
        type: 'text',
        optional: true,
      },
    ],
    metadata: {
      orderReference,
      postcode: summary.postcode,
      deliveryZone: summary.deliveryZone,
      palletCount: String(summary.palletCount),
      requiresTailLift: String(summary.requiresTailLift),
      companyName: companyName || 'UK Trade Buyer',
      purchaseOrderNumber: purchaseOrderNumber || '',
      totalExVatPence: String(summary.totalExVatPence),
      vatAmountPence: String(summary.vatAmountPence),
      totalIncVatPence: String(summary.totalIncVatPence),
    },
  };

  if (customerEmail && customerEmail.includes('@')) {
    sessionParams.customer_email = customerEmail.trim();
  }

  const session = await stripeRequest<{
    id: string;
    client_secret: string;
    url?: string;
    livemode: boolean;
  }>('/checkout/sessions', {
    method: 'POST',
    params: sessionParams,
  });

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
    url: session.url,
    livemode: Boolean(session.livemode),
  };
}

export interface CreateB2BInvoiceOptions {
  orderReference: string;
  summary: BasketOrderSummary;
  companyName: string;
  customerEmail: string;
  purchaseOrderNumber?: string;
}

export interface StripeB2BInvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  hostedInvoiceUrl: string;
  invoicePdfUrl: string;
  customerId: string;
  dueDate: number | null;
  livemode: boolean;
}

/**
 * Creates a Stripe Customer, Invoice, itemized InvoiceItems, and finalizes the Invoice
 * so the B2B buyer immediately gets a Hosted Invoice URL + downloadable official Stripe PDF.
 */
export async function createStripeB2BProformaInvoice(
  opts: CreateB2BInvoiceOptions
): Promise<StripeB2BInvoiceResult> {
  const { orderReference, summary, companyName, customerEmail, purchaseOrderNumber } = opts;

  // 1. Create a Stripe Customer for the trade buyer
  const customer = await stripeRequest<{ id: string }>('/customers', {
    method: 'POST',
    params: {
      name: companyName || 'UK Trade Account',
      email: customerEmail || 'accounts@stillagestoragesolutions.co.uk',
      description: `Stillage Storage Solutions B2B Buyer (${orderReference})`,
      metadata: {
        orderReference,
        postcode: summary.postcode,
        purchaseOrderNumber: purchaseOrderNumber || '',
      },
    },
  });

  // 2. Create the draft Invoice with send_invoice (30-day B2B Proforma terms)
  const customFields: Array<{ name: string; value: string }> = [
    { name: 'Order Reference', value: orderReference.slice(0, 30) },
  ];
  if (purchaseOrderNumber?.trim()) {
    customFields.push({
      name: 'Customer PO Number',
      value: purchaseOrderNumber.trim().slice(0, 30),
    });
  }

  const invoice = await stripeRequest<{ id: string }>('/invoices', {
    method: 'POST',
    params: {
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 30,
      currency: 'gbp',
      description: `UK Engineered Steel Stillages — Delivery to ${summary.postcode} (${summary.deliveryZone})`,
      custom_fields: customFields,
      metadata: {
        orderReference,
        postcode: summary.postcode,
        deliveryZone: summary.deliveryZone,
        requiresTailLift: String(summary.requiresTailLift),
        purchaseOrderNumber: purchaseOrderNumber || '',
      },
    },
  });

  // 3. Attach each configured stillage line item to the invoice
  for (const item of summary.items) {
    const discountNote =
      item.discountPercentage > 0 ? ` [-${item.discountPercentage}% Bulk Tier]` : '';
    await stripeRequest('/invoiceitems', {
      method: 'POST',
      params: {
        customer: customer.id,
        invoice: invoice.id,
        currency: 'gbp',
        quantity: item.quantity,
        unit_amount_decimal: String(item.discountedUnitExVatPence),
        description: `${item.title} (${item.sku}) — ${item.finishName}, ${item.mobilityName}${discountNote} (Ex. VAT)`,
      },
    });
  }

  // 4. Attach HGV Pallet Freight line item
  if (summary.deliveryExVatPence > 0) {
    const offloadNote = summary.requiresTailLift ? ' + Tail-Lift Offloading' : ' (Forklift On-Site)';
    await stripeRequest('/invoiceitems', {
      method: 'POST',
      params: {
        customer: customer.id,
        invoice: invoice.id,
        currency: 'gbp',
        amount: summary.deliveryExVatPence,
        description: `HGV Pallet Freight (${summary.palletCount} Pallet${
          summary.palletCount > 1 ? 's' : ''
        } to ${summary.postcode} — ${summary.deliveryZone}${offloadNote}) (Ex. VAT)`,
      },
    });
  }

  // 5. Attach 20% UK VAT line item
  if (summary.vatAmountPence > 0) {
    await stripeRequest('/invoiceitems', {
      method: 'POST',
      params: {
        customer: customer.id,
        invoice: invoice.id,
        currency: 'gbp',
        amount: summary.vatAmountPence,
        description: 'UK Standard Rate VAT (20%)',
      },
    });
  }

  // 6. Finalize the invoice to generate hosted_invoice_url and invoice_pdf immediately
  const finalized = await stripeRequest<{
    id: string;
    number: string;
    hosted_invoice_url: string;
    invoice_pdf: string;
    due_date: number | null;
    livemode: boolean;
  }>(`/invoices/${encodeURIComponent(invoice.id)}/finalize`, {
    method: 'POST',
    params: {
      auto_advance: true,
    },
  });

  return {
    invoiceId: finalized.id,
    invoiceNumber: finalized.number || orderReference,
    hostedInvoiceUrl: finalized.hosted_invoice_url,
    invoicePdfUrl: finalized.invoice_pdf,
    customerId: customer.id,
    dueDate: finalized.due_date,
    livemode: Boolean(finalized.livemode),
  };
}

/**
 * Retrieves a Stripe Checkout Session with expanded line_items and payment_intent.
 */
export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest<{
    id: string;
    status: string;
    payment_status: string;
    amount_subtotal: number;
    amount_total: number;
    currency: string;
    customer_email?: string | null;
    customer_details?: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        postal_code?: string | null;
        country?: string | null;
      } | null;
    } | null;
    shipping_details?: {
      name?: string | null;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        postal_code?: string | null;
        country?: string | null;
      } | null;
    } | null;
    collected_information?: {
      shipping_details?: {
        name?: string | null;
        address?: {
          line1?: string | null;
          line2?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        } | null;
      } | null;
    } | null;
    custom_fields?: Array<{
      key: string;
      label?: { custom?: string };
      text?: { value?: string | null };
    }>;
    metadata?: Record<string, string>;
    line_items?: {
      data: Array<{
        id: string;
        description: string;
        quantity: number;
        amount_total: number;
        amount_subtotal: number;
      }>;
    };
    payment_intent?: {
      id: string;
      status: string;
    } | string | null;
    livemode: boolean;
  }>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    params: {
      expand: ['line_items', 'payment_intent'],
    },
  });
}

/**
 * Verifies a Stripe Webhook signature using HMAC-SHA256.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));
  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.slice(2);
  const expectedSig = signaturePart.slice(3);
  const signedPayload = `${timestamp}.${rawBody}`;
  const computedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSig, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );
  } catch {
    return false;
  }
}
