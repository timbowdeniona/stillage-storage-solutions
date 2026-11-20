import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOrdersForCustomer, getUserByEmail } from '@/lib/repository';
import { normalizeEmail, resolveUserRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 && value <= 2147483647 ? value : null;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2147483647 ? parsed : null;
}

export async function GET() {
  try {
    const session = await auth();
    const normalizedEmail = normalizeEmail(session?.user?.email);

    if (!session?.user || !normalizedEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = parsePositiveInt(session.user.id);

    const [orders, userRecord] = await Promise.all([
      getOrdersForCustomer({ userId, email: normalizedEmail }),
      getUserByEmail(normalizedEmail),
    ]);

    const profileEmail = userRecord?.email ?? normalizedEmail;
    const profile = {
      name: userRecord?.name ?? session.user.name ?? null,
      email: profileEmail,
      role: resolveUserRole(profileEmail),
      companyName: userRecord?.companyName ?? null,
      phone: userRecord?.phone ?? null,
      defaultPostcode: userRecord?.defaultPostcode ?? null,
      defaultTailLift: Boolean(userRecord?.defaultTailLift),
    };

    return NextResponse.json(
      { orders, profile },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[account/orders] Failed to fetch customer orders:', err);
    return NextResponse.json({ error: 'Failed to load account orders' }, { status: 500 });
  }
}
