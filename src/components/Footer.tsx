'use client';

import React from 'react';
import Link from 'next/link';
import { FEATURES } from '@/lib/features';
import { useSiteContent } from '@/context/SiteContentContext';
import { BrandIcon } from '@/components/BrandIcon';

export function Footer() {
  const { navigation, microtexts } = useSiteContent();
  const footerCopy = microtexts.footer;

  const productLinks = (navigation['footer-products']?.items || []).filter(
    (item) => !item.requiresBlogFeature || FEATURES.enableBlogGuides
  );
  const engineeringLinks = (navigation['footer-engineering']?.items || []).filter(
    (item) => !item.requiresBlogFeature || FEATURES.enableBlogGuides
  );

  return (
    <footer className="bg-brand-navy text-surface-white border-t border-steel-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BrandIcon size={36} className="w-9 h-9 shrink-0" />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tight text-surface-white leading-none uppercase">
                {footerCopy.brandWordmarkPrimary}
              </span>
              <span className="font-display font-bold text-[11px] tracking-[0.08em] text-stillage-sky uppercase mt-0.5">
                {footerCopy.brandWordmarkSecondary}
              </span>
            </div>
          </div>
          <p className="text-xs text-steel-200 leading-relaxed">
            {footerCopy.brandTagline}
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            {footerCopy.productsHeading}
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            {productLinks.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            {FEATURES.enableBlogGuides
              ? footerCopy.engineeringHeadingWithBlog
              : footerCopy.engineeringHeadingDefault}
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            {engineeringLinks.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            {footerCopy.contactHeading}
          </h4>
          <div className="text-xs text-steel-200 space-y-1.5">
            <div className="font-display font-bold text-base text-surface-white">
              {footerCopy.phoneDisplay}
            </div>
            <div>{footerCopy.emailDisplay}</div>
            <div className="text-steel-400">{footerCopy.openingHours}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-steel-400 flex flex-wrap items-center justify-center gap-4">
        <span>
          &copy; {new Date().getFullYear()} {footerCopy.copyrightSuffix}
        </span>
      </div>
    </footer>
  );
}
