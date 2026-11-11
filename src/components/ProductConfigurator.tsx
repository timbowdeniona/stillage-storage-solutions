'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  ShieldCheck,
  Truck,
  Calculator,
  FileText,
  ShoppingBag,
  Layers,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Compass,
  Wrench,
} from 'lucide-react';
import { FINISH_OPTIONS, MOBILITY_OPTIONS } from '@/data/seedCatalog';
import { Product, QuoteResponse } from '@/types/catalog';
import { calculateQuote } from '@/lib/pricing';
import { trackAlgoliaEvent } from '@/lib/algolia';
import { trackB2BEvent } from '@/lib/analytics';
import { formatGBP, useVat } from '@/context/VatContext';
import { ProductTechnicalDiagram } from '@/components/ProductTechnicalDiagram';

interface ProductConfiguratorProps {
  product: Product;
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    showIncVat,
    formatBothPrices,
    addToBasket,
    deliveryPostcode,
    setDeliveryPostcode,
    requiresTailLift: ctxTailLift,
    setRequiresTailLift: setCtxTailLift,
  } = useVat();

  // Stage visual controls
  const [backdropMode, setBackdropMode] = useState<'sand' | 'white' | 'blueprint'>(
    product.backdropStyle === 'white' ? 'white' : 'sand'
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Configurator state (supports deep-linking from Algolia Recommendations & AI Spec Advisor)
  const [finishOption, setFinishOption] = useState<string>(() => {
    const param = searchParams.get('finish');
    return FINISH_OPTIONS.some((f) => f.id === param) ? (param as string) : 'standard-blue';
  });
  const [mobilityOption, setMobilityOption] = useState<string>(() => {
    const param = searchParams.get('mobility');
    return MOBILITY_OPTIONS.some((m) => m.id === param) ? (param as string) : 'standard-feet';
  });
  const [quantity, setQuantity] = useState<number>(() => {
    const param = Number(searchParams.get('qty'));
    return param >= 1 && param <= 500 ? param : 4;
  });
  const [postcode, setPostcode] = useState<string>(deliveryPostcode || 'B1 1AA');
  const [requiresTailLift, setRequiresTailLift] = useState<boolean>(ctxTailLift);

  useEffect(() => {
    const fin = searchParams.get('finish');
    if (fin && FINISH_OPTIONS.some((f) => f.id === fin)) {
      setFinishOption(fin);
    }
    const mob = searchParams.get('mobility');
    if (mob && MOBILITY_OPTIONS.some((m) => m.id === mob)) {
      setMobilityOption(mob);
    }
    const qty = Number(searchParams.get('qty'));
    if (qty >= 1 && qty <= 500) {
      setQuantity(qty);
    }
  }, [searchParams]);

  // Live quote from Rust/Next API
  const [quote, setQuote] = useState<QuoteResponse>(() =>
    calculateQuote({
      sku: product.sku,
      basePriceExVatPence: product.basePriceExVatPence,
      quantity: 4,
      finishOption: 'standard-blue',
      mobilityOption: 'standard-feet',
      postcode: 'B1 1AA',
      requiresTailLift: false,
    })
  );

  // Checkout / B2B Proforma feedback state
  const [companyName, setCompanyName] = useState('');
  const [orderStatusMessage, setOrderStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const payload = {
      sku: product.sku,
      basePriceExVatPence: product.basePriceExVatPence,
      quantity,
      finishOption,
      mobilityOption,
      postcode,
      requiresTailLift,
    };

    // Immediate deterministic calculation + async verification against API endpoint
    setQuote(calculateQuote(payload));

    const controller = new AbortController();
    fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.sku) {
          setQuote(data);
        }
      })
      .catch(() => {
        // Local parity quote already set
      });

    return () => controller.abort();
  }, [
    product.sku,
    product.basePriceExVatPence,
    quantity,
    finishOption,
    mobilityOption,
    postcode,
    requiresTailLift,
  ]);

  const selectedFinish =
    FINISH_OPTIONS.find((f) => f.id === finishOption) || FINISH_OPTIONS[0];
  const selectedMobility =
    MOBILITY_OPTIONS.find((m) => m.id === mobilityOption) || MOBILITY_OPTIONS[0];

  const syncCurrentConfigToBasket = () => {
    trackAlgoliaEvent({
      eventType: 'conversion',
      eventName: 'Configured Stillage Added to Order',
      objectIDs: [product.id],
    });
    addToBasket({
      sku: product.sku,
      title: product.title,
      slug: product.slug,
      quantity: quote.quantity,
      basePriceExVatPence: product.basePriceExVatPence,
      finishOption,
      finishName: selectedFinish.name,
      mobilityOption,
      mobilityName: selectedMobility.name,
      primaryImage: product.primaryImage,
      unitPriceExVatPence: quote.discountedUnitExVatPence,
      lineTotalExVatPence: quote.lineSubtotalExVatPence,
    });
    setDeliveryPostcode(postcode);
    setCtxTailLift(requiresTailLift);
    if (companyName.trim()) {
      try {
        window.localStorage.setItem('sss_checkout_company', companyName.trim());
      } catch {
        // Ignore storage errors
      }
    }
  };

  const handleCheckout = (paymentMode: 'card' | 'b2b_proforma') => {
    setSubmitting(true);
    setOrderStatusMessage(null);
    trackB2BEvent({
      event: 'quote_or_proforma_submitted',
      sku: product.sku,
      productTitle: product.title,
      quantity: quote.quantity,
      discountPercentage: quote.discountPercentage,
      totalExVatPence: quote.totalExVatPence,
      paymentMethod: paymentMode === 'b2b_proforma' ? 'proforma_invoice' : 'stripe_card',
    });
    syncCurrentConfigToBasket();
    router.push(`/checkout?mode=${paymentMode}`);
  };

  const handleAddToBasketOnly = () => {
    trackB2BEvent({
      event: 'quote_or_proforma_submitted',
      sku: product.sku,
      productTitle: product.title,
      quantity: quote.quantity,
      discountPercentage: quote.discountPercentage,
      totalExVatPence: quote.lineSubtotalExVatPence,
      paymentMethod: 'basket_add',
    });
    syncCurrentConfigToBasket();
    setOrderStatusMessage(
      `Added ${quote.quantity}× ${product.title} (${selectedFinish.code}, ${selectedMobility.name}) to your order basket.`
    );
  };

  const mediaItems = [
    {
      src: product.primaryImage,
      label: `${product.title} - Primary Elevation`,
      badge: 'Primary',
      type: 'primary' as const,
    },
    ...(product.technicalDrawing
      ? [
          {
            src: product.technicalDrawing,
            label: `${product.title} - Technical Blueprint Drawing`,
            badge: 'CAD Drawing',
            type: 'drawing' as const,
          },
        ]
      : []),
    ...(Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery.map((imgSrc, i) => ({
          src: imgSrc,
          label: `${product.title} - Supplemental View ${i + 1}`,
          badge: `View ${i + 1}`,
          type: 'gallery' as const,
        }))
      : product.secondaryImage
      ? [
          {
            src: product.secondaryImage,
            label: `${product.title} - Detail View`,
            badge: 'Detail',
            type: 'gallery' as const,
          },
        ]
      : []),
  ];

  const safeActiveIndex = Math.min(activeImageIndex, Math.max(0, mediaItems.length - 1));
  const currentMedia = mediaItems[safeActiveIndex] || mediaItems[0];

  const backdropClass =
    backdropMode === 'sand'
      ? 'bg-surface-sand'
      : backdropMode === 'white'
      ? 'bg-surface-white'
      : 'bg-surface-sandLight bg-blueprint-grid';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Column: Visual Stage & Responsive Engineering Spec Table */}
      <div className="lg:col-span-7 space-y-8">
        {/* Product Image Viewer with Surface Switcher */}
        <div className="border border-steel-200 bg-surface-white shadow-sm">
          <div className="px-4 py-3 border-b border-steel-200 bg-steel-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-brand-navy text-surface-sand px-2.5 py-0.5 font-bold rounded-sm">
                SKU: {product.sku}
              </span>
              <span className="text-steel-600">|</span>
              <span className="font-bold text-stillage-blue">{product.swlKg} kg SWL Rated</span>
            </div>

            {/* Backdrop Surface Toggle inspired by Uploaded Images 1 & 2 */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-steel-600 mr-1">Stage Surface:</span>
              <button
                type="button"
                aria-pressed={backdropMode === 'sand'}
                onClick={() => setBackdropMode('sand')}
                className={`px-2.5 py-1 rounded-sm border ${
                  backdropMode === 'sand'
                    ? 'bg-surface-sand border-brand-navy text-brand-navy font-bold'
                    : 'bg-white border-steel-200 text-steel-600'
                }`}
              >
                Workshop Sand
              </button>
              <button
                type="button"
                aria-pressed={backdropMode === 'white'}
                onClick={() => setBackdropMode('white')}
                className={`px-2.5 py-1 rounded-sm border ${
                  backdropMode === 'white'
                    ? 'bg-brand-navy border-brand-navy text-white font-bold'
                    : 'bg-white border-steel-200 text-steel-600'
                }`}
              >
                Studio White
              </button>
              <button
                type="button"
                aria-pressed={backdropMode === 'blueprint'}
                onClick={() => setBackdropMode('blueprint')}
                className={`px-2.5 py-1 rounded-sm border ${
                  backdropMode === 'blueprint'
                    ? 'bg-stillage-blue border-stillage-blue text-white font-bold'
                    : 'bg-white border-steel-200 text-steel-600'
                }`}
              >
                Blueprint Grid
              </button>
            </div>
          </div>

          {/* Main Image Stage (LCP candidate uses fetchpriority="high") */}
          {backdropMode === 'blueprint' ? (
            <div className="p-3 bg-brand-navyDark">
              <ProductTechnicalDiagram
                product={product}
                finishCode={selectedFinish.code}
                finishName={selectedFinish.name}
                finishSwatchHex={selectedFinish.swatchHex}
                mobilityName={selectedMobility.name}
                compact
              />
            </div>
          ) : (
            <div className={`relative h-[420px] sm:h-[480px] p-8 transition-colors duration-300 ${backdropClass}`}>
              <img
                src={currentMedia.src}
                alt={currentMedia.label}
                fetchPriority={safeActiveIndex === 0 ? 'high' : 'auto'}
                width={760}
                height={540}
                className="w-full h-full object-contain"
              />

              {/* View Type Badge in Top Left */}
              <div className="absolute top-4 left-4 bg-brand-navy/95 text-surface-sand px-2.5 py-1 rounded-sm font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-white/10">
                {currentMedia.type === 'drawing' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                    <span className="font-bold text-accent-teal">CAD Dimensional Blueprint</span>
                  </>
                ) : currentMedia.type === 'primary' ? (
                  <span>Primary Product Elevation</span>
                ) : (
                  <span>{currentMedia.badge} (Supplemental Image)</span>
                )}
              </div>

              {/* Dimension Overlay Pill */}
              <div className="absolute bottom-4 left-4 bg-brand-navy/95 text-surface-white px-3.5 py-2 rounded-sm font-mono text-xs border border-white/15">
                External: {product.externalLengthMm}(L) × {product.externalWidthMm}(W) ×{' '}
                {product.externalHeightMm}(H) mm
              </div>

              <div className="absolute bottom-4 right-4 bg-white/95 text-steel-900 px-3 py-1.5 rounded-sm font-mono text-xs border border-steel-200 shadow-sm flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: selectedFinish.swatchHex }}
                />
                <span>{selectedFinish.code}</span>
              </div>
            </div>
          )}

          {/* Thumbnail Switcher (Handles Primary, Technical Drawing, and up to 5 Gallery Images) */}
          <div className="p-4 border-t border-steel-200 bg-surface-sandLight flex flex-wrap items-center gap-3">
            {mediaItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIndex(idx);
                  if (backdropMode === 'blueprint' && item.type !== 'drawing') {
                    setBackdropMode(product.backdropStyle === 'white' ? 'white' : 'sand');
                  }
                }}
                className={`relative w-24 h-22 p-1.5 rounded-sm border-2 transition-all flex flex-col justify-between ${
                  backdropMode !== 'blueprint' && safeActiveIndex === idx
                    ? 'border-stillage-blue bg-surface-sand shadow-sm ring-1 ring-stillage-blue'
                    : 'border-steel-200 bg-white opacity-80 hover:opacity-100 hover:border-steel-400'
                }`}
              >
                <div className="w-full h-12 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.src}
                    alt={item.label}
                    fetchPriority="low"
                    loading="lazy"
                    width={96}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1 py-0.5 rounded-xs text-center truncate w-full ${
                    item.type === 'drawing'
                      ? 'bg-brand-navy text-accent-teal font-bold'
                      : item.type === 'primary'
                      ? 'bg-stillage-blue text-white font-bold'
                      : 'bg-steel-200 text-steel-800 font-medium'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            ))}
            <button
              type="button"
              aria-pressed={backdropMode === 'blueprint'}
              onClick={() => setBackdropMode('blueprint')}
              className={`h-22 px-3.5 rounded-sm border-2 transition-all flex flex-col items-center justify-center gap-1 font-mono text-[11px] ${
                backdropMode === 'blueprint'
                  ? 'border-stillage-blue bg-brand-navy text-surface-sand font-bold'
                  : 'border-steel-200 bg-brand-navy/90 text-surface-white hover:border-stillage-blue'
              }`}
            >
              <Compass className="w-5 h-5 text-accent-teal" aria-hidden="true" />
              <span>Interactive CAD</span>
              <span className="text-[9px] text-surface-sand">
                {product.externalLengthMm}×{product.externalWidthMm}mm
              </span>
            </button>
            <div className="ml-auto text-xs text-steel-600 hidden sm:block">
              <strong className="text-steel-900">British Steel Construction:</strong>{' '}
              {product.steelSpecification}
            </div>
          </div>
        </div>

        {/* Dynamic Technical CAD Blueprint Diagram (Generated from Primary Image & Dimensions) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-navy">
                Technical Dimensional Diagram &amp; Orthographic Footprint
              </h2>
              <span className="font-mono text-xs text-steel-600 block mt-0.5">
                Live Synced with Configurator ({selectedFinish.code})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/workshop?sku=${product.sku}`}
                className="px-3 py-1.5 rounded-sm bg-accent-teal hover:bg-teal-600 text-brand-navy font-mono text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Open in Workshop Stack Builder</span>
              </Link>
            </div>
          </div>
          <ProductTechnicalDiagram
            product={product}
            finishCode={selectedFinish.code}
            finishName={selectedFinish.name}
            finishSwatchHex={selectedFinish.swatchHex}
            mobilityName={selectedMobility.name}
          />
        </div>

        {/* Engineering Highlights & Description */}
        <div className="border border-steel-200 bg-surface-white p-6 space-y-4">
          <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-navy">
            Engineering Overview &amp; Construction
          </h2>
          <p className="text-sm text-steel-800 leading-relaxed">{product.fullDescription}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {product.highlights.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-steel-900 bg-surface-sandLight p-3 border border-steel-200"
              >
                <ShieldCheck className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modern Web Guidance: Responsive Specification Data Table */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-navy">
            Full Technical Specification Matrix
          </h2>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="stillage-spec-table-caption"
            className="table-wrapper"
          >
            <table className="responsive-data-table text-xs font-mono">
              <caption id="stillage-spec-table-caption" className="sr-only">
                Technical engineering specifications for {product.title} ({product.sku})
              </caption>
              <thead>
                <tr>
                  <th className="p-3 text-left">Parameter</th>
                  <th className="p-3 text-left">Specification</th>
                  <th className="p-3 text-left">Standard / Tolerance</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200">
                <tr>
                  <th className="p-3">Manufacturer SKU</th>
                  <td className="p-3 font-bold text-brand-navy">{product.sku}</td>
                  <td className="p-3 text-steel-600">ISO 9001 Traceable Batch</td>
                  <td className="p-3 text-emerald-700 font-bold">Verified</td>
                </tr>
                <tr>
                  <th className="p-3">Safe Working Load (SWL)</th>
                  <td className="p-3 font-bold text-stillage-blue">{product.swlKg} kg UDL</td>
                  <td className="p-3 text-steel-600">LOLER / UKCA Load Tested</td>
                  <td className="p-3 text-emerald-700 font-bold">Certified</td>
                </tr>
                <tr>
                  <th className="p-3">External Dimensions</th>
                  <td className="p-3">
                    {product.externalLengthMm} × {product.externalWidthMm} ×{' '}
                    {product.externalHeightMm} mm
                  </td>
                  <td className="p-3 text-steel-600">±2mm Welded Jig Tolerance</td>
                  <td className="p-3 text-emerald-700 font-bold">Standard</td>
                </tr>
                <tr>
                  <th className="p-3">Steel Section Gauge</th>
                  <td className="p-3">{product.steelSpecification}</td>
                  <td className="p-3 text-steel-600">BS EN 10219 S275JR</td>
                  <td className="p-3 text-emerald-700 font-bold">Heavy Duty</td>
                </tr>
                <tr>
                  <th className="p-3">Stacking Capacity</th>
                  <td className="p-3">{product.stackableHeight}</td>
                  <td className="p-3 text-steel-600">Static Floor Level Stacking</td>
                  <td className="p-3 text-emerald-700 font-bold">Rated</td>
                </tr>
                <tr>
                  <th className="p-3">Unladen Tare Weight</th>
                  <td className="p-3">{product.unitWeightKg} kg</td>
                  <td className="p-3 text-steel-600">Excludes Optional Castors</td>
                  <td className="p-3 text-steel-600">Nominal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Stillage Configurator & Live Rust Pricing Engine */}
      <div className="lg:col-span-5 border-2 border-brand-navy bg-surface-white shadow-lg sticky top-24">
        {/* Configurator Header */}
        <div className="bg-brand-navy text-surface-white p-5 border-b border-white/15">
          <div className="flex items-center justify-between text-xs font-mono text-surface-sand">
            <span>DIRECT FACTORY CONFIGURATOR</span>
            <span>{product.inStock ? 'IN STOCK' : 'MADE TO ORDER'}</span>
          </div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wide mt-1">
            {product.title}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono font-bold text-3xl text-surface-sand">
              {formatBothPrices(quote.discountedUnitExVatPence).primary}
            </span>
            <span className="font-mono text-xs text-steel-200">
              per unit ({formatBothPrices(quote.discountedUnitExVatPence).label})
            </span>
            {quote.discountPercentage > 0 && (
              <span className="ml-auto bg-accent-amber text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-sm">
                {quote.discountPercentage}% Bulk Discount Active
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Finish Option */}
          <div>
            <label className="block font-display font-bold uppercase tracking-wider text-sm text-brand-navy mb-2.5">
              1. Select Surface Finish / RAL Coating
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FINISH_OPTIONS.map((opt) => {
                const isSelected = finishOption === opt.id;
                const modText =
                  opt.priceModifierPence === 0
                    ? 'Included'
                    : opt.priceModifierPence > 0
                    ? `+${formatGBP(opt.priceModifierPence)}`
                    : `-${formatGBP(Math.abs(opt.priceModifierPence))}`;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFinishOption(opt.id);
                      trackB2BEvent({
                        event: 'configurator_option_select',
                        sku: product.sku,
                        productTitle: product.title,
                        optionType: 'finish',
                        optionValue: opt.id,
                      });
                    }}
                    className={`p-3 border text-left rounded-sm transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-stillage-blue bg-surface-sand/40'
                        : 'border-steel-200 hover:border-steel-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-bold text-xs text-steel-900">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: opt.swatchHex }}
                        />
                        {opt.code}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-stillage-blue">
                        {modText}
                      </span>
                    </div>
                    <div className="text-[11px] text-steel-600 mt-1.5 leading-snug">{opt.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Base Feet, Castors & Forklift Guides */}
          <div>
            <label className="block font-display font-bold uppercase tracking-wider text-sm text-brand-navy mb-2.5">
              2. Base Handling, Feet &amp; Castor Options
            </label>
            <div className="space-y-2">
              {MOBILITY_OPTIONS.map((opt) => {
                const isSelected = mobilityOption === opt.id;
                const modText =
                  opt.priceModifierPence === 0
                    ? 'Standard'
                    : `+${formatGBP(opt.priceModifierPence)} / unit`;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMobilityOption(opt.id)}
                    className={`w-full p-3 border text-left rounded-sm transition-all ${
                      isSelected
                        ? 'border-2 border-stillage-blue bg-surface-sand/40'
                        : 'border-steel-200 hover:border-steel-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-steel-900 flex items-center gap-2">
                        {isSelected && <Check className="w-3.5 h-3.5 text-stillage-blue" />}
                        {opt.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-stillage-blue">
                        {modText}
                      </span>
                    </div>
                    <p className="text-[11px] text-steel-600 mt-1">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Quantity & Interactive Bulk Tier Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="qty-input"
                className="font-display font-bold uppercase tracking-wider text-sm text-brand-navy"
              >
                3. Order Quantity &amp; Bulk Tiers
              </label>
              <span className="font-mono text-xs text-steel-600">
                Up to 4 units per HGV pallet
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 font-mono text-xs">
              {[
                { label: '1–4 Units', minQty: 1, pct: 'Standard' },
                { label: '5–9 Units', minQty: 5, pct: 'Save 5%' },
                { label: '10+ Units', minQty: 10, pct: 'Save 10%' },
              ].map((tier) => {
                const active =
                  (tier.minQty === 1 && quantity < 5) ||
                  (tier.minQty === 5 && quantity >= 5 && quantity < 10) ||
                  (tier.minQty === 10 && quantity >= 10);
                return (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => {
                      setQuantity(tier.minQty);
                      if (tier.minQty >= 5) {
                        trackB2BEvent({
                          event: 'bulk_tier_unlocked',
                          sku: product.sku,
                          productTitle: product.title,
                          quantity: tier.minQty,
                          discountPercentage: tier.minQty >= 10 ? 10 : 5,
                        });
                      }
                    }}
                    className={`p-2 border rounded-sm text-center transition-colors ${
                      active
                        ? 'bg-brand-navy text-surface-sand border-brand-navy font-bold'
                        : 'bg-surface-sandLight text-steel-800 border-steel-200 hover:border-stillage-blue'
                    }`}
                  >
                    <div>{tier.label}</div>
                    <div className="text-[10px] text-accent-amber font-bold">{tier.pct}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-steel-200 font-mono font-bold text-lg hover:bg-steel-100"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                id="qty-input"
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 h-10 text-center border border-steel-200 font-mono font-bold text-base"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-steel-200 font-mono font-bold text-lg hover:bg-steel-100"
                aria-label="Increase quantity"
              >
                +
              </button>
              <div className="ml-auto text-right font-mono text-xs text-steel-600">
                <div>Total Weight: {product.unitWeightKg * quantity} kg</div>
                <div>Pallets Required: {quote.palletCount}</div>
              </div>
            </div>

            {/* Smart HGV Pallet & Bulk Tier AI Optimizer */}
            <div className="mt-3 bg-surface-sandLight border border-steel-200 border-l-4 border-l-stillage-blue p-2.5 text-xs flex items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <div className="text-steel-800 leading-snug">
                  {quantity % 4 !== 0 ? (
                    <>
                      <strong className="text-brand-navy">Unused HGV Pallet Space:</strong>{' '}
                      {4 - (quantity % 4)} more unit{4 - (quantity % 4) > 1 ? 's' : ''} can stack on
                      Pallet #{quote.palletCount} for <strong>£0 extra freight</strong>.
                    </>
                  ) : quantity === 4 ? (
                    <>
                      <strong className="text-brand-navy">Bulk Tier Alert:</strong> Stepping to{' '}
                      <strong>5+ units</strong> (or 8 units on 2 full pallets) unlocks{' '}
                      <strong>5% Off</strong> every configured stillage.
                    </>
                  ) : (
                    <>
                      <strong className="text-brand-navy">Optimal Pallet Load:</strong>{' '}
                      {quote.palletCount} full HGV pallet space{quote.palletCount > 1 ? 's' : ''}{' '}
                      ({quantity} units) with{' '}
                      <strong>{quote.discountPercentage}% Bulk Trade Discount</strong> active.
                    </>
                  )}
                </div>
              </div>
              {quantity % 4 !== 0 ? (
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + (4 - (quantity % 4)))}
                  className="shrink-0 bg-brand-navy hover:bg-stillage-blue text-surface-sand px-2.5 py-1 rounded-sm font-mono text-[11px] font-bold transition-colors"
                >
                  Fill Pallet ({quantity + (4 - (quantity % 4))})
                </button>
              ) : quantity === 4 ? (
                <button
                  type="button"
                  onClick={() => setQuantity(8)}
                  className="shrink-0 bg-brand-navy hover:bg-stillage-blue text-surface-sand px-2.5 py-1 rounded-sm font-mono text-[11px] font-bold transition-colors"
                >
                  2 Pallets / -5% (8)
                </button>
              ) : null}
            </div>
          </div>

          {/* Step 4: UK Postcode Pallet Freight & Offloading Method */}
          <div className="border-t border-steel-200 pt-5 space-y-3">
            <label className="block font-display font-bold uppercase tracking-wider text-sm text-brand-navy">
              4. UK Pallet Delivery &amp; Site Offloading
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="postcode-input" className="block text-[11px] font-mono text-steel-600 mb-1">
                  Delivery Postcode
                </label>
                <input
                  id="postcode-input"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. LL13, B1, M1, IV1"
                  className="w-full px-3 py-2 border border-steel-200 rounded-sm font-mono text-xs uppercase"
                />
              </div>
              <div>
                <span className="block text-[11px] font-mono text-steel-600 mb-1">
                  Site Offloading Facility
                </span>
                <button
                  type="button"
                  onClick={() => setRequiresTailLift(!requiresTailLift)}
                  className={`w-full px-3 py-2 border rounded-sm font-mono text-xs text-left flex items-center justify-between ${
                    requiresTailLift
                      ? 'bg-accent-amber/15 border-accent-amber text-brand-navy font-bold'
                      : 'bg-white border-steel-200 text-steel-800'
                  }`}
                >
                  <span>{requiresTailLift ? 'Tail-Lift Required (+£15)' : 'Forklift On-Site (£0)'}</span>
                  <Truck className="w-4 h-4 text-stillage-blue" />
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-steel-600 bg-surface-sandLight p-2.5 border border-steel-200">
              <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
              <span>
                Stillages ship via HGV pallet network ({quote.deliveryZone}). Select{' '}
                <strong>Tail-Lift Required</strong> if you do not have a forklift on site to offload.
              </span>
            </div>
          </div>

          {/* Live Rust API Quote Breakdown */}
          <div className="bg-surface-sandLight border border-steel-200 p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-steel-600 border-b border-steel-200 pb-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-brand-navy">
                <Calculator className="w-3.5 h-3.5 text-stillage-blue" />
                LIVE QUOTE SUMMARY
              </span>
              <span>{ showIncVat ? 'INC. VAT VIEW' : 'EX. VAT VIEW' }</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-steel-600">
                {quote.quantity} × Configured Stillage ({selectedFinish.code})
              </span>
              <span className="font-bold text-steel-900">
                {formatGBP(quote.lineSubtotalExVatPence)}
              </span>
            </div>

            {quote.bulkSavingsExVatPence > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Bulk Tier Discount ({quote.discountPercentage}% Off)</span>
                <span>-{formatGBP(quote.bulkSavingsExVatPence)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-steel-600">
                HGV Pallet Freight ({quote.palletCount} Pallet{quote.palletCount > 1 ? 's' : ''})
              </span>
              <span className="font-bold text-steel-900">
                {formatGBP(quote.deliveryExVatPence)}
              </span>
            </div>

            <div className="border-t border-steel-200 pt-2 flex justify-between text-sm font-bold text-brand-navy">
              <span>Total Ex. VAT</span>
              <span>{formatGBP(quote.totalExVatPence)}</span>
            </div>

            <div className="flex justify-between text-steel-600">
              <span>UK VAT (20%)</span>
              <span>{formatGBP(quote.vatAmountPence)}</span>
            </div>

            <div className="border-t-2 border-brand-navy pt-2 flex justify-between text-base font-bold text-stillage-blue">
              <span>Total Inc. VAT</span>
              <span>{formatGBP(quote.totalIncVatPence)}</span>
            </div>
          </div>

          {/* Optional Company Name for B2B Proforma */}
          <div>
            <label
              htmlFor="configurator-company-input"
              className="block font-mono text-[11px] text-steel-600 mb-1"
            >
              Optional: Company Name / PO Reference for VAT Invoice
            </label>
            <input
              id="configurator-company-input"
              type="text"
              name="organization"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Midlands Engineering Ltd / PO-4829"
              className="w-full px-3 py-2 border border-steel-200 rounded-sm text-xs"
            />
          </div>

          {/* Conversion CTAs */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleCheckout('card')}
              className="w-full bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-base py-3.5 px-5 rounded-sm flex items-center justify-center gap-2 shadow transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                Buy Online Now — {formatGBP(quote.totalIncVatPence)} Inc. VAT
              </span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleCheckout('b2b_proforma')}
              className="w-full bg-brand-navy hover:bg-brand-navyLight text-surface-sand font-display font-bold uppercase tracking-wider text-sm py-3 px-5 rounded-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-accent-amber" />
              <span>Generate Official B2B VAT Proforma Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleAddToBasketOnly}
              className="w-full bg-surface-sandLight hover:bg-surface-sand text-brand-navy border border-steel-200 font-display font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stillage-blue" />
              <span>Add Specification to Order Basket &amp; Keep Browsing</span>
            </button>
          </div>

          {orderStatusMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3.5 bg-emerald-50 border border-emerald-600 text-emerald-950 text-xs font-medium rounded-sm flex items-start justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>{orderStatusMessage}</div>
              </div>
              <Link
                href="/checkout"
                className="shrink-0 inline-flex items-center gap-1 font-mono font-bold text-stillage-blue hover:underline"
              >
                <span>View Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
