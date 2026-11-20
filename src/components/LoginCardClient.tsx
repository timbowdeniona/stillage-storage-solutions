'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { AlertCircle, ArrowLeft, Loader2, Lock, ShieldCheck, Wrench } from 'lucide-react';
import type { ConfiguredOAuthProviders } from '@/lib/roles';

export interface LoginCardClientProps {
  providers: ConfiguredOAuthProviders;
  callbackUrl?: string | null;
  errorCode?: string | null;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Unable to start sign-in with that provider. Please try again.',
  OAuthCallback: 'Sign-in could not be completed by the provider. Please try again.',
  OAuthCallbackError: 'Sign-in could not be completed by the provider. Please try again.',
  OAuthAccountNotLinked:
    'This email is already associated with another sign-in method. Please sign in using your original provider.',
  AccessDenied: 'Access was denied during sign-in. Please verify your account or contact support.',
  CredentialsSignin:
    'Quick sign-in failed. Ensure the application is running in a local non-production environment.',
  Configuration: 'Authentication provider configuration is incomplete on the server.',
  SessionRequired: 'Please sign in to access that page.',
};

const DEV_ACCOUNTS = [
  {
    label: 'Tim Bowden — Admin (timdbowden@gmail.com)',
    email: 'timdbowden@gmail.com',
    defaultTarget: '/admin/analytics',
    roleLabel: 'ADMIN',
  },
  {
    label: 'Plant & Robinson — Admin (admin@plantandrobinson.com)',
    email: 'admin@plantandrobinson.com',
    defaultTarget: '/admin/analytics',
    roleLabel: 'ADMIN',
  },
  {
    label: 'Tim Valley Chapel — Customer (tim@valleychapel.co.uk)',
    email: 'tim@valleychapel.co.uk',
    defaultTarget: '/account',
    roleLabel: 'CUSTOMER',
  },
] as const;

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.25 0-6-2.19-6.98-5.14H1.01v3.14C3.02 21.18 7.19 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.02 14.03A7.18 7.18 0 0 1 4.64 12c0-.71.13-1.39.38-2.03V6.83H1.01A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.01 5.17l4.01-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.19 0 3.02 2.82 1.01 6.83l4.01 3.14C6 6.94 8.75 4.75 12 4.75Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M15.18 15.22l.49-3.18h-3.05V9.98c0-.87.43-1.72 1.79-1.72h1.39V5.55s-1.26-.21-2.46-.21c-2.51 0-4.15 1.52-4.15 4.28v2.42H6.4v3.18h2.79v7.68a11.1 11.1 0 0 0 3.43 0v-7.68h2.56Z"
      />
    </svg>
  );
}

