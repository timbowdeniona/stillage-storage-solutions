'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  FileText,
  Trash2,
  Plus,
  Minus,
  Copy,
  Check,
  ExternalLink,
  Download,
  Printer,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';
import { formatGBP, useVat } from '@/context/VatContext';
import { calculateBasketSummary } from '@/lib/pricing';
import { SEED_PRODUCTS } from '@/data/seedCatalog';

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => {
      initEmbeddedCheckout?: (options: {
        clientSecret: string;
      }) => Promise<{ mount: (el: HTMLElement | string) => void; destroy: () => void }>;
      createEmbeddedCheckoutPage?: (options: {
        clientSecret: string;
      }) => Promise<{ mount: (el: HTMLElement | string) => void; destroy: () => void }>;
    };
  }
}

interface InvoiceResultState {
  orderReference: string;
  invoiceId?: string;
  invoiceNumber: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
  dueDate?: number | null;
  message: string;
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const initialModeParam = searchParams.get('mode');

  const {
    basket,
    addToBasket,
    updateBasketItemQuantity,
    removeFromBasket,
    clearBasket,
    deliveryPostcode,
    setDeliveryPostcode,
    requiresTailLift,
    setRequiresTailLift,
    showIncVat,
  } = useVat();

  const [paymentMode, setPaymentMode] = useState<'card' | 'b2b_proforma'>(
    initialModeParam === 'b2b_proforma' ? 'b2b_proforma' : 'card'
  );

  // Trade buyer form fields
  const [companyName, setCompanyName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Stripe Embedded Checkout state
  const [stripeScriptLoaded, setStripeScriptLoaded] = useState<boolean>(false);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string>('');
  const [activeOrderReference, setActiveOrderReference] = useState<string | null>(null);
  const [copiedTestCard, setCopiedTestCard] = useState<boolean>(false);

  // B2B Proforma Invoice state
  const [invoiceSubmitting, setInvoiceSubmitting] = useState<boolean>(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResultState | null>(null);

  const embeddedMountRef = useRef<HTMLDivElement | null>(null);
  const embeddedInstanceRef = useRef<{ destroy: () => void } | null>(null);

  const formIdPrefix = useId();
  const basketTableCaptionId = `${formIdPrefix}-basket-caption`;
  const proformaTableCaptionId = `${formIdPrefix}-proforma-caption`;

  // Sync mode if URL parameter changes
  useEffect(() => {
    if (initialModeParam === 'b2b_proforma') {
      setPaymentMode('b2b_proforma');
    } else if (initialModeParam === 'card') {
      setPaymentMode('card');
    }
  }, [initialModeParam]);

  // Pre-fill saved company name if set from ProductConfigurator
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.Stripe) {
        setStripeScriptLoaded(true);
      }
      try {
        const savedCompany = window.localStorage.getItem('sss_checkout_company');
        if (savedCompany && !companyName) {
          setCompanyName(savedCompany);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  // Deterministic live summary of basket items + UK postcode HGV pallet freight + 20% VAT
  const summary = useMemo(() => {
    return calculateBasketSummary(
      basket.map((item) => ({
        sku: item.sku,
        title: item.title,
        slug: item.slug,
        basePriceExVatPence: item.basePriceExVatPence || item.unitPriceExVatPence,
        quantity: item.quantity,
        finishOption: item.finishOption || 'standard-blue',
        finishName: item.finishName,
        mobilityOption: item.mobilityOption || 'standard-feet',
        mobilityName: item.mobilityName,
        primaryImage: item.primaryImage,
      })),
      deliveryPostcode,
      requiresTailLift
    );
  }, [basket, deliveryPostcode, requiresTailLift]);

  // Signature of the basket & freight items to know when to refresh the Stripe Embedded Session
  const basketSignature = useMemo(() => {
    if (summary.items.length === 0) return '';
    return JSON.stringify({
      items: summary.items.map((i) => ({
        sku: i.sku,
        qty: i.quantity,
        finish: i.finishOption,
        mobility: i.mobilityOption,
      })),
      postcode: summary.postcode,
      tailLift: summary.requiresTailLift,
    });
  }, [summary]);

  const initializeStripeEmbeddedSession = useCallback(async () => {
    if (summary.items.length === 0) return;
    setSessionLoading(true);
    setSessionError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: summary.items.map((i) => ({
            sku: i.sku,
            title: i.title,
            slug: i.slug,
            basePriceExVatPence: i.basePriceExVatPence,
            quantity: i.quantity,
            finishOption: i.finishOption,
            finishName: i.finishName,
            mobilityOption: i.mobilityOption,
            mobilityName: i.mobilityName,
          })),
          postcode: summary.postcode,
          requiresTailLift: summary.requiresTailLift,
          paymentMode: 'card',
          companyName: companyName.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          purchaseOrderNumber: purchaseOrderNumber.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to initialize Stripe Embedded Checkout Session');
      }

      if (data.publishableKey) {
        setPublishableKey(data.publishableKey);
      }
      setClientSecret(data.clientSecret || null);
      setActiveOrderReference(data.orderReference || null);
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'Unable to start Stripe Embedded Checkout'
      );
    } finally {
      setSessionLoading(false);
    }
  }, [
    summary,
    companyName,
    customerEmail,
    purchaseOrderNumber,
  ]);

