'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
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
import { useSiteContent } from '@/context/SiteContentContext';
import { ProductTechnicalDiagram } from '@/components/ProductTechnicalDiagram';

interface ProductConfiguratorProps {
  product: Product;
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { microtexts } = useSiteContent();
  const configCopy = microtexts.configurator;
  const {
    showIncVat,
    formatBothPrices,
    addToBasket,
    deliveryPostcode,
    setDeliveryPostcode,
    requiresTailLift: ctxTailLift,
    setRequiresTailLift: setCtxTailLift,
  } = useVat();

  // Stage visual controls — crisp Studio White default (cream removed)
  const [backdropMode, setBackdropMode] = useState<'white' | 'steel' | 'blueprint'>('white');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Configurator state
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

  // Live quote
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

  // Two-step configurator tab state ('configure' | 'delivery')
  const [activeTab, setActiveTab] = useState<'configure' | 'delivery'>('configure');
  const instanceId = useId();
  const configureTabId = `${instanceId}-configure-tab`;
  const deliveryTabId = `${instanceId}-delivery-tab`;
  const configureTabRef = useRef<HTMLButtonElement>(null);
  const deliveryTabRef = useRef<HTMLButtonElement>(null);
  const configurePanelRef = useRef<HTMLDivElement>(null);
  const deliveryPanelRef = useRef<HTMLDivElement>(null);

