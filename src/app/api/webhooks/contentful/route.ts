import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { normalizeWebhookOrProductPayload } from '@/lib/algolia';

const SITE_CONTENT_TYPES = new Set([
  'homePage',
  'navigationMenu',
  'componentMicrotexts',
]);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entryId = payload?.sys?.id || payload?.objectID || payload?.id || 'unknown';
    const contentTypeId = payload?.sys?.contentType?.sys?.id || '';
    const topic = request.headers.get('x-contentful-topic') || '';
    const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);
    const algoliaAppId = env['NEXT_PUBLIC_ALGOLIA_APP_ID'];
    const algoliaAdminKey = env['ALGOLIA_ADMIN_API_KEY'];
    const algoliaIndex = env['NEXT_PUBLIC_ALGOLIA_INDEX_NAME'] || 'stillage_products';

    // Revalidate Next.js ISR cache for site content, navigation, homepage, and microtexts
    if (SITE_CONTENT_TYPES.has(contentTypeId)) {
      revalidateTag('contentful-site');
      revalidatePath('/', 'layout');
      revalidatePath('/');
      return NextResponse.json({
        status: 'revalidated',
        entryId,
        contentTypeId,
        engine: 'contentful-nextjs-isr',
      });
    }

    // Handle Contentful unpublish or delete events
    if (
      algoliaAppId &&
      algoliaAdminKey &&
      entryId !== 'unknown' &&
      (topic.includes('unpublish') || topic.includes('delete'))
    ) {
      await fetch(
        `https://${algoliaAppId}.algolia.net/1/indexes/${encodeURIComponent(algoliaIndex)}/${encodeURIComponent(entryId)}`,
        {
          method: 'DELETE',
          headers: {
            'X-Algolia-Application-Id': algoliaAppId,
            'X-Algolia-API-Key': algoliaAdminKey,
          },
        }
      );

      return NextResponse.json({
        status: 'deleted',
        entryId,
        index: algoliaIndex,
        engine: 'contentful-algolia-webhook',
      });
    }

    const normalizedRecord = normalizeWebhookOrProductPayload(payload);

    if (algoliaAppId && algoliaAdminKey && entryId !== 'unknown') {
      const recordToIndex = normalizedRecord || {
        ...payload,
        objectID: entryId,
      };

      await fetch(
        `https://${algoliaAppId}.algolia.net/1/indexes/${encodeURIComponent(algoliaIndex)}/${encodeURIComponent(entryId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': algoliaAppId,
            'X-Algolia-API-Key': algoliaAdminKey,
          },
          body: JSON.stringify(recordToIndex),
        }
      );
    }

    return NextResponse.json({
      status: 'indexed',
      entryId,
      sku: normalizedRecord?.sku || null,
      footprintMm: normalizedRecord?.footprintMm || null,
      index: algoliaIndex,
      engine: 'contentful-algolia-webhook',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook sync failed' },
      { status: 400 }
    );
  }
}
