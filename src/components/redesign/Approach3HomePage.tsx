'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Layers,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { Product } from '@/types/catalog';
import { useVat } from '@/context/VatContext';
import { RedesignBanner } from '@/components/RedesignBanner';

interface Approach3Props {
  products: Product[];
}

export function Approach3HomePage({ products }: Approach3Props) {
  const { formatBothPrices, formatPrice } = useVat();
  const [tableFilter, setTableFilter] = useState<string>('all');

  const filteredForTable = products.filter((p) => {
    if (tableFilter === 'all') return true;
    return p.categorySlug.includes(tableFilter);
  });

  return (
    <div className="bg-surface-sandLight min-h-screen text-steel-900">
      <RedesignBanner
        currentApproach={3}
        title="Approach 3: Editorial Craftsmanship & Master Showcase"
        tagline="Engineering authority, flagship callout hero, 12-model specification matrix"
      />

      {/* Hero: Premium Architectural Dark Navy Hero */}
      <section className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue py-16 lg:py-24 relative overflow-hidden">
        {/* Subtle engineering blueprint grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#FAF5EE 1px, transparent 1px), linear-gradient(90deg, #FAF5EE 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-surface-sand font-mono text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-accent-teal" />
                <span>BS EN ISO 1461 &amp; PUWER 1998 Compliant</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.02]">
                British Steel.{' '}
                <span className="text-surface-sand">Certified SWL.</span> Zero Compromise.
              </h1>

              <p className="text-steel-200 text-base sm:text-lg leading-relaxed max-w-xl">
                We manufacture heavy-duty steel stillages, cantilever storage racks, and interlocking bins engineered to withstand decades of heavy forklift abuse. 12 proven standard footprints.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#matrix"
                  className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded-sm inline-flex items-center gap-2 shadow-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>12-Model Comparison Matrix</span>
                </a>
                <a
                  href="#families"
                  className="border border-white/25 hover:border-surface-sand text-surface-sand hover:text-white font-mono text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm transition-colors"
                >
                  Explore 3 Core Families &darr;
                </a>
              </div>
            </div>

            {/* Right: Architectural Hero Stillage with Callouts */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-white/5 border border-white/15 p-6 rounded-sm backdrop-blur-xs relative">
                <img
                  src="/images/products/cantilever-rack-cutout.png"
                  alt="Flagship Cantilever Stillage"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  width={480}
                  height={360}
                />

                {/* Technical Callout Badges */}
                <div className="absolute top-4 right-4 bg-brand-navyDark/90 border border-accent-teal text-surface-white px-2.5 py-1 rounded text-[11px] font-mono">
                  <span className="text-accent-teal font-bold">SWL:</span> 1,500kg
                </div>
                <div className="absolute bottom-4 left-4 bg-brand-navyDark/90 border border-surface-sand text-surface-white px-2.5 py-1 rounded text-[11px] font-mono">
                  <span className="text-surface-sand font-bold">Upright:</span> 80×80×4mm RHS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Product Families (Editorial Cards) */}
      <section id="families" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-steel-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
            ENGINEERING RANGES
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
            Three Core Stillage Architecture Families
          </h2>
          <p className="text-steel-600 text-sm mt-2">
            Every model in our 12-product inventory is rooted in one of three standardized manufacturing architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Family 1 */}
          <div className="bg-surface-white border border-steel-200 p-8 rounded-sm hover:border-stillage-blue transition-all shadow-xs hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="h-44 bg-surface-sand/40 p-4 flex items-center justify-center rounded-sm mb-6">
                <img
                  src="/images/products/cantilever-rack-cutout.png"
                  alt="Cantilever Racks"
                  className="h-full object-contain"
                />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-stillage-blue">
                Range 01
              </span>
              <h3 className="font-display font-bold text-2xl uppercase text-brand-navy mt-1">
                Cantilever Bar &amp; Pipe Racks
              </h3>
              <p className="text-steel-600 text-xs mt-3 leading-relaxed">
                Multi-tier double-sided cantilever stillages designed for crane and forklift loading of conduit, steel bar, timber, and extrusions with anti-roll safety stops.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-steel-100 flex items-center justify-between text-xs font-mono">
              <span className="text-steel-500 font-bold">3 Models (1,500kg SWL)</span>
              <button
                onClick={() => setTableFilter('cantilever')}
                className="text-stillage-blue font-bold hover:underline"
              >
                View in Matrix &rarr;
              </button>
            </div>
          </div>

          {/* Family 2 */}
          <div className="bg-surface-white border border-steel-200 p-8 rounded-sm hover:border-stillage-blue transition-all shadow-xs hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="h-44 bg-surface-sand/40 p-4 flex items-center justify-center rounded-sm mb-6">
                <img
                  src="/images/products/stacked-hopper-stillage.png"
                  alt="Modular Hopper Towers"
                  className="h-full object-contain"
                />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-stillage-blue">
                Range 02
              </span>
              <h3 className="font-display font-bold text-2xl uppercase text-brand-navy mt-1">
                Interlocking Hopper Towers
              </h3>
              <p className="text-steel-600 text-xs mt-3 leading-relaxed">
                4-tier vertical gravity feed bins and conical discharge hoppers with pressed pyramid feet that securely nest for high-density warehouse storage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-steel-100 flex items-center justify-between text-xs font-mono">
              <span className="text-steel-500 font-bold">3 Models (1,000kg SWL)</span>
              <button
                onClick={() => setTableFilter('hopper')}
                className="text-stillage-blue font-bold hover:underline"
              >
                View in Matrix &rarr;
              </button>
            </div>
          </div>

          {/* Family 3 */}
          <div className="bg-surface-white border border-steel-200 p-8 rounded-sm hover:border-stillage-blue transition-all shadow-xs hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="h-44 bg-surface-sand/40 p-4 flex items-center justify-center rounded-sm mb-6">
                <img
                  src="/images/products/cantilever-rack-sand.png"
                  alt="Solid Sheet & Mesh Cages"
                  className="h-full object-contain"
                />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-stillage-blue">
                Range 03
              </span>
              <h3 className="font-display font-bold text-2xl uppercase text-brand-navy mt-1">
                Solid Sheet &amp; Mesh Cages
              </h3>
              <p className="text-steel-600 text-xs mt-3 leading-relaxed">
                Standard 1200×1000mm and 1200×800mm foundry bins, half-drop gate order picking cages, and heavy-duty demountable post pallets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-steel-100 flex items-center justify-between text-xs font-mono">
              <span className="text-steel-500 font-bold">6 Models (1,000kg SWL)</span>
              <button
                onClick={() => setTableFilter('sheet')}
                className="text-stillage-blue font-bold hover:underline"
              >
                View in Matrix &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The 12 Core Models Engineering Comparison Matrix */}
      <section id="matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
              PROCUREMENT SPECIFICATION SHEET
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
              12 Core Models Comparison Matrix
            </h2>
            <p className="text-steel-600 text-sm mt-1">
              Direct dimensional and load comparison table for warehouse managers and engineers.
            </p>
          </div>

          {/* Quick Table Filters */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setTableFilter('all')}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase transition-colors ${
                tableFilter === 'all'
                  ? 'bg-brand-navy text-surface-sand'
                  : 'bg-surface-white border border-steel-200 text-steel-700'
              }`}
            >
              All (12)
            </button>
            <button
              onClick={() => setTableFilter('cantilever')}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase transition-colors ${
                tableFilter === 'cantilever'
                  ? 'bg-brand-navy text-surface-sand'
                  : 'bg-surface-white border border-steel-200 text-steel-700'
              }`}
            >
              Cantilever
            </button>
            <button
              onClick={() => setTableFilter('hopper')}
              className={`px-3 py-1.5 rounded-sm font-bold uppercase transition-colors ${
                tableFilter === 'hopper'
                  ? 'bg-brand-navy text-surface-sand'
                  : 'bg-surface-white border border-steel-200 text-steel-700'
              }`}
            >
              Hopper
            </button>
          </div>
        </div>

        {/* The Matrix Table */}
        <div className="bg-surface-white border border-steel-200 rounded-sm overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-navy text-surface-white font-bold uppercase border-b border-brand-navyDark">
              <tr>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Model Description</th>
                <th className="py-3.5 px-4">Footprint (L×W×H)</th>
                <th className="py-3.5 px-4">SWL</th>
                <th className="py-3.5 px-4">Weight</th>
                <th className="py-3.5 px-4">Ex. VAT</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-200">
              {filteredForTable.map((p) => {
                const price = formatBothPrices(p.basePriceExVatPence);
                return (
                  <tr key={p.id} className="hover:bg-surface-sand/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stillage-blue whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-steel-900 max-w-xs">
                      <div className="font-bold text-brand-navy">{p.title}</div>
                      <div className="text-[11px] text-steel-500 font-mono truncate">{p.categoryName}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-steel-700">
                      {p.externalLengthMm}×{p.externalWidthMm}×{p.externalHeightMm}mm
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-surface-sand text-brand-navy px-2 py-0.5 rounded font-bold">
                        {p.swlKg}kg
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-steel-600">
                      {p.unitWeightKg}kg
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-brand-navy">
                      {price.primary}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/products/${p.slug}`}
                        className="bg-stillage-blue hover:bg-stillage-blueDark text-white px-3 py-1.5 rounded-sm font-display font-bold uppercase tracking-wider text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Configure</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
