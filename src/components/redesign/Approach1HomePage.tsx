'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    { id: 'all', label: 'All', count: products.length },
    {
      id: 'cantilever-bar-racks',
      label: 'Cantilever Racks',
      count: products.filter((p) => p.categorySlug.includes('cantilever')).length,
    },
    {
      id: 'hopper-bin-stillages',
      label: 'Hopper Stillages',
      count: products.filter((p) => p.categorySlug.includes('hopper')).length,
    },
    {
      id: 'sheet-mesh',
      label: 'Solid & Mesh Cages',
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
    <div className="bg-steel-50 min-h-screen text-steel-900">
      {/* Option 1 Hero Banner */}
      <section className="bg-brand-navy text-surface-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline & Single Focused CTA */}
            <div className="lg:col-span-7">
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[56px] tracking-tight leading-[1.06] text-surface-white">
                Heavy-Duty Steel Stillages.
                <br />
                Built in the UK. Delivered Fast.
              </h1>

              <p className="font-display text-xl sm:text-2xl text-steel-100 mt-4 font-normal">
                {products.length} precision-engineered standard models in stock for rapid dispatch.
              </p>

              <div className="mt-7">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center bg-stillage-blue hover:bg-stillage-blueLight text-surface-white font-display font-bold text-lg px-7 py-3 rounded-md shadow-sm transition-colors"
                >
                  Explore All {products.length} Models
                </a>
              </div>
            </div>

            {/* Right Hero Stillage Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-surface-white rounded-xl p-6 shadow-xl flex items-center justify-center">
                <img
                  src="/images/products/base-render-sss-cant-3b8a.jpg"
                  alt="Heavy-Duty Cantilever Bar Rack"
                  fetchPriority="high"
                  className="w-full h-60 object-contain"
                  width={460}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Option 1 Pill Filter Bar & Direct Catalog Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Rounded-Full Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter stillages by category"
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-display font-bold text-base transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stillage-blue text-surface-white shadow-xs'
                  : 'bg-surface-white text-brand-navy border border-steel-200 hover:border-stillage-blue'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Clean 4-Column Product Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Clean Technical Guides Row */}
      {featuredPosts.length > 0 && (
        <section className="bg-surface-white border-t border-steel-200 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="font-display font-bold text-3xl text-brand-navy">
                  Technical Guides &amp; Safety Standards
                </h2>
                <p className="text-steel-600 text-sm mt-1">
                  UK engineering guides covering SWL ratings, PUWER compliance, and finish selection.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-display font-bold text-base text-stillage-blue hover:text-brand-navy"
              >
                <span>View All Guides</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