export function LoginCardClient({
  providers,
  callbackUrl = null,
  errorCode = null,
}: LoginCardClientProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const oauthCallbackUrl = callbackUrl || '/login';
  const serverErrorMessage = errorCode
    ? AUTH_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again or choose another provider.'
    : null;
  const displayedError = clientError || serverErrorMessage;
  const hasUnconfiguredProvider =
    !providers.google || !providers.microsoft || !providers.facebook;

  const handleOAuthSignIn = async (providerId: 'google' | 'microsoft-entra-id' | 'facebook') => {
    setClientError(null);
    setPendingKey(providerId);
    try {
      await signIn(providerId, { callbackUrl: oauthCallbackUrl });
    } catch {
      setClientError('Could not connect to the authentication service. Please try again.');
      setPendingKey(null);
    }
  };

  const handleDevSignIn = async (email: string, defaultTarget: string) => {
    setClientError(null);
    setPendingKey(email);
    try {
      await signIn('dev-login', {
        email,
        callbackUrl: callbackUrl || defaultTarget,
      });
    } catch {
      setClientError('Local dev sign-in failed. Please try again.');
      setPendingKey(null);
    }
  };

  const oauthButtons = [
    {
      id: 'google' as const,
      label: 'Continue with Google',
      configured: providers.google,
      icon: <GoogleIcon />,
    },
    {
      id: 'microsoft-entra-id' as const,
      label: 'Continue with Microsoft',
      configured: providers.microsoft,
      icon: <MicrosoftIcon />,
    },
    {
      id: 'facebook' as const,
      label: 'Continue with Facebook',
      configured: providers.facebook,
      icon: <FacebookIcon />,
    },
  ];

  return (
    <div className="max-w-md mx-auto border border-steel-200 bg-surface-white rounded-lg shadow-sm overflow-hidden">
      {/* Brand Navy Header Accent */}
      <div className="bg-brand-navy text-surface-white px-6 py-5 border-b border-brand-navyLight">
        <div className="flex items-center gap-2 text-stillage-sky font-mono text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Trade Account &amp; Admin Access</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mt-1.5">
          Sign In to Your Account
        </h1>
        <p className="text-xs sm:text-sm text-steel-200 mt-1">
          View VAT proforma invoices, reorder stillages in one click, or manage your saved delivery postcode.
        </p>
      </div>

      <div className="p-6 space-y-5">
        {callbackUrl && (
          <div className="bg-steel-50 border border-steel-200 rounded-md px-3.5 py-2.5 text-xs text-steel-800 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-stillage-blue shrink-0" />
            <span>
              Sign in to continue to{' '}
              <span className="font-mono font-bold text-brand-navy">{callbackUrl}</span>
            </span>
          </div>
        )}

        {displayedError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-900 rounded-md px-3.5 py-2.5 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* OAuth Provider Buttons */}
        <div className="space-y-3">
          {oauthButtons.map((provider) => {
            const isLoading = pendingKey === provider.id;
            const isDisabled = !provider.configured || pendingKey !== null;

            return (
              <button
                key={provider.id}
                type="button"
                disabled={isDisabled}
                aria-disabled={!provider.configured || undefined}
                onClick={() => handleOAuthSignIn(provider.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md border border-steel-200 bg-surface-white hover:bg-steel-50 hover:border-stillage-blue text-brand-navy font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stillage-blue focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:bg-surface-white disabled:hover:border-steel-200"
              >
                <span className="flex items-center gap-3">
                  {provider.icon}
                  <span className="font-semibold">
                    {isLoading ? 'Redirecting…' : provider.label}
                  </span>
                </span>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stillage-blue shrink-0" />
                ) : !provider.configured ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-steel-100 text-steel-600">
                    Setup Needed
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {hasUnconfiguredProvider && (
          <p className="bg-steel-50 border border-steel-200 rounded-md px-3.5 py-2.5 text-xs text-steel-600 leading-relaxed">
            Any disabled social provider above activates automatically once its Auth.js client credentials are added to your environment variables.
          </p>
        )}

        {/* Non-Production Local Dev Quick Sign-In */}
        {providers.devAuthEnabled && (
          <div className="pt-4 border-t border-steel-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-navy">
                <Wrench className="w-3.5 h-3.5 text-accent-amber" />
                <span>Local Dev Quick Sign-In</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                Dev Only
              </span>
            </div>

            <div className="space-y-2">
              {DEV_ACCOUNTS.map((account) => {
                const isLoading = pendingKey === account.email;
                const isDisabled = pendingKey !== null;
                return (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDevSignIn(account.email, account.defaultTarget)}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md border border-steel-200 bg-steel-50 hover:bg-steel-100 hover:border-stillage-blue text-left text-xs font-medium text-brand-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stillage-blue disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">{account.label}</span>
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-stillage-blue shrink-0" />
                    ) : (
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          account.roleLabel === 'ADMIN'
                            ? 'bg-accent-teal text-white'
                            : 'bg-steel-200 text-brand-navy'
                        }`}
                      >
                        {account.roleLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-steel-200 flex items-center justify-between text-xs text-steel-600">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-medium text-stillage-blue hover:text-stillage-blueDark hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>
          <span className="font-mono text-[11px] text-steel-400">Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
