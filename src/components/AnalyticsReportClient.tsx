'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  CheckCircle2,
  Code2,
  Eye,
  Globe,
  HelpCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  B2BAnalyticsEventPayload,
  getRecentB2BEvents,
  trackB2BEvent,
} from '@/lib/analytics';
import {
  buildFaqSchema,
  buildProductSchema,
  getProductFaqs,
  resolveProductSeo,
} from '@/lib/seo';
import { Product } from '@/types/catalog';

export function AnalyticsReportClient() {
  const [recentEvents, setRecentEvents] = useState<B2BAnalyticsEventPayload[]>([]);

  // Interactive "Set It & Forget It" Contentful Simulator State
  const [simTitle, setSimTitle] = useState(
    'Heavy-Duty Collapsible Automotive Pallet Stillage'
  );
  const [simSku, setSimSku] = useState('SSS-AUTO-1210C');
  const [simSwlKg, setSimSwlKg] = useState(1250);
  const [simLengthMm, setSimLengthMm] = useState(1200);
  const [simWidthMm, setSimWidthMm] = useState(1000);
  const [simHeightMm, setSimHeightMm] = useState(950);
  const [simPriceGbp, setSimPriceGbp] = useState(215);
  const [simShortDesc, setSimShortDesc] = useState(
    'Fold-flat steel automotive component stillage with drop-down mesh sides and captive forklift base channels.'
  );
  // Optional SEO fields intentionally left BLANK by default to demonstrate automatic fallback
  const [simSeoTitle, setSimSeoTitle] = useState('');
  const [simSeoDescription, setSimSeoDescription] = useState('');
  const [simCustomFaqLine, setSimCustomFaqLine] = useState('');

  useEffect(() => {
    setRecentEvents(getRecentB2BEvents());
    const handler = () => {
      setRecentEvents(getRecentB2BEvents());
    };
    window.addEventListener('sss-analytics-event', handler);
    return () => window.removeEventListener('sss-analytics-event', handler);
  }, []);

  const handleSimulateEvent = () => {
    trackB2BEvent({
      event: 'quote_or_proforma_submitted',
      sku: 'SSS-CANT-3B8A',
      productTitle: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
      quantity: 8,
      discountPercentage: 5,
      totalExVatPence: 292600,
      paymentMethod: 'proforma_invoice',
    });
  };

  const simulatedSlug = simTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const simulatedProduct: Product = {
    id: 'sim-product-preview',
    title: simTitle || 'Untitled Steel Stillage',
    slug: simulatedSlug || 'untitled-steel-stillage',
    sku: simSku || 'SSS-NEW-001',
    categorySlug: 'sheet-stillages',
    categoryName: 'Solid Sheet Steel Stillages',
    shortDescription: simShortDesc,
    fullDescription: simShortDesc,
    basePriceExVatPence: Math.round((Number(simPriceGbp) || 0) * 100),
    swlKg: Number(simSwlKg) || 1000,
    externalLengthMm: Number(simLengthMm) || 1200,
    externalWidthMm: Number(simWidthMm) || 1000,
    externalHeightMm: Number(simHeightMm) || 900,
    unitWeightKg: 74,
    stackableHeight: '4-High Stackable',
    steelSpecification: '50x50x3mm RHS + 2mm Sheet Panels',
    standardFinish: 'RAL 5010 Stillage Blue',
    ukcaCertified: true,
    inStock: true,
    leadTimeText: 'In Stock — Dispatch in 2–3 Working Days',
    featured: true,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    backdropStyle: 'sand',
    highlights: [],
    seoTitle: simSeoTitle || undefined,
    seoDescription: simSeoDescription || undefined,
    faqItems: simCustomFaqLine.trim() ? [simCustomFaqLine.trim()] : [],
  };

  const resolvedSeo = resolveProductSeo(simulatedProduct);
  const resolvedFaqs = getProductFaqs(simulatedProduct);
  const productSchema = buildProductSchema(simulatedProduct);
  const faqSchema = buildFaqSchema(resolvedFaqs);

  // Relative /api/og URL for live local image rendering
  const relativeOgUrl = resolvedSeo.ogImageUrl.replace(
    'https://stillagestoragesolutions.co.uk',
    ''
  );

  return (
    <div className="space-y-10">
      {/* Live Interactive "Set It & Forget It" Contentful SEO & GEO Simulator */}
      <div className="border-2 border-stillage-blue bg-surface-white rounded-sm overflow-hidden shadow-md">
        <div className="bg-brand-navy text-surface-white px-6 py-4 border-b-2 border-stillage-blue flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-accent-teal font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Demonstration — Try It Live</span>
            </div>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl uppercase text-white mt-0.5">
              &ldquo;Set It &amp; Forget It&rdquo; Contentful Automatic SEO &amp; GEO Simulator
            </h3>
          </div>
          <span className="font-mono text-xs bg-stillage-blue text-surface-sand px-3 py-1.5 rounded-sm border border-white/20 shrink-0">
            Optional SEO Fields Left Blank = 100% Auto-Generated
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: What the Non-Technical Client Enters in Contentful */}
          <div className="lg:col-span-5 space-y-4 bg-surface-sandLight p-5 border border-steel-200 rounded-sm">
            <div className="font-mono text-xs uppercase font-bold text-brand-navy border-b border-steel-200 pb-2">
              Step 1: Client Enters Standard Product Details in Contentful
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono font-bold text-steel-800 mb-1">
                  Product Title (Required in Contentful)
                </label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-steel-300 bg-white font-sans text-sm text-brand-navy font-semibold rounded-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">SKU</label>
                  <input
                    type="text"
                    value={simSku}
                    onChange={(e) => setSimSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs text-brand-navy font-bold rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">
                    SWL (kg)
                  </label>
                  <input
                    type="number"
                    value={simSwlKg}
                    onChange={(e) => setSimSwlKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs text-brand-navy font-bold rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">
                    Price (£ Ex VAT)
                  </label>
                  <input
                    type="number"
                    value={simPriceGbp}
                    onChange={(e) => setSimPriceGbp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs text-brand-navy font-bold rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">
                    Length (mm)
                  </label>
                  <input
                    type="number"
                    value={simLengthMm}
                    onChange={(e) => setSimLengthMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    value={simWidthMm}
                    onChange={(e) => setSimWidthMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-steel-800 mb-1">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    value={simHeightMm}
                    onChange={(e) => setSimHeightMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-steel-300 bg-white font-mono text-xs rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-steel-800 mb-1">
                  Short Description (Required in Contentful)
                </label>
                <textarea
                  rows={2}
                  value={simShortDesc}
                  onChange={(e) => setSimShortDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-steel-300 bg-white text-xs text-steel-900 rounded-sm"
                />
              </div>

              {/* Optional SEO Overrides Box */}
              <div className="pt-3 border-t border-steel-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] uppercase text-stillage-blue">
                    Optional Contentful SEO Fields (Leave Blank to Test Auto-Magic)
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={65}
                  placeholder="seoTitle — Leave blank for automatic Title + SKU + SWL..."
                  value={simSeoTitle}
                  onChange={(e) => setSimSeoTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-dashed border-steel-400 bg-white/80 font-mono text-xs rounded-sm"
                />
                <input
                  type="text"
                  maxLength={165}
                  placeholder="seoDescription — Leave blank for automatic 160-char summary..."
                  value={simSeoDescription}
                  onChange={(e) => setSimSeoDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-dashed border-steel-400 bg-white/80 font-mono text-xs rounded-sm"
                />
              </div>
            </div>
          </div>

          {/* Right: The 5 Automatic Outputs Generated in Real Time */}
          <div className="lg:col-span-7 space-y-5">
            <div className="font-mono text-xs uppercase font-bold text-stillage-blue border-b border-steel-200 pb-2">
              Step 2: What the Website Automatically Builds in Real Time
            </div>

            {/* Output 1 & 2: Google Search Title + Description + Rich Price Snippet */}
            <div className="border border-steel-200 bg-white p-4 rounded-sm shadow-sm space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px] text-steel-600">
                <span className="inline-flex items-center gap-1.5 font-bold text-brand-navy">
                  <Eye className="w-3.5 h-3.5 text-stillage-blue" />
                  1 &amp; 2. Live Google Search Result Preview (Title, 160-Char Description &amp; Rich Price)
                </span>
                <span className="bg-surface-sandLight px-2 py-0.5 rounded-sm border border-steel-200 text-brand-navy font-bold">
                  {resolvedSeo.usedFallbackTitle ? 'Auto-Generated from Specs' : 'Custom SEO Override'}
                </span>
              </div>
              <div className="pt-1 font-sans">
                <div className="text-xs text-steel-600 truncate">
                  https://stillagestoragesolutions.co.uk &rsaquo; products &rsaquo; {simulatedProduct.slug}
                </div>
                <div className="text-lg font-semibold text-[#1a0dab] leading-snug mt-0.5">
                  {resolvedSeo.title} | Stillage Storage Solutions
                </div>
                <div className="text-xs text-steel-800 leading-relaxed mt-1">
                  {resolvedSeo.description}
                </div>
                <div className="text-xs font-semibold text-steel-700 mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="text-emerald-700 font-bold">● In Stock</span>
                  <span>·</span>
                  <span className="font-bold text-brand-navy">
                    £{(simulatedProduct.basePriceExVatPence / 100).toFixed(2)} GBP (Ex. VAT)
                  </span>
                  <span>·</span>
                  <span>{simulatedProduct.swlKg} kg Certified SWL</span>
                  <span>·</span>
                  <span>2–3 Day UK HGV Pallet Delivery</span>
                </div>
              </div>
            </div>

            {/* Output 3: Live 1200x630 Branded Social Share Card (/api/og) */}
            <div className="border border-steel-200 bg-surface-sandLight/50 p-4 rounded-sm space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-bold text-brand-navy">
                  <Share2 className="w-3.5 h-3.5 text-stillage-blue" />
                  3. Auto-Generated 1200×630 Branded Social Share Card (/api/og)
                </span>
                <a
                  href={relativeOgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stillage-blue hover:underline font-bold"
                >
                  Open Full 1200×630 PNG &rarr;
                </a>
              </div>
              <div className="border border-brand-navy rounded-sm overflow-hidden bg-brand-navy aspect-[1200/630] max-h-56 flex items-center justify-center">
                <img
                  src={relativeOgUrl}
                  alt="Auto-generated Open Graph social card preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Output 4 & 5: Auto-Generated 4 Technical FAQs, JSON-LD & Sitemap/LLM Feed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-steel-200 bg-white p-3.5 rounded-sm space-y-2">
                <div className="font-mono text-[11px] font-bold text-brand-navy flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-stillage-blue" />
                  <span>4. Auto-Generated FAQPage Schema ({resolvedFaqs.length} Q&amp;As)</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-steel-800">
                  {resolvedFaqs.slice(0, 3).map((f, i) => (
                    <li key={i} className="border-l-2 border-stillage-blue pl-2">
                      <div className="font-bold text-brand-navy">{f.question}</div>
                      <div className="text-steel-600 line-clamp-2">{f.answer}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-steel-200 bg-brand-navy text-surface-sand p-3.5 rounded-sm space-y-2 font-mono text-[11px]">
                <div className="font-bold text-accent-teal flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>5. Live JSON-LD, /sitemap.xml &amp; /llms.txt</span>
                </div>
                <pre className="text-[10px] text-steel-200 overflow-x-auto leading-relaxed">
{`// Product & FAQ Schema + Sitemap
{
  "@type": "${productSchema['@type']}",
  "sku": "${productSchema.sku}",
  "offers": {
    "price": "${productSchema.offers.price}",
    "priceCurrency": "GBP"
  },
  "faqCount": ${faqSchema.mainEntity.length}
}`}
                </pre>
                <div className="pt-1 border-t border-white/15 flex items-center justify-between text-[10px] text-surface-sand">
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3 h-3 text-accent-teal" /> /sitemap.xml indexed
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bot className="w-3 h-3 text-accent-amber" /> /llms.txt ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Event Inspector */}
      <div className="border-2 border-brand-navy bg-surface-white p-6 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-steel-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-stillage-blue font-bold">
              <Activity className="w-4 h-4 text-accent-teal" />
              <span>Live Session Event Inspector (GA4 &amp; Plausible Feed)</span>
            </div>
            <h3 className="font-display font-extrabold text-xl uppercase text-brand-navy mt-1">
              Real-Time B2B Conversion Events Captured
            </h3>
            <p className="text-xs text-steel-600">
              Every configurator choice, bulk tier click, and proforma request is automatically sent to your monthly executive report.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateEvent}
            className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Trade Proforma Event</span>
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="bg-surface-sandLight border border-steel-200 p-4 rounded-sm flex items-center justify-between text-xs font-mono text-steel-700">
            <span>
              No events triggered in this browser tab yet. Configure a stillage or click &ldquo;Simulate Trade Proforma Event&rdquo; above to see live tracking.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-steel-200 max-h-64 overflow-y-auto">
            {recentEvents.map((ev, idx) => (
              <div
                key={`${ev.timestamp}-${idx}`}
                className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                  <span className="bg-brand-navy text-surface-sand px-2 py-0.5 rounded-sm font-bold">
                    {ev.event}
                  </span>
                  {ev.sku && <span className="font-bold text-stillage-blue">{ev.sku}</span>}
                  {ev.optionType && (
                    <span className="text-steel-700">
                      ({ev.optionType}: {String(ev.optionValue)})
                    </span>
                  )}
                  {ev.paymentMethod && (
                    <span className="text-brand-navy font-bold">
                      [{ev.paymentMethod.replace('_', ' ').toUpperCase()}]
                    </span>
                  )}
                </div>
                <div className="text-steel-600">
                  {ev.totalExVatPence
                    ? `£${(ev.totalExVatPence / 100).toFixed(2)} Ex. VAT`
                    : ev.quantity
                    ? `${ev.quantity} units`
                    : 'Tracked'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-brand-navy text-surface-sand p-3.5 rounded-sm flex items-center gap-3 text-xs font-mono">
          <Bell className="w-4 h-4 text-accent-amber shrink-0" />
          <span>
            <strong>Zero Login Needed for Client:</strong> Looker Studio automatically emails these metrics as a 1-page visual PDF to the client&apos;s inbox on the 1st of every month.
          </span>
        </div>
      </div>
    </div>
  );
}
