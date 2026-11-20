import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  parseAnalyticsRange,
  serializeOrdersToCsv,
} from '@/lib/adminAnalytics';
import { getAdminAnalyticsData } from '@/lib/analyticsProvider';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get('range'));
  const format = searchParams.get('format')?.trim().toLowerCase() === 'csv' ? 'csv' : 'json';
  const bypassCache = searchParams.get('refresh') === '1';

  const { summary, exportOrders } = await getAdminAnalyticsData(range, { bypassCache });

  if (format === 'csv') {
    const csv = serializeOrdersToCsv(exportOrders);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="stillage-orders-${range}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json(summary, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
