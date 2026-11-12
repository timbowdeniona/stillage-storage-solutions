'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { BlogPost, Product } from '@/types/catalog';
import { ProductCard } from '@/components/ProductCard';
import { BlogCard } from '@/components/BlogCard';

interface Approach1Props {
  products: Product[];
  featuredPosts?: BlogPost[];
}

export function Approach1HomePage({ products, featuredPosts = [] }: Approach1Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: `All ${products.length} Core Models`, count: products.length },
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
    <div className="bg-surface-white min-h-screen text-steel-900">
      {/* Hero Section — Clean, Uncluttered, High Contrast (Zero Cream) */}
      <section className="bg-brand-navy text-surface-white relative overflow-hidden border-b-4 border-stillage-blue py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-white font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                <span>Direct UK Factory Steel Fabrication</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.03]">
                Heavy-Duty Steel Stillages,{' '}
                <span className="text-stillage-sky">Racks &amp; Post Pallets</span>
              </h1>

              <p className="text-steel-200 text-base sm:text-lg leading-relaxed max-w-xl">
                Precision-engineered in British box-section steel for high-density warehouse storage and rough-terrain handling. Core models in stock with instant online pricing and certified SWL ratings.
              </p>

              {/* 3 Streamlined Trust Tags */}
              <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                  <span>Up to 1,500kg Certified SWL</span>
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
                  <span>Explore All Models</span>
                  <ChevronDown className="w-5 h-5" />
                </a>
                <Link
                  href="/products"
                  className="bg-surface-white hover:bg-steel-100 text-brand-navy font-display font-bold uppercase tracking-wider text-base px-6 py-3.5 rounded-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>Full Spec Filter</span>
                  <ArrowRight className="w-4 h-4 text-stillage-blue" />
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Stage — Crisp White Studio Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-surface-white p-8 rounded-sm border-2 border-stillage-blue/40 shadow-2xl flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between text-xs font-mono text-steel-600 pb-3 mb-4 border-b border-steel-200">
                  <span className="font-bold text-brand-navy">FLAGSHIP: SSS-CANT-3B8A</span>
                  <span className="bg-brand-navy text-white px-2.5 py-0.5 rounded-sm font-bold text-[11px]">
                    1,500kg SWL
                  </span>
                </div>
                <img
                  src="/images/products/cantilever-rack-cutout.png"
                  alt="3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack"
                  fetchPriority="high"
                  className="w-full h-64 object-contain"
                  width={460}
                  height={320}
                />
                <div className="w-full pt-3 mt-4 border-t border-steel-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-steel-600 font-bold">2400 × 1100 × 1450mm</span>
                  <Link
                    href="/products/3-bay-double-sided-cantilever-bar-rack"
                    className="text-stillage-blue font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Configure Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
              DIRECT UK FACTORY RANGE
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
              Select Your Stillage Specification
            </h2>
            <p className="text-steel-600 text-sm mt-1">
              Showing {filteredProducts.length} British-manufactured steel stillages with live trade pricing and CAD drawings on hover.
            </p>
          </div>

          <Link
            href="/workshop"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white hover:bg-stillage-blue rounded-sm font-mono text-xs uppercase font-bold transition-colors shrink-0"
          >
            <Wrench className="w-4 h-4 text-accent-teal" />
            <span>Interactive Workshop Stack Builder</span>
          </Link>
        </div>

        {/* Category Filter Pills (All on one clean line) */}
        <div
          role="tablist"
          aria-label="Filter stillages by category"
          className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-steel-200"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-sm font-mono text-xs uppercase font-bold tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stillage-blue text-white shadow-xs'
                  : 'bg-steel-50 text-steel-800 hover:bg-steel-100 border border-steel-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* 3-Column Clean Product Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 3} />
          ))}
        </div>
      </section>

      {/* Streamlined Technical Engineering Guides Section */}
      {featuredPosts.length > 0 && (
        <section className="bg-steel-50 border-y border-steel-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>TECHNICAL COMPLIANCE &amp; BUYING GUIDES</span>
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
                  Stillage Engineering &amp; Safety Standards
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-sm text-stillage-blue hover:text-brand-navy"
              >
                <span>View All Technical Guides</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clean Bespoke Fabrication & Technical Assistance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-brand-navy text-surface-white p-8 sm:p-10 rounded-sm border-l-8 border-stillage-blue grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg">
          <div className="lg:col-span-8 space-y-3">
            <div className="font-mono text-xs uppercase text-stillage-sky font-bold">
              CUSTOM STEEL FABRICATION &amp; BULK RUNS
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wide">
              Need Non-Standard Dimensions, Higher SWL or Corporate RAL Paint?
            </h2>
            <p className="text-steel-200 text-sm leading-relaxed max-w-2xl">
              We design and manufacture custom sheet steel bins, LOLER crane-rated cages, and heavy-duty bar storage racks to exact client blueprints at our UK works.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="mailto:sales@stillagestoragesolutions.co.uk"
              className="bg-stillage-blue hover:bg-stillage-blueLight text-white text-center font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm text-sm transition-colors"
            >
              Request Custom CAD Quote
            </a>
            <a
              href="tel:01978800500"
              className="bg-surface-white hover:bg-steel-100 text-brand-navy text-center font-mono font-bold py-3 px-6 rounded-sm text-xs transition-colors"
            >
              Call Engineering: 01978 800 500
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
