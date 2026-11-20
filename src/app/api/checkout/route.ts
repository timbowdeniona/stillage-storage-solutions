import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { calculateBasketSummary, calculateQuote } from '@/lib/pricing';
import { createOrder, type CreateOrderInput } from '@/lib/repository';
import { normalizeEmail } from '@/lib/roles';
import { CheckoutLineItemInput, QuoteRequest } from '@/types/catalog';
import {
  createStripeB2BProformaInvoice,
  createStripeEmbeddedCheckoutSession,
  getStripePublishableKey,
  getStripeSecretKey,
} from '@/lib/stripe';
import type { OrderItemRecord } from '../../../../db/schema';

interface CheckoutBody {
  items?: CheckoutLineItemInput[];
  quoteRequest?: QuoteRequest;
  productTitle?: string;
  postcode?: string;
  requiresTailLift?: boolean;
  paymentMode: 'card' | 'b2b_proforma';
  companyName?: string;
  customerEmail?: string;
  purchaseOrderNumber?: string;
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 && value <= 2147483647 ? value : null;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2147483647 ? parsed : null;
}

async function persistOrderSafely(input: CreateOrderInput): Promise<void> {
  try {
    await createOrder(input);
  } catch (err) {
    console.error('[checkout] Failed to persist order record:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid checkout request payload' }, { status: 400 });
    }

    let session = null;
    try {
      session = await auth();
    } catch (authErr) {
      console.warn('[checkout] Auth session lookup failed; continuing as guest:', authErr);
    }

    const numericUserId = parsePositiveInt(session?.user?.id);
    const explicitCustomerEmail = normalizeEmail(body.customerEmail);
    const sessionCustomerEmail = normalizeEmail(session?.user?.email);
    const effectiveCustomerEmail =
      explicitCustomerEmail || sessionCustomerEmail || 'guest@stillagestoragesolutions.co.uk';

    const normalizedCompanyName =
      typeof body.companyName === 'string' && body.companyName.trim()
        ? body.companyName.trim()
        : null;
    const normalizedPoNumber =
      typeof body.purchaseOrderNumber === 'string' && body.purchaseOrderNumber.trim()
        ? body.purchaseOrderNumber.trim()
        : null;

    // Normalize single-item quoteRequest or multi-item basket array
    let rawItems: CheckoutLineItemInput[] = [];
    let postcode = body.postcode || 'B1 1AA';
    let requiresTailLift = Boolean(body.requiresTailLift);

    if (Array.isArray(body.items) && body.items.length > 0) {
      rawItems = body.items;
    } else if (body.quoteRequest && body.quoteRequest.sku) {
      rawItems = [
        {
          sku: body.quoteRequest.sku,
          title: body.productTitle || body.quoteRequest.sku,
          basePriceExVatPence: body.quoteRequest.basePriceExVatPence,
          quantity: body.quoteRequest.quantity,
          finishOption: body.quoteRequest.finishOption,
          mobilityOption: body.quoteRequest.mobilityOption,
        },
      ];
      postcode = body.quoteRequest.postcode || postcode;
      requiresTailLift = Boolean(body.quoteRequest.requiresTailLift);
    } else {
      return NextResponse.json(
        { error: 'Order basket is empty. Add at least one configured stillage.' },
        { status: 400 }
      );
    }

    const summary = calculateBasketSummary(rawItems, postcode, requiresTailLift);
    const primarySku = summary.items[0]?.sku || 'ORDER';
    const orderReference = `SSS-${primarySku}-${Date.now().toString().slice(-5)}`;

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

    const baseOrderInput = {
      orderReference,
      userId: numericUserId,
      customerEmail: effectiveCustomerEmail,
      companyName: normalizedCompanyName,
      purchaseOrderNumber: normalizedPoNumber,
      itemsJson,
      totalUnits: summary.totalUnits,
      subtotalExVatPence: summary.goodsSubtotalExVatPence,
      deliveryExVatPence: summary.deliveryExVatPence,
      vatPence: summary.vatAmountPence,
      totalIncVatPence: summary.totalIncVatPence,
      postcode: summary.postcode,
      deliveryZone: summary.deliveryZone,
      requiresTailLift: summary.requiresTailLift,
    };

    // Determine request origin for Stripe return_url
    const reqUrl = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'http';
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : reqUrl.origin || 'http://localhost:3000';

    const publishableKey = getStripePublishableKey();
    const hasSecretKey = Boolean(getStripeSecretKey());

    // Keep legacy single-quote field for backward compatibility
    const quote = body.quoteRequest
      ? calculateQuote(body.quoteRequest)
      : calculateQuote({
          sku: primarySku,
          basePriceExVatPence: summary.items[0].basePriceExVatPence,
          quantity: summary.items[0].quantity,
          finishOption: summary.items[0].finishOption,
          mobilityOption: summary.items[0].mobilityOption,
          postcode: summary.postcode,
          requiresTailLift: summary.requiresTailLift,
        });

    if (body.paymentMode === 'b2b_proforma') {
      if (hasSecretKey) {
        const invoiceResult = await createStripeB2BProformaInvoice({
          orderReference,
          summary,
          companyName: normalizedCompanyName || 'UK Trade Buyer',
          customerEmail:
            explicitCustomerEmail ||
            sessionCustomerEmail ||
            'accounts@stillagestoragesolutions.co.uk',
          purchaseOrderNumber: normalizedPoNumber || undefined,
        });

        await persistOrderSafely({
          ...baseOrderInput,
          paymentMode: 'b2b_proforma',
          status: 'invoiced',
          stripeInvoiceId: invoiceResult.invoiceId,
          invoiceNumber: invoiceResult.invoiceNumber,
          hostedInvoiceUrl: invoiceResult.hostedInvoiceUrl,
          invoicePdfUrl: invoiceResult.invoicePdfUrl,
        });

        return NextResponse.json({
          status: 'invoice_ready',
          orderReference,
          paymentMode: 'b2b_proforma',
          invoiceId: invoiceResult.invoiceId,
          invoiceNumber: invoiceResult.invoiceNumber,
          hostedInvoiceUrl: invoiceResult.hostedInvoiceUrl,
          invoicePdfUrl: invoiceResult.invoicePdfUrl,
          dueDate: invoiceResult.dueDate,
          livemode: invoiceResult.livemode,
          summary,
          quote,
          message: `Official Stripe VAT Proforma Invoice ${invoiceResult.invoiceNumber} generated for ${
            body.companyName || 'Trade Account'
          } (${summary.totalUnits} unit${summary.totalUnits > 1 ? 's' : ''}).`,
        });
      }

      await persistOrderSafely({
        ...baseOrderInput,
        paymentMode: 'b2b_proforma',
        status: 'invoiced',
        stripeInvoiceId: null,
        invoiceNumber: orderReference,
        hostedInvoiceUrl: null,
        invoicePdfUrl: null,
      });

      return NextResponse.json({
        status: 'invoice_ready',
        orderReference,
        paymentMode: 'b2b_proforma',
        invoiceNumber: orderReference,
        summary,
        quote,
        message: `Official VAT Proforma Invoice ${orderReference} generated for ${
          body.companyName || 'Trade Account'
        } (${summary.totalUnits} unit${summary.totalUnits > 1 ? 's' : ''}).`,
      });
    }

    // paymentMode === 'card' (Stripe Embedded Checkout)
    if (!hasSecretKey) {
      return NextResponse.json(
        {
          error:
            'STRIPE_SECRET_KEY is not configured in .env.local. Add your sk_test_... key to enable Stripe Checkout.',
        },
        { status: 500 }
      );
    }

    const embeddedSession = await createStripeEmbeddedCheckoutSession({
      orderReference,
      summary,
      origin,
      customerEmail: explicitCustomerEmail || sessionCustomerEmail || undefined,
      companyName: normalizedCompanyName || undefined,
      purchaseOrderNumber: normalizedPoNumber || undefined,
    });

    await persistOrderSafely({
      ...baseOrderInput,
      paymentMode: 'card',
      status: 'pending',
      stripeSessionId: embeddedSession.sessionId,
    });

    return NextResponse.json({
      status: 'embedded_ready',
      orderReference,
      paymentMode: 'card',
      sessionId: embeddedSession.sessionId,
      clientSecret: embeddedSession.clientSecret,
      publishableKey,
      livemode: embeddedSession.livemode,
      checkoutUrl: `/checkout/return?session_id=${encodeURIComponent(embeddedSession.sessionId)}`,
      summary,
      quote,
      message: `Stripe Embedded Checkout Session (${embeddedSession.sessionId}) initialized for ${summary.totalUnits} unit(s).`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stripe Checkout initialization error' },
      { status: 400 }
    );
  }
}
