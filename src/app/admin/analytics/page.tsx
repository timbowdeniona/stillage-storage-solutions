import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAdminAnalyticsData } from '@/lib/analyticsProvider';
import { AdminAnalyticsDashboard } from '@/components/AdminAnalyticsDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Executive Analytics Dashboard',
  description:
    'Plain-English trade orders, proforma pipeline, top in-demand stillages, and conversion overview for Stillage Storage Solutions administrators.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/analytics');
  }

  if (session.user.role !== 'admin') {
    redirect('/account?notice=admin_required');
  }

  const { summary } = await getAdminAnalyticsData('30d');

  return (
    <AdminAnalyticsDashboard
      initialData={summary}
      adminEmail={session.user.email || ''}
      adminName={session.user.name || 'Administrator'}
    />
  );
}
