import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCategories, getProducts } from '@/lib/contentful';
import { ProductListingClient } from '@/components/ProductListingClient';

export const metadata: Metadata = {
  title: 'All Steel Stillages, Cantilever Racks & Post Pallets',
  description:
    'Browse and filter our UK-manufactured steel stillages, cantilever bar racks, modular hopper bins, mesh security cages, and demountable post pallets.',
};

export default async function ProductListingPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="bg-surface-white min-h-screen">
      {/* Clean Page Header Banner */}
      <div className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-steel-200 mb-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-steel-400" />
            <span className="text-stillage-sky font-bold">All Stillages &amp; Storage Racks</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
                Steel Stillages, Racks &amp; <span className="text-stillage-sky">Post Pallets</span>
              </h1>
              <p className="text-steel-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Select any model below to configure surface finish, forklift pockets, castors, and automatic bulk trade discounts.
              </p>
            </div>
            <div className="font-mono text-xs bg-brand-navyDark border border-white/15 px-4 py-2.5 rounded-sm text-white shrink-0">
              Direct UK Dispatch • 5% Off 5+ Units • 10% Off 10+ Units
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-sm text-steel-600">
            Loading stillage specifications...
          </div>
        }
      >
        <ProductListingClient initialProducts={products} categories={categories} />
      </Suspense>
    </div>
  );
}
