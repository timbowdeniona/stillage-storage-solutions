import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  AccountPortalClient,
  type SerializedAccountUser,
  type SerializedOrderRecord,
} from '@/components/AccountPortalClient';
import { getOrdersForCustomer, getUserByEmail } from '@/lib/repository';
import { normalizeEmail, resolveUserRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Account & Order History',
  description:
    'Manage your Stillage Storage Solutions B2B trade profile, view past Stripe orders and 30-day VAT proforma invoices, and reorder configured steel stillages.',
  robots: {
    index: false,
    follow: false,
  },
};

interface AccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

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

function toIsoString(value: Date | string | null | undefined, fallbackNow = false): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? fallbackNow
        ? new Date().toISOString()
        : null
      : value.toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return fallbackNow ? new Date().toISOString() : null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [resolvedSearchParams, session] = await Promise.all([searchParams, auth()]);

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/account');
  }

  const normalizedSessionEmail = normalizeEmail(session.user.email);
  const userId = parsePositiveInt(session.user.id);

  const [userRecord, orderRecords] = await Promise.all([
    getUserByEmail(normalizedSessionEmail),
    getOrdersForCustomer({ userId, email: normalizedSessionEmail }),
  ]);

  const noticeParam = resolvedSearchParams?.notice;
  const adminNotice =
    noticeParam === 'admin_required' ||
    (Array.isArray(noticeParam) && noticeParam.includes('admin_required'));

  const resolvedEmail = normalizeEmail(userRecord?.email ?? normalizedSessionEmail);

  const serializedUser: SerializedAccountUser = {
    id: userRecord?.id ?? userId,
    email: resolvedEmail,
    name: userRecord?.name ?? session.user.name ?? null,
    image: userRecord?.image ?? session.user.image ?? null,
    role: resolveUserRole(resolvedEmail),
    provider: userRecord?.provider ?? session.user.provider ?? null,
    companyName: userRecord?.companyName ?? null,
    phone: userRecord?.phone ?? null,
    defaultPostcode: userRecord?.defaultPostcode ?? null,
    defaultTailLift: Boolean(userRecord?.defaultTailLift),
    createdAt: toIsoString(userRecord?.createdAt, false),
    lastLoginAt: toIsoString(userRecord?.lastLoginAt, false),
  };

  const serializedOrders: SerializedOrderRecord[] = orderRecords.map((order) => ({
    id: order.id,
    orderReference: order.orderReference,
    userId: order.userId ?? null,
    customerEmail: order.customerEmail,
    companyName: order.companyName ?? null,
    purchaseOrderNumber: order.purchaseOrderNumber ?? null,
    paymentMode: order.paymentMode,
    status: order.status,
    stripeSessionId: order.stripeSessionId ?? null,
    stripeInvoiceId: order.stripeInvoiceId ?? null,
    invoiceNumber: order.invoiceNumber ?? null,
    hostedInvoiceUrl: order.hostedInvoiceUrl ?? null,
    invoicePdfUrl: order.invoicePdfUrl ?? null,
    itemsJson: Array.isArray(order.itemsJson) ? order.itemsJson : [],
    totalUnits: order.totalUnits,
    subtotalExVatPence: order.subtotalExVatPence,
    deliveryExVatPence: order.deliveryExVatPence,
    vatPence: order.vatPence,
    totalIncVatPence: order.totalIncVatPence,
    postcode: order.postcode,
    deliveryZone: order.deliveryZone ?? null,
    requiresTailLift: Boolean(order.requiresTailLift),
    createdAt: toIsoString(order.createdAt, true) as string,
    updatedAt: toIsoString(order.updatedAt, true) as string,
  }));

  return (
    <AccountPortalClient
      user={serializedUser}
      orders={serializedOrders}
      adminNotice={adminNotice}
    />
  );
}
