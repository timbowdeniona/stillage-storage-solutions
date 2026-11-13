'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Layers,
  Box,
  Truck,
  FileText,
} from 'lucide-react';
import { Product } from '@/types/catalog';
import { useVat } from '@/context/VatContext';
import { RedesignBanner } from '@/components/RedesignBanner';

interface Approach2Props {
  products: Product[];
}

export function Approach2HomePage({ products }: Approach2Props) {
  const { formatBothPrices } = useVat();

  // 3-Step Filter States
  const [appType, setAppType] = useState<string>('all');
  const [swlFilter, setSwlFilter] = useState<number | 'all'>('all');
  const [mobilityFilter, setMobilityFilter] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Application match
      if (appType !== 'all') {
        if (appType === 'cantilever' && !p.categorySlug.includes('cantilever')) return false;
        if (appType === 'hopper' && !p.categorySlug.includes('hopper')) return false;
        if (appType === 'sheet' && !p.categorySlug.includes('sheet') && !p.categorySlug.includes('mesh')) return false;
        if (appType === 'post' && !p.categorySlug.includes('post')) return false;
      }
      // SWL match
      if (swlFilter !== 'all') {
        if (swlFilter === 1500 && p.swlKg < 1500) return false;
        if (swlFilter === 1000 && (p.swlKg < 1000 || p.swlKg > 1200)) return false;
      }
      return true;
    });
  }, [products, appType, swlFilter]);

  const resetFilters = () => {
    setAppType('all');
    setSwlFilter('all');
    setMobilityFilter('all');
  };

  return (
    <div className="bg-surface-sandLight min-h-screen text-steel-900">
      <RedesignBanner
        currentApproach={2}
        title="Approach 2: Interactive Spec Finder & Solution Guide"
        tagline="Decision-driven guided selection, CAD blueprints, zero decision fatigue"
      />

      {/* Hero with Guided Spec Finder */}
      <section className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider mb-3">
              <Sliders className="w-4 h-4 text-accent-teal" />
              <span>Interactive Stillage Spec Finder</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
              Find Your Stillage in <span className="text-surface-sand">10 Seconds</span>
            </h1>
            <p className="text-steel-200 text-sm sm:text-base mt-2">
              Select your storage type and load capacity below to instantly filter our 12 standard British-made models.
            </p>
          </div>

          {/* The 3-Step Finder Widget */}
          <div className="bg-surface-white text-steel-900 p-6 sm:p-8 rounded-sm shadow-2xl border-2 border-surface-sand">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Storage Application */}
              <div className="space-y-2.5">
                <label className="block font-mono text-xs font-bold uppercase text-brand-navy">
                  1. Storage Application
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setAppType('all')}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      appType === 'all'
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    All Types (12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppType('cantilever')}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      appType === 'cantilever'
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    Bar &amp; Pipe Racks
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppType('hopper')}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      appType === 'hopper'
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    Hopper Bins
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppType('sheet')}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      appType === 'sheet'
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    Solid &amp; Mesh Cages
                  </button>
                </div>
              </div>

              {/* Step 2: Weight Capacity / SWL */}
              <div className="space-y-2.5">
                <label className="block font-mono text-xs font-bold uppercase text-brand-navy">
                  2. Load Capacity (SWL)
                </label>
                <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setSwlFilter('all')}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      swlFilter === 'all'
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    Any Load Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => setSwlFilter(1000)}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      swlFilter === 1000
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    1,000kg SWL (Standard Warehouse)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSwlFilter(1500)}
                    className={`p-2.5 rounded-sm border text-left transition-colors ${
                      swlFilter === 1500
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'border-steel-200 hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    1,500kg+ Heavy-Duty SWL
                  </button>
                </div>
              </div>

              {/* Step 3: Fast Summary & Reset */}
              <div className="space-y-2.5 bg-surface-sandLight p-4 rounded-sm border border-steel-200 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-brand-navy">
                    Matching Models
                  </div>
                  <div className="text-3xl font-display font-extrabold text-stillage-blue mt-1">
                    {filteredProducts.length} Stillages
                  </div>
                  <p className="text-xs text-steel-600 mt-1">
                    Matching your specific capacity and application criteria.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-steel-600 hover:text-brand-navy underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-brand-navy">
            Recommended Stillages ({filteredProducts.length})
          </h2>
          <span className="font-mono text-xs text-steel-500">
            Click any card to inspect technical CAD drawing &amp; options
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-surface-white p-12 text-center rounded border border-steel-200">
            <p className="text-steel-600 font-mono text-sm">
              No standard model fits that exact combination. We can build it bespoke!
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 bg-stillage-blue text-white font-mono text-xs font-bold px-4 py-2 rounded-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const price = formatBothPrices(product.basePriceExVatPence);
              return (
                <div
                  key={product.id}
                  className="bg-surface-white border border-steel-200 hover:border-stillage-blue rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all group"
                >
                  <div>
                    {/* Image stage with Technical Drawing toggle badge */}
                    <div className="relative h-60 bg-surface-sand/30 p-6 flex items-center justify-center border-b border-steel-200">
                      <span className="absolute top-3 left-3 bg-brand-navy text-surface-sand font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                        {product.sku}
                      </span>
                      <span className="absolute top-3 right-3 bg-accent-teal text-white font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                        {product.swlKg}kg SWL
                      </span>
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        width={300}
                        height={220}
                        className="h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="font-display font-bold text-lg uppercase text-brand-navy line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-xs text-steel-600 mt-2 line-clamp-2">
                        {product.shortDescription}
                      </p>

                      <div className="mt-4 p-3 bg-surface-sandLight rounded-sm font-mono text-xs text-steel-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-steel-500">Footprint:</span>
                          <span className="font-bold">{product.externalLengthMm}×{product.externalWidthMm}mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-steel-500">Stacking:</span>
                          <span className="font-bold">{product.stackableHeight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-steel-500">Steel Spec:</span>
                          <span className="font-bold truncate max-w-[180px]">{product.steelSpecification}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-surface-sandLight/50 border-t border-steel-200 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-lg font-bold text-brand-navy">
                        {price.primary}
                      </div>
                      <div className="font-mono text-[10px] text-steel-500">
                        {price.label}
                      </div>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Configure Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Custom Dimension CAD Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-surface-white border-2 border-brand-navy p-8 rounded-sm shadow-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-2">
            <span className="font-mono text-xs font-bold text-stillage-blue uppercase">
              WREXHAM STEEL WORKS
            </span>
            <h3 className="font-display font-extrabold text-2xl uppercase text-brand-navy">
              Need A Specific Footprint Not Listed In Our 12 Standard Models?
            </h3>
            <p className="text-steel-600 text-sm">
              We fabricate bespoke box section stillages, post pallets, and pipe racks from 1 to 500+ units. Send us your CAD drawings or warehouse sketches.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-2.5">
            <a
              href="mailto:sales@stillagestoragesolutions.co.uk"
              className="bg-stillage-blue hover:bg-stillage-blueDark text-white text-center font-display font-bold uppercase tracking-wider py-3 px-6 rounded-sm text-xs transition-colors"
            >
              Upload CAD Drawing
            </a>
            <a
              href="tel:01978800500"
              className="border border-steel-300 hover:border-brand-navy text-brand-navy text-center font-mono py-2.5 px-6 rounded-sm text-xs transition-colors"
            >
              Speak to Fabrication Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
