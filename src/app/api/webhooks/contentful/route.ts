import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entryId = payload?.sys?.id || 'unknown';
    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const algoliaAdminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'stillage_products';

    if (algoliaAppId && algoliaAdminKey && entryId !== 'unknown') {
      await fetch(
        `https://${algoliaAppId}-dsn.algolia.net/1/indexes/${algoliaIndex}/${entryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': algoliaAppId,
            'X-Algolia-API-Key': algoliaAdminKey,
          },
          body: JSON.stringify(payload),
        }
      );
    }

    return NextResponse.json({
      status: 'indexed',
      entryId,
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
