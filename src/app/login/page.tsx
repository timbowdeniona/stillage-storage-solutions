import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getConfiguredOAuthProviders } from '@/lib/roles';
import { LoginCardClient } from '@/components/LoginCardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In — Trade Account & Admin Access',
  description:
    'Sign in with Google, Microsoft, or Facebook to access your Stillage Storage Solutions trade orders, VAT proforma invoices, and delivery profile.',
  robots: {
    index: false,
    follow: false,
  },
};

function getSafeCallbackUrl(raw?: string | string[]): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    /[\r\n]/.test(trimmed)
  ) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return null;
    }
  } catch {
    return null;
  }

  if (trimmed === '/login' || trimmed.startsWith('/login?') || trimmed.startsWith('/login/')) {
    return null;
  }

  return trimmed;
}

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams;
  const safeCallbackUrl = getSafeCallbackUrl(resolvedParams.callbackUrl);
  const rawError = resolvedParams.error;
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError ?? null;

  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn('[login] Ignoring stale/invalid session cookie:', err instanceof Error ? err.message : err);
  }
  if (session?.user) {
    const isAdmin = session.user.role === 'admin';
    if (safeCallbackUrl) {
      const targetsAdminRoute =
        safeCallbackUrl === '/admin' ||
        safeCallbackUrl.startsWith('/admin/') ||
        safeCallbackUrl === '/analytics-report' ||
        safeCallbackUrl.startsWith('/analytics-report/');

      if (targetsAdminRoute && !isAdmin) {
        redirect('/account?notice=admin_required');
      }
      redirect(safeCallbackUrl);
    }

    redirect(isAdmin ? '/admin/analytics' : '/account');
  }

  const providers = getConfiguredOAuthProviders();

  return (
    <section className="bg-steel-50 bg-blueprint-grid py-12 sm:py-16 px-4 sm:px-6 min-h-[calc(100vh-14rem)] flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        <LoginCardClient
          providers={providers}
          callbackUrl={safeCallbackUrl}
          errorCode={errorCode}
        />
      </div>
    </section>
  );
}
