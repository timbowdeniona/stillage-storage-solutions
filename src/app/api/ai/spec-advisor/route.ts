import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/contentful';
import { runAiSpecAdvisor } from '@/lib/aiSpecAdvisor';
import { AiSpecAdvisorRequest } from '@/types/catalog';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiSpecAdvisorRequest;
    const products = await getProducts();
    const result = await runAiSpecAdvisor(body, products);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to generate AI stillage recommendation',
      },
      { status: 400 }
    );
  }
}
