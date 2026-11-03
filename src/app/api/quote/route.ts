import { NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/pricing';
import { QuoteRequest } from '@/types/catalog';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequest;
    if (!body || !body.sku || typeof body.basePriceExVatPence !== 'number') {
      return NextResponse.json(
        { error: 'Missing required quote parameters (sku, basePriceExVatPence)' },
        { status: 400 }
      );
    }

    const quote = calculateQuote(body);
    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid quote payload' },
      { status: 400 }
    );
  }
}