  // Automatically create/refresh Embedded Checkout Session when in card mode and basket/freight changes
  useEffect(() => {
    if (paymentMode !== 'card' || !basketSignature) {
      return;
    }
    const timer = setTimeout(() => {
      initializeStripeEmbeddedSession();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMode, basketSignature]);

  // Mount Stripe Embedded Checkout when clientSecret + Stripe.js are ready
  useEffect(() => {
    if (
      paymentMode !== 'card' ||
      !stripeScriptLoaded ||
      !clientSecret ||
      !publishableKey ||
      !embeddedMountRef.current ||
      typeof window === 'undefined' ||
      !window.Stripe
    ) {
      return;
    }

    let cancelled = false;

    const mountEmbedded = async () => {
      try {
        if (embeddedInstanceRef.current) {
          embeddedInstanceRef.current.destroy();
          embeddedInstanceRef.current = null;
        }
        if (embeddedMountRef.current) {
          embeddedMountRef.current.innerHTML = '';
        }

        const stripe = window.Stripe!(publishableKey);
        const initFn =
          typeof stripe.initEmbeddedCheckout === 'function'
            ? stripe.initEmbeddedCheckout.bind(stripe)
            : stripe.createEmbeddedCheckoutPage?.bind(stripe);

        if (!initFn) {
          throw new Error('Stripe Embedded Checkout SDK method is unavailable.');
        }

        const checkoutInstance = await initFn({ clientSecret });
        if (cancelled) {
          checkoutInstance.destroy();
          return;
        }

        if (embeddedMountRef.current) {
          checkoutInstance.mount(embeddedMountRef.current);
          embeddedInstanceRef.current = checkoutInstance;
        }
      } catch (err) {
        if (!cancelled) {
          setSessionError(
            err instanceof Error ? err.message : 'Failed to mount Stripe Embedded Checkout'
          );
        }
      }
    };

    mountEmbedded();

    return () => {
      cancelled = true;
      if (embeddedInstanceRef.current) {
        try {
          embeddedInstanceRef.current.destroy();
        } catch {
          // Ignore unmount errors
        }
        embeddedInstanceRef.current = null;
      }
    };
  }, [paymentMode, stripeScriptLoaded, clientSecret, publishableKey]);

  const validateEmailOnBlur = (value: string) => {
    const trimmed = value.trim();
    if (paymentMode === 'b2b_proforma' && (!trimmed || !trimmed.includes('@'))) {
      setEmailError('Please enter a valid accounts or dispatch email address for your VAT invoice.');
      return false;
    }
    if (trimmed && !trimmed.includes('@')) {
      setEmailError('Please enter a valid email address containing @.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleGenerateB2BInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailOnBlur(customerEmail)) {
      return;
    }

    setInvoiceSubmitting(true);
    setInvoiceError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: summary.items.map((i) => ({
            sku: i.sku,
            title: i.title,
            slug: i.slug,
            basePriceExVatPence: i.basePriceExVatPence,
            quantity: i.quantity,
            finishOption: i.finishOption,
            finishName: i.finishName,
            mobilityOption: i.mobilityOption,
            mobilityName: i.mobilityName,
          })),
          postcode: summary.postcode,
          requiresTailLift: summary.requiresTailLift,
          paymentMode: 'b2b_proforma',
          companyName: companyName.trim() || 'UK Trade Account',
          customerEmail: customerEmail.trim(),
          purchaseOrderNumber: purchaseOrderNumber.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Could not generate Stripe B2B Proforma Invoice');
      }

      setInvoiceResult({
        orderReference: data.orderReference,
        invoiceId: data.invoiceId,
        invoiceNumber: data.invoiceNumber || data.orderReference,
        hostedInvoiceUrl: data.hostedInvoiceUrl,
        invoicePdfUrl: data.invoicePdfUrl,
        dueDate: data.dueDate,
        message: data.message,
      });
    } catch (err) {
      setInvoiceError(
        err instanceof Error ? err.message : 'Error generating B2B Proforma Invoice'
      );
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const handleCopyTestCard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('4242424242424242');
      setCopiedTestCard(true);
      setTimeout(() => setCopiedTestCard(false), 2000);
    }
  };

  const handleLoadSampleOrder = () => {
    const sample = SEED_PRODUCTS[0];
    if (!sample) return;
    addToBasket({
      sku: sample.sku,
      title: sample.title,
      slug: sample.slug,
      quantity: 4,
      basePriceExVatPence: sample.basePriceExVatPence,
      finishOption: 'standard-blue',
      finishName: 'RAL 5010 Stillage Blue (Powder Coated)',
      mobilityOption: 'forklift-pockets',
      mobilityName: 'Enclosed 4-Way Forklift Guide Pockets',
      primaryImage: sample.primaryImage,
      unitPriceExVatPence: sample.basePriceExVatPence + 3000,
      lineTotalExVatPence: (sample.basePriceExVatPence + 3000) * 4,
    });
  };

  if (summary.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="border-2 border-brand-navy bg-surface-white p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-14 h-14 mx-auto rounded-sm bg-surface-sand flex items-center justify-center border border-steel-200">
            <ShoppingBag className="w-7 h-7 text-stillage-blue" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
              STILLAGE DISPATCH &amp; STRIPE CHECKOUT
            </span>
            <h1 className="font-display font-bold text-3xl uppercase text-brand-navy">
              Your Stillage Order Basket Is Empty
            </h1>
            <p className="text-sm text-steel-600 max-w-xl mx-auto">
              Configure your required steel stillages, RAL surface finish, castor/forklift options,
              and bulk quantity tiers in our catalog, or load a sample trade batch below to test the
              Stripe Sandbox Checkout immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-sm px-6 py-3.5 rounded-sm inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Stillages &amp; Configure</span>
            </Link>

            <button
              type="button"
              onClick={handleLoadSampleOrder}
              className="bg-brand-navy hover:bg-brand-navyLight text-surface-sand font-display font-bold uppercase tracking-wider text-sm px-6 py-3.5 rounded-sm inline-flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <span>Load Sample Trade Order (4× Stillages)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Script
        src="https://js.stripe.com/v3/"
        strategy="afterInteractive"
        onLoad={() => setStripeScriptLoaded(true)}
      />

      {/* Top Breadcrumb & Security Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-steel-200 pb-5">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-stillage-blue hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Specifying Stillages</span>
          </Link>
          <h1 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-wide text-brand-navy">
            Order Specification &amp; Stripe Checkout
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-accent-amber text-brand-navy px-3 py-1.5 rounded-sm font-bold">
            <Lock className="w-3.5 h-3.5 text-accent-amber" />
            <span>STRIPE SANDBOX MODE ACTIVE</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface-sandLight border border-steel-200 text-steel-800 px-3 py-1.5 rounded-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-stillage-blue" />
            <span>ISO 9001 UK Factory Dispatch</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configured Basket Table, UK Freight & Trade Buyer Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Configured Stillage Line Items Table */}
          <section className="border border-steel-200 bg-surface-white shadow-sm">
            <div className="bg-brand-navy text-surface-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-surface-sand" />
                <h2 className="font-display font-bold uppercase tracking-wider text-base">
                  1. Configured Stillage Specification ({summary.totalUnits} Unit
                  {summary.totalUnits > 1 ? 's' : ''})
                </h2>
              </div>
              <button
                type="button"
                onClick={clearBasket}
                className="font-mono text-[11px] text-steel-200 hover:text-surface-sand underline"
              >
                Clear Basket
              </button>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-labelledby={basketTableCaptionId}
              className="table-wrapper border-0"
            >
              <table
                className="responsive-data-table text-xs font-mono"
                style={
                  {
                    '--label-1': '"Configured Stillage"',
                    '--label-2': '"Quantity & Bulk Tier"',
                    '--label-3': '"Unit Price (Ex. VAT)"',
                    '--label-4': '"Line Subtotal"',
                  } as React.CSSProperties
                }
              >
                <caption id={basketTableCaptionId} className="sr-only">
                  Configured steel stillages in your active order basket
                </caption>
                <thead>
                  <tr>
                    <th className="p-3.5 text-left">Configured Stillage</th>
                    <th className="p-3.5 text-left">Quantity &amp; Tier</th>
                    <th className="p-3.5 text-right">Unit (Ex. VAT)</th>
                    <th className="p-3.5 text-right">Subtotal (Ex. VAT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-200">
                  {summary.items.map((item, idx) => (
                    <tr key={`${item.sku}-${item.finishOption}-${item.mobilityOption}`}>
                      <th className="p-3.5 align-top">
                        <div className="flex items-start gap-3">
                          {item.primaryImage && (
                            <img
                              src={item.primaryImage}
                              alt={item.title}
                              width={56}
                              height={48}
                              loading="lazy"
                              className="w-14 h-12 object-contain bg-surface-sand p-1 border border-steel-200 rounded-sm shrink-0"
                            />
                          )}
                          <div className="space-y-1 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold bg-brand-navy text-surface-sand px-1.5 py-0.5 rounded-sm">
                                {item.sku}
                              </span>
                              <Link
                                href={`/products/${item.slug}`}
                                className="font-bold text-steel-900 hover:text-stillage-blue text-xs"
                              >
                                {item.title}
                              </Link>
                            </div>
                            <div className="text-[11px] text-steel-600">
                              Finish: <strong className="text-steel-900">{item.finishName}</strong>
                            </div>
                            <div className="text-[11px] text-steel-600">
                              Base: <strong className="text-steel-900">{item.mobilityName}</strong>
                            </div>
                          </div>
                        </div>
                      </th>

                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateBasketItemQuantity(idx, Math.max(1, item.quantity - 1))
                            }
                            aria-label={`Decrease quantity for ${item.title}`}
                            className="w-7 h-7 border border-steel-200 bg-white hover:bg-steel-100 flex items-center justify-center rounded-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-9 text-center font-bold text-steel-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateBasketItemQuantity(idx, item.quantity + 1)}
                            aria-label={`Increase quantity for ${item.title}`}
                            className="w-7 h-7 border border-steel-200 bg-white hover:bg-steel-100 flex items-center justify-center rounded-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromBasket(idx)}
                            aria-label={`Remove ${item.title} from basket`}
                            className="ml-2 p-1.5 text-steel-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.discountPercentage > 0 ? (
                          <div className="mt-1.5 inline-block bg-emerald-50 border border-emerald-600 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            {item.discountPercentage}% Bulk Discount Active
                          </div>
                        ) : (
                          <div className="mt-1 text-[10px] text-steel-600">
                            Order 5+ for 5% off, 10+ for 10% off
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 align-top text-right font-bold text-steel-900">
                        {formatGBP(item.discountedUnitExVatPence)}
                      </td>

                      <td className="p-3.5 align-top text-right">
                        <div className="font-bold text-brand-navy">
                          {formatGBP(item.lineSubtotalExVatPence)}
                        </div>
                        {item.bulkSavingsExVatPence > 0 && (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            Saved {formatGBP(item.bulkSavingsExVatPence)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. UK Postcode HGV Pallet Delivery & Offloading Method */}
          <section className="border border-steel-200 bg-surface-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-steel-200 pb-3">
              <Truck className="w-4 h-4 text-stillage-blue" />
              <h2 className="font-display font-bold uppercase tracking-wider text-base text-brand-navy">
                2. UK HGV Pallet Network Freight &amp; Site Offloading
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${formIdPrefix}-postcode`}
                  className="block font-mono text-xs font-bold text-steel-900 mb-1.5"
                >
                  UK Delivery Postcode
                </label>
                <input
                  id={`${formIdPrefix}-postcode`}
                  type="text"
                  name="postal-code"
                  autoComplete="postal-code"
                  autoCorrect="off"
                  spellCheck={false}
                  value={deliveryPostcode}
                  onChange={(e) => setDeliveryPostcode(e.target.value)}
                  placeholder="e.g. B1 1AA, LL13, M1, IV1"
                  className="w-full px-3.5 py-2.5 border border-steel-200 rounded-sm font-mono text-sm uppercase focus:outline-none focus:border-stillage-blue"
                />
                <p className="mt-1 text-[11px] font-mono text-steel-600">
                  Detected Zone: <strong className="text-brand-navy">{summary.deliveryZone}</strong>
                </p>
              </div>

              <fieldset>
                <legend className="block font-mono text-xs font-bold text-steel-900 mb-1.5">
                  Site Offloading Facility ({summary.palletCount} HGV Pallet
                  {summary.palletCount > 1 ? 's' : ''})
                </legend>
                <div className="space-y-2 font-mono text-xs">
                  <label
                    className={`flex items-center justify-between p-2.5 border rounded-sm cursor-pointer transition-colors ${
                      !requiresTailLift
                        ? 'border-stillage-blue bg-surface-sand/40 font-bold text-brand-navy'
                        : 'border-steel-200 bg-white text-steel-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="offloading-facility"
                        checked={!requiresTailLift}
                        onChange={() => setRequiresTailLift(false)}
                        className="accent-stillage-blue"
                      />
                      <span>Forklift On-Site</span>
                    </span>
                    <span className="text-emerald-700">£0.00</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-2.5 border rounded-sm cursor-pointer transition-colors ${
                      requiresTailLift
                        ? 'border-accent-amber bg-amber-50 font-bold text-brand-navy'
                        : 'border-steel-200 bg-white text-steel-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="offloading-facility"
                        checked={requiresTailLift}
                        onChange={() => setRequiresTailLift(true)}
                        className="accent-stillage-blue"
                      />
                      <span>Tail-Lift Offloading + Pump Truck</span>
                    </span>
                    <span className="text-accent-amber">+£15.00</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </section>

          {/* 3. Trade Buyer & Purchase Order Reference */}
          <section className="border border-steel-200 bg-surface-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-steel-200 pb-3">
              <h2 className="font-display font-bold uppercase tracking-wider text-base text-brand-navy">
                3. Trade Buyer &amp; VAT Invoice Details
              </h2>
              <span className="font-mono text-[11px] text-steel-600">
                Included on Stripe Receipt &amp; VAT Invoice
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor={`${formIdPrefix}-company`}
                  className="block font-mono text-xs font-bold text-steel-900 mb-1.5"
                >
                  Company / Business Name
                </label>
                <input
                  id={`${formIdPrefix}-company`}
                  type="text"
                  name="organization"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Severn Valley Fabrications Ltd"
                  className="w-full px-3 py-2.5 border border-steel-200 rounded-sm text-xs focus:outline-none focus:border-stillage-blue"
                />
              </div>

              <div>
                <label
                  htmlFor={`${formIdPrefix}-email`}
                  className="block font-mono text-xs font-bold text-steel-900 mb-1.5"
                >
                  Accounts / Dispatch Email{' '}
                  {paymentMode === 'b2b_proforma' && <span className="text-red-700">*</span>}
                </label>
                <input
                  id={`${formIdPrefix}-email`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  required={paymentMode === 'b2b_proforma'}
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={(e) => validateEmailOnBlur(e.target.value)}
                  aria-describedby={emailError ? `${formIdPrefix}-email-error` : undefined}
                  placeholder="accounts@company.co.uk"
                  className="w-full px-3 py-2.5 border border-steel-200 rounded-sm text-xs focus:outline-none focus:border-stillage-blue"
                />
                {emailError && (
                  <p
                    id={`${formIdPrefix}-email-error`}
                    role="alert"
                    className="mt-1 text-[11px] text-red-700 font-medium"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formIdPrefix}-po`}
                  className="block font-mono text-xs font-bold text-steel-900 mb-1.5"
                >
                  Purchase Order (PO) Ref
                </label>
                <input
                  id={`${formIdPrefix}-po`}
                  type="text"
                  name="purchase-order"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={purchaseOrderNumber}
                  onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                  placeholder="Optional: PO-2026-884"
                  className="w-full px-3 py-2.5 border border-steel-200 rounded-sm font-mono text-xs focus:outline-none focus:border-stillage-blue"
                />
              </div>
            </div>
          </section>

          {/* 4. Itemized Financial Breakdown */}
          <section className="border-2 border-brand-navy bg-surface-sandLight p-5 font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-steel-200 pb-2 text-[11px] text-steel-600">
              <span className="font-bold text-brand-navy uppercase">
                AUTHORITATIVE ORDER TOTALS (GBP)
              </span>
              <span>{showIncVat ? 'INC. VAT PRIORITY' : 'EX. VAT PRIORITY'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-steel-600">
                Configured Stillages Subtotal ({summary.totalUnits} unit
                {summary.totalUnits > 1 ? 's' : ''})
              </span>
              <span className="font-bold text-steel-900">
                {formatGBP(summary.goodsSubtotalExVatPence)}
              </span>
            </div>

            {summary.totalBulkSavingsExVatPence > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Active Bulk Volume Discount Savings</span>
                <span>-{formatGBP(summary.totalBulkSavingsExVatPence)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-steel-600">
                UK HGV Pallet Network Freight ({summary.palletCount} Pallet
                {summary.palletCount > 1 ? 's' : ''} — {summary.postcode})
              </span>
              <span className="font-bold text-steel-900">
                {formatGBP(summary.deliveryExVatPence)}
              </span>
            </div>

            <div className="border-t border-steel-200 pt-2 flex justify-between text-sm font-bold text-brand-navy">
              <span>Total Ex. VAT</span>
              <span>{formatGBP(summary.totalExVatPence)}</span>
            </div>

            <div className="flex justify-between text-steel-600">
              <span>UK Standard Rate VAT (20%)</span>
              <span>{formatGBP(summary.vatAmountPence)}</span>
            </div>

            <div className="border-t-2 border-brand-navy pt-2.5 flex justify-between text-lg font-bold text-stillage-blue">
              <span>Total Payable Inc. VAT</span>
              <span>{formatGBP(summary.totalIncVatPence)}</span>
            </div>
          </section>
        </div>

        {/* Right Column: Stripe Embedded Checkout / Official Stripe B2B Invoice Panel */}
        <div className="lg:col-span-5 border-2 border-brand-navy bg-surface-white shadow-lg sticky top-24">
          {/* Payment Mode Selector */}
          <div className="bg-brand-navy text-surface-white p-4 border-b border-white/15 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-surface-sand">
              <span>PAYMENT &amp; INVOICING METHOD</span>
              {activeOrderReference && <span>REF: {activeOrderReference}</span>}
            </div>

            <div
              role="radiogroup"
              aria-label="Select payment or invoicing method"
              className="grid grid-cols-2 gap-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === 'card'}
                onClick={() => setPaymentMode('card')}
                className={`p-3 rounded-sm border text-left transition-all flex flex-col justify-between ${
                  paymentMode === 'card'
                    ? 'bg-stillage-blue border-surface-sand text-white font-bold shadow-sm'
                    : 'bg-brand-navyDark border-white/15 text-steel-200 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 font-display uppercase tracking-wider text-sm">
                  <CreditCard className="w-4 h-4 text-surface-sand" />
                  <span>Instant Checkout</span>
                </span>
                <span className="font-mono text-[10px] text-surface-sand/90 mt-1">
                  Card, Apple Pay, Link
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === 'b2b_proforma'}
                onClick={() => setPaymentMode('b2b_proforma')}
                className={`p-3 rounded-sm border text-left transition-all flex flex-col justify-between ${
                  paymentMode === 'b2b_proforma'
                    ? 'bg-stillage-blue border-surface-sand text-white font-bold shadow-sm'
                    : 'bg-brand-navyDark border-white/15 text-steel-200 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 font-display uppercase tracking-wider text-sm">
                  <FileText className="w-4 h-4 text-accent-amber" />
                  <span>B2B VAT Invoice</span>
                </span>
                <span className="font-mono text-[10px] text-surface-sand/90 mt-1">
                  Stripe Hosted + PDF Proforma
                </span>
              </button>
            </div>
          </div>

          {paymentMode === 'card' ? (
            <div className="p-5 space-y-4">
              {/* Sandbox Helper Bar */}
              <div className="bg-surface-sandLight border border-steel-200 p-3 rounded-sm flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-brand-navy uppercase">
                    Stripe Sandbox Test Card
                  </div>
                  <div className="text-steel-600">
                    Card: <strong className="text-steel-900">4242 4242 4242 4242</strong> | Exp: Any
                    future | CVC: Any 3 digits
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTestCard}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-steel-200 hover:border-stillage-blue rounded-sm text-[11px] font-bold text-brand-navy transition-colors"
                >
                  {copiedTestCard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stillage-blue" />
                      <span>Copy 4242...</span>
                    </>
                  )}
                </button>
              </div>

              {sessionError && (
                <div
                  role="alert"
                  className="p-4 bg-red-50 border border-red-600 text-red-950 text-xs rounded-sm space-y-2"
                >
                  <div className="flex items-start gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <span>{sessionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={initializeStripeEmbeddedSession}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-stillage-blue underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Stripe Session</span>
                  </button>
                </div>
              )}

              {!publishableKey && clientSecret && !sessionLoading && (
                <div className="p-4 bg-amber-50 border border-accent-amber text-brand-navy text-xs rounded-sm space-y-1.5">
                  <div className="font-bold uppercase font-display text-sm">
                    Publishable Key Needed for Embedded Form
                  </div>
                  <p className="text-steel-800">
                    Ensure <code className="font-mono">PUBLIC_STRIPE_PUBLISHABLE_KEY</code> or{' '}
                    <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is set in{' '}
                    <code className="font-mono">.env.local</code>.
                  </p>
                </div>
              )}

              {sessionLoading && (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-16 text-center space-y-3 bg-surface-sandLight border border-steel-200 rounded-sm"
                >
                  <RefreshCw className="w-6 h-6 text-stillage-blue animate-spin mx-auto" />
                  <div className="font-mono text-xs text-brand-navy font-bold">
                    Preparing Stripe Sandbox Embedded Checkout ({formatGBP(summary.totalIncVatPence)}
                    )...
                  </div>
                </div>
              )}

              {/* Stripe Embedded Checkout Mount Container */}
              <div
                ref={embeddedMountRef}
                id="stripe-embedded-checkout-container"
                className="min-h-[420px]"
              />
            </div>
          ) : (
            <div className="p-5 space-y-5">
              <form onSubmit={handleGenerateB2BInvoice} method="POST" className="space-y-4">
                <div className="bg-surface-sandLight border border-steel-200 p-3.5 text-xs text-steel-800 space-y-1">
                  <div className="font-display font-bold uppercase text-sm text-brand-navy">
                    Official Stripe B2B Hosted Invoice &amp; Printable Proforma
                  </div>
                  <p>
                    Generates a real finalized <strong>Stripe Sandbox Invoice</strong> with 30-day
                    trade terms, a live online payment page (Card / UK Bank Transfer), and an
                    official downloadable VAT Invoice PDF.
                  </p>
                </div>

                {invoiceError && (
                  <div
                    role="alert"
                    className="p-3.5 bg-red-50 border border-red-600 text-red-950 text-xs rounded-sm flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <span>{invoiceError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={invoiceSubmitting}
                  className="w-full bg-brand-navy hover:bg-brand-navyLight disabled:opacity-60 text-surface-sand font-display font-bold uppercase tracking-wider text-base py-3.5 px-5 rounded-sm flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <FileText className="w-4 h-4 text-accent-amber" />
                  <span>
                    {invoiceSubmitting
                      ? 'Generating Stripe VAT Invoice...'
                      : `Generate Stripe VAT Invoice (${formatGBP(summary.totalIncVatPence)})`}
                  </span>
                </button>
              </form>

              {invoiceResult && (
                <div
                  role="status"
                  aria-live="polite"
                  className="border-2 border-emerald-700 bg-emerald-50/60 p-4 rounded-sm space-y-4"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-[11px] font-bold uppercase text-emerald-800">
                      STRIPE SANDBOX INVOICE FINALIZED
                    </div>
                    <div className="font-display font-bold text-lg uppercase text-brand-navy">
                      Invoice #{invoiceResult.invoiceNumber}
                    </div>
                    <p className="text-xs text-steel-800">{invoiceResult.message}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                    {invoiceResult.hostedInvoiceUrl && (
                      <a
                        href={invoiceResult.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs py-2.5 px-3.5 rounded-sm inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Stripe Hosted Invoice</span>
                      </a>
                    )}

                    {invoiceResult.invoicePdfUrl && (
                      <a
                        href={invoiceResult.invoicePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-brand-navy hover:bg-brand-navyLight text-surface-sand font-display font-bold uppercase tracking-wider text-xs py-2.5 px-3.5 rounded-sm inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-accent-amber" />
                        <span>Download Stripe PDF</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-white hover:bg-steel-100 text-brand-navy border border-steel-200 font-display font-bold uppercase tracking-wider text-xs py-2.5 px-3.5 rounded-sm inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-stillage-blue" />
                      <span>Print Proforma</span>
                    </button>
                  </div>

                  {/* Printable UK VAT Proforma Document Preview */}
                  <div className="bg-white border border-steel-200 p-4 font-mono text-[11px] space-y-3">
                    <div className="flex justify-between items-start border-b border-steel-200 pb-2">
                      <div>
                        <div className="font-bold text-brand-navy text-xs">
                          STILLAGE STORAGE SOLUTIONS UK LTD
                        </div>
                        <div className="text-steel-600">
                          Wrexham Industrial Estate, LL13 9UG | VAT Reg: GB 419 8820 14
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-stillage-blue">PROFORMA VAT INVOICE</div>
                        <div>Ref: {invoiceResult.invoiceNumber}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-steel-800">
                      <div>
                        <span className="text-steel-600 block">Bill To:</span>
                        <strong>{companyName || 'UK Trade Account'}</strong>
                        <div>{customerEmail}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-steel-600 block">Delivery Zone &amp; PO:</span>
                        <strong>{summary.postcode}</strong>
                        <div>PO: {purchaseOrderNumber || 'N/A'}</div>
                      </div>
                    </div>

                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby={proformaTableCaptionId}
                      className="table-wrapper"
                    >
                      <table
                        className="responsive-data-table text-[11px] font-mono"
                        style={
                          {
                            '--label-1': '"Item"',
                            '--label-2': '"Qty"',
                            '--label-3': '"Ex. VAT"',
                          } as React.CSSProperties
                        }
                      >
                        <caption id={proformaTableCaptionId} className="sr-only">
                          Proforma VAT Invoice line items for {invoiceResult.invoiceNumber}
                        </caption>
                        <thead>
                          <tr>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Total Ex. VAT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-steel-200">
                          {summary.items.map((li) => (
                            <tr key={`${li.sku}-${li.finishOption}-${li.mobilityOption}`}>
                              <th className="p-2">
                                {li.title} ({li.sku}) — {li.finishName}
                              </th>
                              <td className="p-2 text-right">{li.quantity}</td>
                              <td className="p-2 text-right">
                                {formatGBP(li.lineSubtotalExVatPence)}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <th className="p-2">
                              HGV Pallet Freight ({summary.palletCount} Pallet
                              {summary.palletCount > 1 ? 's' : ''})
                            </th>
                            <td className="p-2 text-right">1</td>
                            <td className="p-2 text-right">{formatGBP(summary.deliveryExVatPence)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-steel-200 pt-2 space-y-1 text-right">
                      <div>Subtotal Ex. VAT: {formatGBP(summary.totalExVatPence)}</div>
                      <div>UK VAT (20%): {formatGBP(summary.vatAmountPence)}</div>
                      <div className="font-bold text-brand-navy text-xs">
                        Total Due Inc. VAT: {formatGBP(summary.totalIncVatPence)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
