'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Product } from '@/types/catalog';
import { useVat } from '@/context/VatContext';
import { RedesignBanner } from '@/components/RedesignBanner';

interface Approach1Props {
  products: Product[];
}

export function Approach1HomePage({ products }: Approach1Props) {
  const { formatBothPrices } = useVat();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All 12 Core Models', count: products.length },
    {
      id: 'cantilever-bar-racks',
      label: 'Cantilever Racks',
      count: products.filter((p) => p.categorySlug.includes('cantilever')).length,
    },
    {
      id: 'hopper-bin-stillages',
      label: 'Hopper & Bin Stillages',
      count: products.filter((p) => p.categorySlug.includes('hopper')).length,
    },
    {
      id: 'sheet-mesh',
      label: 'Solid Sheet & Mesh Cages',
      count: products.filter(
        (p) => p.categorySlug.includes('sheet') || p.categorySlug.includes('mesh')
      ).length,
    },
    {
      id: 'post-pallets',
      label: 'Post Pallets',
      count: products.filter((p) => p.categorySlug.includes('post')).length,
    },
  ];

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'sheet-mesh') {
      return (
        product.categorySlug.includes('sheet') ||
        product.categorySlug.includes('mesh')
      );
    }
    return product.categorySlug.includes(selectedCategory);
  });

  return (
    <div className="bg-surface-sandLight min-h-screen text-steel-900">
      <RedesignBanner
        currentApproach={1}
        title="Approach 1: Clean Industrial Catalog & Visual Grid"
        tagline="Zero clutter, instant 12-product visibility, modern e-commerce"
      />

      {/* Hero Section — Clean, Uncluttered, High Contrast */}
      <section className="bg-brand-navy text-surface-white relative overflow-hidden border-b-4 border-stillage-blue py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                <span>UK Heavy-Gauge Steel Fabrication</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.03]">
                Heavy-Duty Steel Stillages,{' '}
                <span className="text-surface-sand">Racks &amp; Post Pallets</span>
              </h1>

              <p className="text-steel-200 text-base sm:text-lg leading-relaxed max-w-xl">
                Precision-engineered in British box-section steel for high-density warehouse storage and rough-terrain handling. 12 core models in stock with instant online pricing and certified SWL ratings.
              </p>

              {/* 3 Streamlined Trust Tags (No nested metric boxes) */}
              <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-surface-sand">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                  <span>Up to 1,500kg SWL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                  <span>48–72hr HGV Pallet Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                  <span>Standard RAL 5010 Blue</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <a
                  href="#catalog"
                  className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider text-base px-8 py-3.5 rounded-sm inline-flex items-center gap-2.5 shadow-lg transition-colors"
                >
                  <span>Explore 12 Core Models</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </a>
                <a
                  href="mailto:sales@stillagestoragesolutions.co.uk"
                  className="bg-surface-sand hover:bg-white text-brand-navy font-display font-bold uppercase tracking-wider text-base px-6 py-3.5 rounded-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>Request Custom CAD Quote</span>
                </a>
              </div>
            </div>

            {/* Right Hero Visual Stage — Single Focused Showcase (No nested boxes) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-surface-sand/15 p-8 rounded-full border-2 border-surface-sand/30 flex items-center justify-center">
                <img
                  src="/images/products/cantilever-rack-cutout.png"
                  alt="Flagship Double-Sided Cantilever Rack"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  width={460}
                  height={340}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section — Generous Whitespace, Direct Product Access */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
              DIRECT FACTORY CATALOGUE
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
              Select Your Stillage Model
            </h2>
            <p className="text-steel-600 text-sm mt-1">
              Showing {filteredProducts.length} certified British-made stillages with live trade pricing.
            </p>
          </div>

          {/* Quick VAT Switcher Reminder or Spec Filter */}
          <Link
            href="/workshop"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-surface-sand hover:bg-stillage-blue rounded-sm font-mono text-xs uppercase font-bold transition-colors"
          >
            <Wrench className="w-4 h-4 text-accent-teal" />
            <span>Interactive Workshop Configurator</span>
          </Link>
        </div>

        {/* Category Filter Pills (All on one clean line) */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-steel-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-sm font-mono text-xs uppercase font-bold tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stillage-blue text-white shadow-md'
                  : 'bg-surface-white text-steel-700 hover:bg-surface-sand/50 border border-steel-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* 3-Column Clean Product Card Grid (No clutter) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const price = formatBothPrices(product.basePriceExVatPence);
            return (
              <div
                key={product.id}
                className="bg-surface-white border border-steel-200 hover:border-stillage-blue rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-200 group"
              >
                {/* Product Image Stage */}
                <div>
                  <div className="relative h-60 bg-surface-sand/30 group-hover:bg-surface-sand/50 p-6 flex items-center justify-center border-b border-steel-200 transition-colors">
                    <span className="absolute top-3 left-3 bg-brand-navy text-surface-sand font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                      {product.sku}
                    </span>
                    <span className="absolute top-3 right-3 bg-stillage-blue text-white font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                      {product.swlKg}kg SWL
                    </span>
                    <img
                      src={product.primaryImage}
                      alt={product.title}
                      loading="lazy"
                      width={320}
                      height={240}
                      className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-6">
                    <div className="font-mono text-[11px] text-steel-500 uppercase tracking-wider">
                      {product.categoryName}
                    </div>
                    <h3 className="font-display font-bold text-lg uppercase text-brand-navy mt-1 group-hover:text-stillage-blue transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-steel-600 mt-2 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Key Technical Dimensions */}
                    <div className="mt-4 pt-4 border-t border-steel-100 grid grid-cols-2 gap-2 text-xs font-mono text-steel-700">
                      <div>
                        <span className="text-steel-400 block text-[10px] uppercase">Dimensions</span>
                        <span className="font-bold">
                          {product.externalLengthMm}×{product.externalWidthMm}mm
                        </span>
                      </div>
                      <div>
                        <span className="text-steel-400 block text-[10px] uppercase">Stacking</span>
                        <span className="font-bold">{product.stackableHeight}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action & Price */}
                <div className="p-6 bg-surface-sandLight/50 border-t border-steel-200 flex items-center justify-between gap-4">
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
                    className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Configure</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Bespoke Fabrication & Technical Assistance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-brand-navy text-surface-white p-8 sm:p-10 rounded-sm border-l-8 border-stillage-blue grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg">
          <div className="lg:col-span-8 space-y-3">
            <div className="font-mono text-xs uppercase text-surface-sand font-bold">
              BESPOKE STEEL FABRICATION
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wide">
              Need Non-Standard Dimensions, Higher SWL or Corporate Paint?
            </h2>
            <p className="text-steel-200 text-sm leading-relaxed max-w-2xl">
              We design and manufacture custom sheet steel bins, crane-rated cages, and heavy-duty bar storage racks to exact client blueprints at our Wrexham works.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="mailto:sales@stillagestoragesolutions.co.uk"
              className="bg-surface-sand hover:bg-white text-brand-navy text-center font-display font-bold uppercase tracking-wider py-3 px-6 rounded-sm text-sm transition-colors"
            >
              Request Custom CAD Quote
            </a>
            <a
              href="tel:01978800500"
              className="border border-white/20 hover:border-white text-white text-center font-mono py-2.5 px-6 rounded-sm text-xs transition-colors"
            >
              Call Engineering: 01978 800 500
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
