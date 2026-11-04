import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CheckoutClient } from '@/components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout & B2B VAT Proforma | Stillage Storage Solutions UK',
  description:
    'Complete your engineered steel stillage order online via Stripe Checkout or generate an official UK B2B VAT Proforma Invoice with HGV pallet freight.',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-mono text-sm text-steel-600">
          Loading Stillage Checkout &amp; Freight Calculator...
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
