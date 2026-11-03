import { NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/pricing';
import { QuoteRequest } from '@/types/catalog';

interface CheckoutBody {
  quoteRequest: QuoteRequest;
  productTitle: string;
  paymentMode: 'card' | 'b2b_proforma';
  companyName?: string;
  customerEmail?: string;
  purchaseOrderNumber?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    if (!body || !body.quoteRequest || !body.quoteRequest.sku) {
      return NextResponse.json({ error: 'Invalid checkout request payload' }, { status: 400 });
    }

    const quote = calculateQuote(body.quoteRequest);
    const orderReference = `SSS-${body.quoteRequest.sku}-${Date.now().toString().slice(-5)}`;

    const message =
      body.paymentMode === 'b2b_proforma'
        ? `Official VAT Proforma Invoice ${orderReference} generated for ${
            body.companyName || 'Trade Account'
          } (${quote.quantity}x ${body.productTitle}).`
        : `Instant Checkout Session ${orderReference} prepared (${quote.quantity}x ${body.productTitle}).`;

    return NextResponse.json({
      status: 'ready',
      orderReference,
      paymentMode: body.paymentMode,
      checkoutUrl: `/products?order_confirmed=${encodeURIComponent(orderReference)}`,
      quote,
      message,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout error' },
      { status: 400 }
    );
  }
}
