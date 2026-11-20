'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { isValidGaMeasurementId, isValidGtmId, trackB2BEvent } from '@/lib/analytics';

const RAW_GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();
const GA_MEASUREMENT_ID = isValidGaMeasurementId(RAW_GA_MEASUREMENT_ID)
  ? RAW_GA_MEASUREMENT_ID
  : '';
const RAW_GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || '').trim();
const GTM_ID = isValidGtmId(RAW_GTM_ID) ? RAW_GTM_ID : '';
const PLAUSIBLE_DOMAIN = (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '').trim();

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname === '/api' ||
      pathname.startsWith('/api/')
    ) {
      return;
    }
    if (lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;
    trackB2BEvent({
      event: 'page_view',
      path: pathname,
    });
  }, [pathname]);

  return (
    <>
      {GTM_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtm-gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              ${
                GA_MEASUREMENT_ID
                  ? `gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, currency: 'GBP', send_page_view: false });`
                  : ''
              }
            `}
          </Script>
        </>
      )}

      {!GTM_ID && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                anonymize_ip: true,
                currency: 'GBP',
                send_page_view: false
              });
            `}
          </Script>
        </>
      )}

      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
