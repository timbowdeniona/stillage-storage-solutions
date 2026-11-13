import React, { Suspense } from 'react';
import type { Metadata } from 'next';
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
    <div className="bg-steel-50 min-h-screen">
      {/* Option 1 Clean Page Header Banner */}
      <div className="bg-brand-navy text-surface-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-surface-white">
            All Steel Stillages, Racks &amp; Post Pallets
          </h1>
          <p className="font-display text-lg sm:text-xl text-steel-100 mt-2">
            {products.length} precision-engineered standard models in stock for rapid UK dispatch.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 font-display text-base text-steel-600">
            Loading stillage catalog...
          </div>
        }
      >
        <ProductListingClient initialProducts={products} categories={categories} />
      </Suspense>
    </div>
  );
}
