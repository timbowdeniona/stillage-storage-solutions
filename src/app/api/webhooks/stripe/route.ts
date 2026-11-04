import { NextResponse } from 'next/server';
import { verifyStripeWebhookSignature } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (webhookSecret && webhookSecret !== 'whsec_your_optional_webhook_secret') {
      const isValid = verifyStripeWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Stripe webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody) as {
      id: string;
      type: string;
      livemode: boolean;
      data: {
        object: Record<string, any>;
      };
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderRef = session.metadata?.orderReference || session.id;
        console.info(
          `[Stripe Webhook] Checkout Session completed for order ${orderRef} (${session.amount_total} pence)`
        );
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const orderRef = invoice.metadata?.orderReference || invoice.number || invoice.id;
        console.info(
          `[Stripe Webhook] B2B Proforma Invoice paid for order ${orderRef} (${invoice.amount_paid} pence)`
        );
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true, eventId: event.id, type: event.type });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
