import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { B2B_ANALYTICS_EVENT_NAMES, type B2BAnalyticsEventName } from '@/lib/analytics';
import { insertAnalyticsEvent } from '@/lib/repository';

const ALLOWED_EVENTS = new Set<string>(B2B_ANALYTICS_EVENT_NAMES);
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/g;

function sanitizeOptionalString(
  value: unknown,
  maxLength: number,
  allowFiniteNumber = false
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(CONTROL_CHARS_RE, '').trim();
    if (!cleaned) {
      return null;
    }
    return cleaned.slice(0, maxLength);
  }

  if (allowFiniteNumber && typeof value === 'number' && Number.isFinite(value)) {
    return String(value).slice(0, maxLength);
  }

  return null;
}

function parseOptionalBoundedInt(
  value: unknown,
  min: number,
  max: number
): { ok: true; value: number | null } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    return { ok: false };
  }
  return { ok: true, value: Math.round(value) };
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const body = rawBody as Record<string, unknown>;
  const eventName = typeof body.event === 'string' ? body.event.trim() : '';

  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'Invalid analytics event name' }, { status: 400 });
  }

  const quantity = parseOptionalBoundedInt(body.quantity, 0, 100000);
  const discountPercentage = parseOptionalBoundedInt(body.discountPercentage, 0, 100);
  const totalExVatPence = parseOptionalBoundedInt(body.totalExVatPence, 0, 100_000_000);

  if (!quantity.ok || !discountPercentage.ok || !totalExVatPence.ok) {
    return NextResponse.json({ error: 'Invalid numeric analytics field' }, { status: 400 });
  }

  let userId: number | null = null;
  try {
    const session = await auth();
    const rawUserId = session?.user?.id;
    if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
      const parsedId = Number.parseInt(rawUserId, 10);
      if (Number.isSafeInteger(parsedId) && parsedId > 0) {
        userId = parsedId;
      }
    }
  } catch {
    // Never reject anonymous visitors or fail event ingestion on auth lookup error
  }

  try {
    await insertAnalyticsEvent({
      eventName: eventName as B2BAnalyticsEventName,
      userId,
      sessionId: sanitizeOptionalString(body.sessionId, 128),
      sku: sanitizeOptionalString(body.sku, 64),
      productTitle: sanitizeOptionalString(body.productTitle, 200),
      optionType: sanitizeOptionalString(body.optionType, 64),
      optionValue: sanitizeOptionalString(body.optionValue, 120, true),
      quantity: quantity.value,
      discountPercentage: discountPercentage.value,
      totalExVatPence: totalExVatPence.value,
      paymentMethod: sanitizeOptionalString(body.paymentMethod, 64),
      contactMethod: sanitizeOptionalString(body.contactMethod, 64),
      searchQuery: sanitizeOptionalString(body.searchQuery, 200),
      path: sanitizeOptionalString(body.path, 300),
    });

    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Failed to store analytics event' }, { status: 500 });
  }
}
