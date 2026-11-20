import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getUserByEmail,
  updateUserProfile,
  upsertUserOnSignIn,
  type UpdateUserProfileInput,
} from '@/lib/repository';
import { normalizeEmail, resolveUserRole } from '@/lib/roles';
import type { UserRecord } from '../../../../../db/schema';

export const dynamic = 'force-dynamic';

function toSanitizedProfile(
  userRecord: UserRecord | null,
  sessionUser: { name?: string | null; email: string }
) {
  const email = userRecord?.email ?? sessionUser.email;
  return {
    name: userRecord?.name ?? sessionUser.name ?? null,
    email,
    role: resolveUserRole(email),
    companyName: userRecord?.companyName ?? null,
    phone: userRecord?.phone ?? null,
    defaultPostcode: userRecord?.defaultPostcode ?? null,
    defaultTailLift: Boolean(userRecord?.defaultTailLift),
  };
}

export async function GET() {
  try {
    const session = await auth();
    const normalizedEmail = normalizeEmail(session?.user?.email);

    if (!session?.user || !normalizedEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRecord = await getUserByEmail(normalizedEmail);

    return NextResponse.json(
      {
        profile: toSanitizedProfile(userRecord, {
          name: session.user.name,
          email: normalizedEmail,
        }),
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[account/profile] Failed to fetch customer profile:', err);
    return NextResponse.json({ error: 'Failed to load customer profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const normalizedEmail = normalizeEmail(session?.user?.email);

    if (!session?.user || !normalizedEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const body = rawBody as Record<string, unknown>;
    const patch: UpdateUserProfileInput = {};

    if (body.companyName !== undefined) {
      if (body.companyName !== null && typeof body.companyName !== 'string') {
        return NextResponse.json(
          { error: 'companyName must be a string or null' },
          { status: 400 }
        );
      }
      const trimmed =
        typeof body.companyName === 'string'
          ? body.companyName.trim().slice(0, 120).trim()
          : '';
      patch.companyName = trimmed || null;
    }

    if (body.phone !== undefined) {
      if (body.phone !== null && typeof body.phone !== 'string') {
        return NextResponse.json({ error: 'phone must be a string or null' }, { status: 400 });
      }
      const trimmed =
        typeof body.phone === 'string' ? body.phone.trim().slice(0, 40).trim() : '';
      patch.phone = trimmed || null;
    }

    if (body.defaultPostcode !== undefined) {
      if (body.defaultPostcode !== null && typeof body.defaultPostcode !== 'string') {
        return NextResponse.json(
          { error: 'defaultPostcode must be a string or null' },
          { status: 400 }
        );
      }
      const normalizedPostcode =
        typeof body.defaultPostcode === 'string'
          ? body.defaultPostcode.trim().toUpperCase().slice(0, 16).trim()
          : '';
      patch.defaultPostcode = normalizedPostcode || null;
    }

    if (body.defaultTailLift !== undefined) {
      if (typeof body.defaultTailLift !== 'boolean') {
        return NextResponse.json(
          { error: 'defaultTailLift must be a boolean' },
          { status: 400 }
        );
      }
      patch.defaultTailLift = body.defaultTailLift;
    }

    let updated = await updateUserProfile(normalizedEmail, patch);
    if (!updated) {
      await upsertUserOnSignIn({
        email: normalizedEmail,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        role: resolveUserRole(normalizedEmail),
        provider: session.user.provider ?? null,
      });
      updated = await updateUserProfile(normalizedEmail, patch);
    }

    return NextResponse.json(
      {
        profile: toSanitizedProfile(updated, {
          name: session.user.name,
          email: normalizedEmail,
        }),
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[account/profile] Failed to update customer profile:', err);
    return NextResponse.json({ error: 'Failed to update customer profile' }, { status: 500 });
  }
}