  // Reveal hidden="until-found" tab panels automatically during browser Find-in-Page
  useEffect(() => {
    const configureEl = configurePanelRef.current;
    const deliveryEl = deliveryPanelRef.current;
    const onConfigureMatch = () => setActiveTab('configure');
    const onDeliveryMatch = () => setActiveTab('delivery');

    configureEl?.addEventListener('beforematch', onConfigureMatch);
    deliveryEl?.addEventListener('beforematch', onDeliveryMatch);
    return () => {
      configureEl?.removeEventListener('beforematch', onConfigureMatch);
      deliveryEl?.removeEventListener('beforematch', onDeliveryMatch);
    };
  }, []);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const nextTab =
        e.key === 'Home'
          ? 'configure'
          : e.key === 'End'
          ? 'delivery'
          : activeTab === 'configure'
          ? 'delivery'
          : 'configure';
      setActiveTab(nextTab);
      (nextTab === 'configure' ? configureTabRef.current : deliveryTabRef.current)?.focus();
    }
  };

  const mobilityShortLabels: Record<string, string> = {
    'standard-feet': 'Stacking Feet',
    'forklift-pockets': 'Forklift Pockets',
    'heavy-duty-castors': 'Lockable Castors',
    'both-castors-pockets': 'Castors + Pockets',
  };

  const unitsOnCurrentPallet = quantity % 4 === 0 ? 4 : quantity % 4;
  const palletFillPercent = Math.round((unitsOnCurrentPallet / 4) * 100);

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
    backdropMode === 'white'
      ? 'bg-surface-white'
      : backdropMode === 'steel'
      ? 'bg-steel-50'
      : 'bg-steel-50 bg-blueprint-grid';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Column: Clean Visual Stage, CAD Diagram & Engineering Overview */}
      <div className="lg:col-span-7 space-y-8">
        {/* Product Image Viewer */}
        <div className="border border-steel-200 bg-surface-white rounded-sm shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-steel-200 bg-steel-50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-brand-navy text-white px-2.5 py-0.5 font-bold rounded-sm">
                SKU: {product.sku}
              </span>
              <span className="text-steel-400">|</span>
              <span className="font-bold text-stillage-blue">{product.swlKg} kg SWL Rated</span>
            </div>

            {/* Clean Surface Switcher (Studio White / Cool Steel / Interactive CAD) */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                aria-pressed={backdropMode === 'white'}
                onClick={() => setBackdropMode('white')}
                className={`px-2.5 py-1 rounded-sm border transition-colors ${
                  backdropMode === 'white'
                    ? 'bg-brand-navy border-brand-navy text-white font-bold'
                    : 'bg-surface-white border-steel-200 text-steel-600 hover:border-steel-400'
                }`}
              >
                Studio White
              </button>
              <button
                type="button"
                aria-pressed={backdropMode === 'steel'}
                onClick={() => setBackdropMode('steel')}
                className={`px-2.5 py-1 rounded-sm border transition-colors ${
                  backdropMode === 'steel'
                    ? 'bg-brand-navy border-brand-navy text-white font-bold'
                    : 'bg-surface-white border-steel-200 text-steel-600 hover:border-steel-400'
                }`}
              >
                Cool Steel
              </button>
              <button
                type="button"
                aria-pressed={backdropMode === 'blueprint'}
                onClick={() => setBackdropMode('blueprint')}
                className={`px-2.5 py-1 rounded-sm border transition-colors ${
                  backdropMode === 'blueprint'
                    ? 'bg-stillage-blue border-stillage-blue text-white font-bold'
                    : 'bg-surface-white border-steel-200 text-steel-600 hover:border-steel-400'
                }`}
              >
                Interactive CAD
              </button>
            </div>
          </div>

          {/* Main Image Stage */}
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
            <div className={`relative h-[420px] sm:h-[460px] p-8 transition-colors duration-300 ${backdropClass}`}>
              <img
                src={currentMedia.src}
                alt={currentMedia.label}
                fetchPriority={safeActiveIndex === 0 ? 'high' : 'auto'}
                width={760}
                height={540}
                className="w-full h-full object-contain"
              />

              {/* View Type Badge in Top Left */}
              <div className="absolute top-4 left-4 bg-brand-navy/95 text-white px-2.5 py-1 rounded-sm font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs border border-white/10">
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

              <div className="absolute bottom-4 right-4 bg-surface-white/95 text-steel-900 px-3 py-1.5 rounded-sm font-mono text-xs border border-steel-200 shadow-xs flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: selectedFinish.swatchHex }}
                />
                <span>{selectedFinish.code}</span>
              </div>
            </div>
          )}

          {/* Clean Thumbnail Switcher */}
          <div className="p-4 border-t border-steel-200 bg-steel-50 flex flex-wrap items-center gap-3">
            {mediaItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIndex(idx);
                  if (backdropMode === 'blueprint' && item.type !== 'drawing') {
                    setBackdropMode('white');
                  }
                }}
                className={`relative w-24 h-22 p-1.5 rounded-sm border-2 transition-all flex flex-col justify-between bg-surface-white ${
                  backdropMode !== 'blueprint' && safeActiveIndex === idx
                    ? 'border-stillage-blue shadow-xs ring-1 ring-stillage-blue'
                    : 'border-steel-200 opacity-80 hover:opacity-100 hover:border-steel-400'
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
                      : 'bg-steel-100 text-steel-800 font-medium'
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
                  ? 'border-stillage-blue bg-brand-navy text-white font-bold'
                  : 'border-steel-200 bg-brand-navy/90 text-surface-white hover:border-stillage-blue'
              }`}
            >
              <Compass className="w-5 h-5 text-accent-teal" aria-hidden="true" />
              <span>Interactive CAD</span>
              <span className="text-[9px] text-stillage-sky">
                {product.externalLengthMm}×{product.externalWidthMm}mm
              </span>
            </button>
            <div className="ml-auto text-xs text-steel-600 hidden sm:block">
              <strong className="text-steel-900">Steel Spec:</strong> {product.steelSpecification}
            </div>
          </div>
        </div>

        {/* Engineering Highlights & Description */}
        <div className="border border-steel-200 bg-surface-white p-6 rounded-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-brand-navy">
              Engineering Overview &amp; Construction
            </h2>
            <Link
              href={`/workshop?sku=${product.sku}`}
              className="px-3 py-1.5 rounded-sm bg-brand-navy hover:bg-stillage-blue text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-accent-teal" />
              <span>Open in Workshop Stack Builder</span>
            </Link>
          </div>
          <p className="text-sm text-steel-800 leading-relaxed">{product.fullDescription}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {product.highlights.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-steel-900 bg-steel-50 p-3 border border-steel-200 rounded-sm"
              >
                <ShieldCheck className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Column: Interactive Stillage Configurator & Live Quote */}
      <div className="lg:col-span-5 border-2 border-brand-navy bg-surface-white rounded-sm shadow-lg sticky top-20 overflow-hidden">
        {/* Slim Configurator Header */}
        <div className="bg-brand-navy text-surface-white px-4 py-2.5 border-b border-white/15">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display font-bold text-base sm:text-lg uppercase tracking-wide leading-snug line-clamp-2">
              {product.title}
            </h1>
            <span
              className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full font-mono font-bold text-[10px] tracking-wide ${
                product.inStock
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-accent-amber/20 text-amber-200 border border-accent-amber/40'
              }`}
            >
              {product.inStock ? 'IN STOCK' : 'MADE TO ORDER'}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="font-mono font-bold text-xl text-white">
              {formatBothPrices(quote.discountedUnitExVatPence).primary}
            </span>
            <span className="font-mono text-[11px] text-steel-200">
              / unit ({formatBothPrices(quote.discountedUnitExVatPence).label})
            </span>
            {quote.discountPercentage > 0 && (
              <span className="ml-auto bg-accent-amber text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm">
                {quote.discountPercentage}% Bulk Off
              </span>
            )}
          </div>
        </div>

        {/* Two-Step Segmented Tab Bar */}
        <div className="bg-steel-100 px-4 py-2 border-b border-steel-200">
          <div
            role="tablist"
            aria-label="Product configurator steps"
            className="grid grid-cols-2 gap-1.5 bg-steel-200/70 p-1 rounded-sm"
          >
            <button
              ref={configureTabRef}
              id={configureTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'configure'}
              tabIndex={activeTab === 'configure' ? 0 : -1}
              onClick={() => setActiveTab('configure')}
              onKeyDown={handleTabKeyDown}
              className={`py-1.5 px-3 rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-stillage-blue focus-visible:outline-offset-2 ${
                activeTab === 'configure'
                  ? 'bg-surface-white text-brand-navy shadow-sm border-b-2 border-stillage-blue'
                  : 'text-steel-600 hover:text-brand-navy border-b-2 border-transparent'
              }`}
            >
              1. Configure Unit
            </button>
            <button
              ref={deliveryTabRef}
              id={deliveryTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'delivery'}
              tabIndex={activeTab === 'delivery' ? 0 : -1}
              onClick={() => setActiveTab('delivery')}
              onKeyDown={handleTabKeyDown}
              className={`py-1.5 px-3 rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-stillage-blue focus-visible:outline-offset-2 ${
                activeTab === 'delivery'
                  ? 'bg-surface-white text-brand-navy shadow-sm border-b-2 border-stillage-blue'
                  : 'text-steel-600 hover:text-brand-navy border-b-2 border-transparent'
              }`}
            >
              2. Delivery &amp; Quote
            </button>
          </div>
        </div>

        {/* Tab Panel 1: Configure Unit */}
        <div
          ref={configurePanelRef}
          role="tabpanel"
          aria-labelledby={configureTabId}
          hidden={activeTab !== 'configure' ? ('until-found' as unknown as boolean) : undefined}
        >
          <div className="p-4 space-y-3.5">
            {/* Step 1: Visual Circular Finish Swatches */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-display font-bold uppercase tracking-wider text-xs text-brand-navy">
                  Finish &amp; Coating
                </span>
                <span
                  className="font-mono text-[11px] text-steel-600 truncate max-w-[65%]"
                  title={`${selectedFinish.name}: ${selectedFinish.leadTimeNote}`}
                >
                  {selectedFinish.name}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {FINISH_OPTIONS.map((opt) => {
                  const isSelected = finishOption === opt.id;
                  const modText =
                    opt.priceModifierPence === 0
                      ? 'Included'
                      : opt.priceModifierPence > 0
                      ? `+${formatGBP(opt.priceModifierPence)}`
                      : `-${formatGBP(Math.abs(opt.priceModifierPence))}`;

                  const swatchStyle: React.CSSProperties =
                    opt.id === 'custom-ral'
                      ? {
                          background:
                            'conic-gradient(#145DA0, #0F2342, #D97706, #059669, #DC2626, #145DA0)',
                        }
                      : opt.id === 'galvanised'
                      ? {
                          background:
                            'linear-gradient(135deg, #CBD5E1 0%, #F1F5F9 45%, #94A3B8 100%)',
                        }
                      : { backgroundColor: opt.swatchHex };

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={isSelected}
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
                      className="group flex flex-col items-center text-center p-1 rounded-sm transition-colors hover:bg-steel-50 focus-visible:outline-2 focus-visible:outline-stillage-blue focus-visible:outline-offset-2"
                    >
                      <span
                        className={`w-9 h-9 rounded-full border border-black/20 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-stillage-blue ring-offset-2 scale-105'
                            : 'group-hover:scale-105'
                        }`}
                        style={swatchStyle}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 drop-shadow ${
                              opt.id === 'galvanised' ? 'text-brand-navy' : 'text-white'
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="mt-1.5 font-bold text-[11px] text-steel-900 leading-tight">
                        {opt.code}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-stillage-blue">
                        {modText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Base & Mobility 2x2 Tile Grid */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-display font-bold uppercase tracking-wider text-xs text-brand-navy">
                  Base &amp; Mobility
                </span>
                <span
                  className="text-[11px] text-steel-500 truncate max-w-[65%]"
                  title={selectedMobility.description}
                >
                  {selectedMobility.description}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOBILITY_OPTIONS.map((opt) => {
                  const isSelected = mobilityOption === opt.id;
                  const shortLabel = mobilityShortLabels[opt.id] || opt.name;
                  const modText =
                    opt.priceModifierPence === 0
                      ? 'Included'
                      : `+${formatGBP(opt.priceModifierPence)}`;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setMobilityOption(opt.id)}
                      className={`p-2 border text-left rounded-sm transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-stillage-blue focus-visible:outline-offset-2 ${
                        isSelected
                          ? 'border-2 border-stillage-blue bg-stillage-blue/5 shadow-sm'
                          : 'border-steel-200 hover:border-steel-400 bg-surface-white'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-stillage-blue text-white'
                            : 'bg-steel-100 text-brand-navy'
                        }`}
                      >
                        {opt.id === 'standard-feet' ? (
                          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : opt.id === 'forklift-pockets' ? (
                          <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-xs text-steel-900 leading-tight truncate">
                          {shortLabel}
                        </span>
                        <span className="block font-mono text-[10px] font-semibold text-stillage-blue">
                          {modText}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Quantity, Pallet Capacity & Bulk Tier Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="qty-input"
                  className="font-display font-bold uppercase tracking-wider text-xs text-brand-navy"
                >
                  Quantity
                </label>
                <span className="font-mono text-[11px] text-steel-600">
                  {product.unitWeightKg * quantity} kg total
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-steel-200 rounded-sm overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 font-mono font-bold text-base hover:bg-steel-100 transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue"
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
                    className="w-12 h-8 text-center border-x border-steel-200 font-mono font-bold text-sm focus:outline-none focus:bg-steel-50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 font-mono font-bold text-base hover:bg-steel-100 transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Pallet Capacity Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between font-mono text-[11px] text-steel-700 mb-1">
                    <span className="truncate">
                      Pallet Capacity: {unitsOnCurrentPallet}/4
                    </span>
                    <span className="font-bold text-brand-navy shrink-0">
                      {quote.palletCount} Pallet{quote.palletCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-steel-100 rounded-full overflow-hidden border border-steel-200">
                    <div
                      className="h-full bg-stillage-blue transition-all duration-300"
                      style={{ width: `${palletFillPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Compact Bulk Tier Chips */}
              <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                {[
                  { label: '1–4', minQty: 1, badge: null },
                  { label: '5–9', minQty: 5, badge: '-5%' },
                  { label: '10+', minQty: 10, badge: '-10%' },
                ].map((tier) => {
                  const active =
                    (tier.minQty === 1 && quantity < 5) ||
                    (tier.minQty === 5 && quantity >= 5 && quantity < 10) ||
                    (tier.minQty === 10 && quantity >= 10);
                  return (
                    <button
                      key={tier.label}
                      type="button"
                      aria-pressed={active}
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
                      className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue ${
                        active
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-steel-50 text-steel-700 border-steel-200 hover:border-stillage-blue'
                      }`}
                    >
                      {tier.label}
                      {tier.badge && (
                        <span className={active ? 'text-accent-amber ml-1' : 'text-emerald-700 ml-1'}>
                          ({tier.badge})
                        </span>
                      )}
                    </button>
                  );
                })}

                {quantity % 4 !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + (4 - (quantity % 4)))}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono font-bold text-stillage-blue hover:underline"
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Fill pallet ({quantity + (4 - (quantity % 4))})
                  </button>
                ) : quantity === 4 ? (
                  <button
                    type="button"
                    onClick={() => setQuantity(8)}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono font-bold text-stillage-blue hover:underline"
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    8 units = -5%
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Panel 2: Delivery & Quote */}
        <div
          ref={deliveryPanelRef}
          role="tabpanel"
          aria-labelledby={deliveryTabId}
          hidden={activeTab !== 'delivery' ? ('until-found' as unknown as boolean) : undefined}
        >
          <div className="p-5 space-y-4">
            {/* UK Postcode & Offloading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="postcode-input"
                  className="block text-[11px] font-mono text-steel-600 mb-1"
                >
                  Delivery Postcode
                </label>
                <input
                  id="postcode-input"
                  type="text"
                  autoComplete="postal-code"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. LL13, B1, M1, IV1"
                  className="w-full px-3 py-2 border border-steel-200 rounded-sm font-mono text-xs uppercase focus-visible:outline-2 focus-visible:outline-stillage-blue"
                />
              </div>
              <div>
                <span className="block text-[11px] font-mono text-steel-600 mb-1">
                  Site Offloading Facility
                </span>
                <button
                  type="button"
                  aria-pressed={requiresTailLift}
                  onClick={() => setRequiresTailLift(!requiresTailLift)}
                  className={`w-full px-3 py-2 border rounded-sm font-mono text-xs text-left flex items-center justify-between focus-visible:outline-2 focus-visible:outline-stillage-blue ${
                    requiresTailLift
                      ? 'bg-accent-amber/15 border-accent-amber text-brand-navy font-bold'
                      : 'bg-surface-white border-steel-200 text-steel-800'
                  }`}
                >
                  <span>{requiresTailLift ? 'Tail-Lift (+£15)' : 'Forklift On-Site (£0)'}</span>
                  <Truck className="w-4 h-4 text-stillage-blue shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-steel-600 bg-steel-50 p-2.5 border border-steel-200 rounded-sm">
              <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Ships via HGV pallet network ({quote.deliveryZone}). Select{' '}
                <strong>Tail-Lift</strong> if no forklift is available on site.
              </span>
            </div>

            {/* Live Quote Breakdown */}
            <div className="bg-steel-50 border border-steel-200 p-3.5 rounded-sm space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-steel-600 border-b border-steel-200 pb-1.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-brand-navy">
                  <Calculator className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                  LIVE QUOTE SUMMARY
                </span>
                <span>{showIncVat ? 'INC. VAT VIEW' : 'EX. VAT VIEW'}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-steel-600">
                  {quote.quantity} × Stillage ({selectedFinish.code})
                </span>
                <span className="font-bold text-steel-900">
                  {formatGBP(quote.lineSubtotalExVatPence)}
                </span>
              </div>

              <div className="flex justify-between text-steel-600">
                <span>Base: {mobilityShortLabels[selectedMobility.id] || selectedMobility.name}</span>
                <span>
                  {selectedMobility.priceModifierPence === 0
                    ? 'Included'
                    : `+${formatGBP(selectedMobility.priceModifierPence * quote.quantity)}`}
                </span>
              </div>

              {quote.bulkSavingsExVatPence > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Bulk Discount ({quote.discountPercentage}% Off)</span>
                  <span>-{formatGBP(quote.bulkSavingsExVatPence)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-steel-600">
                  HGV Freight ({quote.palletCount} Pallet{quote.palletCount > 1 ? 's' : ''})
                </span>
                <span className="font-bold text-steel-900">
                  {formatGBP(quote.deliveryExVatPence)}
                </span>
              </div>

              <div className="border-t border-steel-200 pt-1.5 flex justify-between font-bold text-brand-navy">
                <span>Total Ex. VAT</span>
                <span>{formatGBP(quote.totalExVatPence)}</span>
              </div>

              <div className="flex justify-between text-steel-600">
                <span>UK VAT (20%)</span>
                <span>{formatGBP(quote.vatAmountPence)}</span>
              </div>

              <div className="border-t border-brand-navy pt-1.5 flex justify-between text-sm font-bold text-stillage-blue">
                <span>Total Inc. VAT</span>
                <span>{formatGBP(quote.totalIncVatPence)}</span>
              </div>
            </div>

            {/* Optional Company Name / PO */}
            <div>
              <label
                htmlFor="configurator-company-input"
                className="block font-mono text-[11px] text-steel-600 mb-1"
              >
                Company Name / PO Reference (Optional)
              </label>
              <input
                id="configurator-company-input"
                type="text"
                name="organization"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Midlands Engineering Ltd / PO-4829"
                className="w-full px-3 py-2 border border-steel-200 rounded-sm text-xs focus-visible:outline-2 focus-visible:outline-stillage-blue"
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Summary & Action Footer */}
        <div className="border-t border-steel-200 bg-steel-50 px-4 py-3 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono font-bold text-lg text-brand-navy">
                {formatGBP(quote.totalIncVatPence)}{' '}
                <span className="text-[11px] font-normal text-steel-600">inc. VAT</span>
              </span>
              <span className="font-mono text-[11px] text-steel-500">
                ({formatGBP(quote.totalExVatPence)} ex. VAT • {quote.palletCount} Pallet
                {quote.palletCount > 1 ? 's' : ''})
              </span>
            </div>
            {activeTab === 'configure' && (
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className="text-[11px] font-mono font-bold text-stillage-blue hover:underline shrink-0"
              >
                Edit delivery
              </button>
            )}
          </div>

          {activeTab === 'configure' ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className="w-full bg-brand-navy hover:bg-brand-navyLight text-white font-display font-bold uppercase tracking-wider text-sm py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue focus-visible:outline-offset-2"
              >
                <span>Continue to Delivery &amp; Quote</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-steel-600 pt-0.5">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCheckout('card')}
                  className="hover:text-stillage-blue font-bold underline-offset-2 hover:underline"
                >
                  Buy Now
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  onClick={handleAddToBasketOnly}
                  className="hover:text-stillage-blue font-bold underline-offset-2 hover:underline"
                >
                  Add to Basket
                </button>
                <span aria-hidden="true">•</span>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCheckout('b2b_proforma')}
                  className="hover:text-stillage-blue font-bold underline-offset-2 hover:underline"
                >
                  PDF Quote
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleCheckout('card')}
                className="w-full bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-sm py-3 px-4 rounded-sm flex items-center justify-center gap-2 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-navy focus-visible:outline-offset-2"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Buy Online Now — {formatGBP(quote.totalIncVatPence)} Inc. VAT</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToBasketOnly}
                  className="bg-surface-white hover:bg-steel-100 text-brand-navy border border-steel-200 font-display font-bold uppercase tracking-wider text-[11px] py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-stillage-blue shrink-0" aria-hidden="true" />
                  <span className="truncate">{configCopy.addToBasketLabel || 'Add to Basket'}</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCheckout('b2b_proforma')}
                  className="bg-brand-navy hover:bg-brand-navyLight text-white font-display font-bold uppercase tracking-wider text-[11px] py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-stillage-blue"
                >
                  <FileText className="w-3.5 h-3.5 text-accent-amber shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {configCopy.proformaButtonLabel ? 'B2B PDF Proforma' : 'PDF Proforma Quote'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {orderStatusMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 bg-emerald-50 border border-emerald-600 text-emerald-950 text-xs font-medium rounded-sm flex items-start justify-between gap-2.5"
            >
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>{orderStatusMessage}</div>
              </div>
              <Link
                href="/checkout"
                className="shrink-0 inline-flex items-center gap-1 font-mono font-bold text-stillage-blue hover:underline"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
