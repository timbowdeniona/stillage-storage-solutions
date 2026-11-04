'use client';

import React, { Suspense, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatGBP, useVat } from '@/context/VatContext';

interface SessionDetailsResponse {
  id: string;
  status: string;
  paymentStatus: string;
  amountSubtotalPence: number;
  amountTotalPence: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingDetails?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  metadata?: Record<string, string>;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    amountTotalPence: number;
    amountSubtotalPence: number;
  }>;
  paymentIntentId: string | null;
  livemode: boolean;
  error?: string;
}

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearBasket } = useVat();
  const tableCaptionId = useId();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionDetailsResponse | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No Stripe Checkout Session ID was provided in the return URL.');
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data: SessionDetailsResponse) => {
        if (!active) return;
        if (data.error) {
          setError(data.error);
        } else {
          setSession(data);
          if (data.status === 'complete' || data.paymentStatus === 'paid') {
            clearBasket();
          }
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to verify Checkout Session');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, clearBasket]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-stillage-blue animate-spin mx-auto" />
        <h1 className="font-display font-bold text-2xl uppercase text-brand-navy">
          Verifying Stripe Payment &amp; Generating VAT Receipt...
        </h1>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-2 border-red-700 bg-red-50 p-8 rounded-sm space-y-4">
          <div className="flex items-center gap-3 text-red-900">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h1 className="font-display font-bold text-2xl uppercase">
              Checkout Session Verification Issue
            </h1>
          </div>
          <p className="text-sm text-red-950">{error || 'Session not found.'}</p>
          <div className="pt-2">
            <Link
              href="/checkout"
              className="bg-brand-navy text-surface-sand font-display font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-sm inline-flex items-center gap-2"
            >
              <span>Return to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderReference = session.metadata?.orderReference || session.id;
  const deliveryZone = session.metadata?.deliveryZone || 'UK HGV Pallet Network';
  const postcode =
    session.shippingDetails?.address?.postal_code || session.metadata?.postcode || 'UK Mainland';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-2 border-brand-navy bg-surface-white shadow-md overflow-hidden">
        {/* Top Confirmation Banner */}
        <div className="bg-brand-navy text-surface-white p-6 sm:p-8 border-b border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-surface-sand">
                STRIPE SANDBOX PAYMENT {session.paymentStatus.toUpperCase()}
              </div>
              <h1 className="font-display font-bold text-3xl uppercase tracking-wide mt-0.5">
                Order Confirmed: {orderReference}
              </h1>
              <p className="text-xs text-steel-200 mt-1">
                Logged with our Wrexham steel fabrication &amp; HGV pallet dispatch desk.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-surface-sand hover:bg-white text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-stillage-blue" />
            <span>Print Official VAT Receipt</span>
          </button>
        </div>

        {/* Customer & Dispatch Metadata */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-sandLight border border-steel-200 p-4 font-mono text-xs">
            <div>
              <span className="text-steel-600 block text-[11px] uppercase">Customer / Account</span>
              <strong className="text-brand-navy">
                {session.customerName || session.metadata?.companyName || 'UK Trade Buyer'}
              </strong>
              {session.customerEmail && <div className="text-steel-800">{session.customerEmail}</div>}
            </div>

            <div>
              <span className="text-steel-600 block text-[11px] uppercase">
                HGV Pallet Dispatch Zone
              </span>
              <strong className="text-brand-navy">{postcode}</strong>
              <div className="text-steel-800">{deliveryZone}</div>
            </div>

            <div>
              <span className="text-steel-600 block text-[11px] uppercase">Stripe Reference</span>
              <strong className="text-stillage-blue">
                {session.paymentIntentId || session.id.slice(0, 24)}
              </strong>
              <div className="text-emerald-700 font-bold uppercase">
                Status: {session.paymentStatus}
              </div>
            </div>
          </div>

          {/* Line Items Receipt Table */}
          {session.lineItems && session.lineItems.length > 0 && (
            <div
              tabIndex={0}
              role="region"
              aria-labelledby={tableCaptionId}
              className="table-wrapper"
            >
              <table
                className="responsive-data-table text-xs font-mono"
                style={
                  {
                    '--label-1': '"Item / Specification"',
                    '--label-2': '"Qty"',
                    '--label-3': '"Total (GBP)"',
                  } as React.CSSProperties
                }
              >
                <caption id={tableCaptionId} className="sr-only">
                  Confirmed line items for order {orderReference}
                </caption>
                <thead>
                  <tr>
                    <th className="p-3 text-left">Specification / Line Item</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-200">
                  {session.lineItems.map((li) => (
                    <tr key={li.id}>
                      <th className="p-3">{li.description}</th>
                      <td className="p-3 text-right">{li.quantity}</td>
                      <td className="p-3 text-right font-bold text-brand-navy">
                        {formatGBP(li.amountTotalPence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t-2 border-brand-navy pt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-steel-600 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-stillage-blue" />
                <span>VAT Reg: GB 419 8820 14</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-accent-amber" />
                <span>HGV Dispatch Advice Sent Prior to Delivery</span>
              </span>
            </div>

            <div className="font-mono text-right">
              <span className="text-xs text-steel-600 block">Total Paid (Inc. 20% UK VAT)</span>
              <span className="text-2xl font-bold text-stillage-blue">
                {formatGBP(session.amountTotalPence)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-steel-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/products"
              className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>Browse More Stillages &amp; Racks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono text-sm text-steel-600">
          Verifying Stripe Checkout Session...
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
