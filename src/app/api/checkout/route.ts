import { NextResponse } from 'next/server';
import { calculateBasketSummary, calculateQuote } from '@/lib/pricing';
import { CheckoutLineItemInput, QuoteRequest } from '@/types/catalog';
import {
  createStripeB2BProformaInvoice,
  createStripeEmbeddedCheckoutSession,
  getStripePublishableKey,
  getStripeSecretKey,
} from '@/lib/stripe';

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    if (!body) {
      return NextResponse.json({ error: 'Invalid checkout request payload' }, { status: 400 });
    }

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
          companyName: body.companyName || 'UK Trade Buyer',
          customerEmail: body.customerEmail || 'accounts@stillagestoragesolutions.co.uk',
          purchaseOrderNumber: body.purchaseOrderNumber,
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
      customerEmail: body.customerEmail,
      companyName: body.companyName,
      purchaseOrderNumber: body.purchaseOrderNumber,
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
