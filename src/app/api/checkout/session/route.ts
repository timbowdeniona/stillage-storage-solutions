import { NextResponse } from 'next/server';
import { retrieveStripeCheckoutSession } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id')?.trim();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required session_id query parameter' },
        { status: 400 }
      );
    }

    const session = await retrieveStripeCheckoutSession(sessionId);

    return NextResponse.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountSubtotalPence: session.amount_subtotal,
      amountTotalPence: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || session.customer_email || null,
      customerName: session.customer_details?.name || null,
      customerPhone: session.customer_details?.phone || null,
      shippingDetails:
        session.shipping_details || session.collected_information?.shipping_details || null,
      customFields: session.custom_fields || [],
      metadata: session.metadata || {},
      lineItems:
        session.line_items?.data.map((li) => ({
          id: li.id,
          description: li.description,
          quantity: li.quantity,
          amountTotalPence: li.amount_total,
          amountSubtotalPence: li.amount_subtotal,
        })) || [],
      paymentIntentId:
        typeof session.payment_intent === 'object' && session.payment_intent
          ? session.payment_intent.id
          : session.payment_intent || null,
      livemode: Boolean(session.livemode),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Unable to retrieve Stripe Checkout Session status',
      },
      { status: 400 }
    );
  }
}
