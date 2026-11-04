import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
  Wrench,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { getCategories, getFeaturedBlogPosts, getProducts } from '@/lib/contentful';
import { ProductCard } from '@/components/ProductCard';
import { BlogCard } from '@/components/BlogCard';

export default async function HomePage() {
  const [categories, products, featuredPosts] = await Promise.all([
    getCategories(),
    getProducts(),
    getFeaturedBlogPosts(3),
  ]);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-navy text-surface-white relative overflow-hidden border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                <span>Direct UK Factory Steel Fabrication</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.03]">
                Heavy-Duty Steel{' '}
                <span className="text-surface-sand">Stillages, Racks</span> &amp; Post Pallets
              </h1>

              <p className="text-steel-200 text-base sm:text-lg leading-relaxed max-w-xl">
                Engineered in British box-section steel for high-density warehouse stacking, bar &amp; tube storage, and site materials handling. Configure finishes, castors, and bulk trade tiers online.
              </p>

              {/* Key Engineering Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-y border-white/15 py-4 font-mono">
                <div>
                  <div className="text-surface-sand font-bold text-xl sm:text-2xl">1,500kg</div>
                  <div className="text-[11px] text-steel-200 uppercase">Certified SWL Ratings</div>
                </div>
                <div>
                  <div className="text-surface-sand font-bold text-xl sm:text-2xl">RAL 5010</div>
                  <div className="text-[11px] text-steel-200 uppercase">Standard Stillage Blue</div>
                </div>
                <div>
                  <div className="text-surface-sand font-bold text-xl sm:text-2xl">48–72hr</div>
                  <div className="text-[11px] text-steel-200 uppercase">UK HGV Pallet Dispatch</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider text-base px-7 py-3.5 rounded-sm inline-flex items-center gap-2.5 shadow-lg transition-colors"
                >
                  <span>Shop All Stillages</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products?category=cantilever-bar-racks"
                  className="bg-surface-sand hover:bg-white text-brand-navy font-display font-bold uppercase tracking-wider text-base px-6 py-3.5 rounded-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>Cantilever Racks</span>
                </Link>
              </div>
            </div>

            {/* Right Dual Showcase Stage on Warm Workshop Sand (#F2E3CE) */}
            <div className="lg:col-span-6">
              <div className="bg-surface-sand text-steel-900 p-6 sm:p-8 rounded-sm border-2 border-surface-sandDark shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-brand-navy/15 pb-3 mb-4 font-mono text-xs">
                  <span className="font-bold text-brand-navy uppercase">
                    FEATURED SPECIFICATION: SSS-CANT-3B8A
                  </span>
                  <span className="bg-brand-navy text-surface-sand px-2.5 py-0.5 font-bold rounded-sm">
                    1,500kg SWL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 h-64 sm:h-72 flex items-center justify-center">
                    <img
                      src="/images/products/cantilever-rack-cutout.png"
                      alt="3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack"
                      fetchPriority="high"
                      width={520}
                      height={380}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <div className="sm:col-span-4 bg-surface-white/90 border border-brand-navy/15 p-3 rounded-sm flex flex-col items-center text-center">
                    <img
                      src="/images/products/stacked-hopper-stillage.png"
                      alt="Modular 4-Tier Stackable Hopper & Bin Stillage System"
                      fetchPriority="low"
                      loading="lazy"
                      width={220}
                      height={260}
                      className="h-36 object-contain"
                    />
                    <div className="font-display font-bold uppercase text-xs text-brand-navy mt-2">
                      4-Tier Modular Hopper System
                    </div>
                    <Link
                      href="/products/modular-4-tier-stackable-hopper-bin-stillage"
                      className="mt-1.5 font-mono text-[11px] font-bold text-stillage-blue hover:underline"
                    >
                      View Spec &rarr;
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-navy/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-brand-navy font-bold">
                    2400(L) × 1100(W) × 1450(H) mm | 24 Load Arms
                  </span>
                  <Link
                    href="/products/3-bay-double-sided-cantilever-bar-rack"
                    className="bg-stillage-blue text-white px-3.5 py-1.5 rounded-sm font-bold hover:bg-stillage-blueDark transition-colors"
                  >
                    Configure Rack &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Blueprint Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
              CONTENTFUL MANAGED CATALOG
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
              Engineered Storage Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-sm text-stillage-blue hover:text-brand-navy"
          >
            <span>Browse Full Algolia Product Index</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group border border-steel-200 hover:border-stillage-blue bg-surface-white flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
            >
              <div>
                <div className="h-48 bg-surface-sand/60 group-hover:bg-surface-sand p-6 flex items-center justify-center relative border-b border-steel-200 transition-colors">
                  {cat.badgeText && (
                    <span className="absolute top-3 right-3 bg-brand-navy text-surface-sand font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm">
                      {cat.badgeText}
                    </span>
                  )}
                  <img
                    src={cat.imageUrl || '/images/products/cantilever-rack-cutout.png'}
                    alt={cat.title}
                    loading="lazy"
                    width={320}
                    height={220}
                    className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-xl uppercase text-brand-navy group-hover:text-stillage-blue transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-steel-600 mt-2 leading-relaxed">{cat.description}</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-surface-sandLight border-t border-steel-200 flex items-center justify-between font-mono text-xs font-bold text-stillage-blue">
                <span>Explore Specifications</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stillages Section */}
      <section className="bg-surface-sandLight border-y border-steel-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
                DIRECT FROM WORKS
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
                Featured Stillages &amp; Racks
              </h2>
            </div>
            <Link
              href="/products"
              className="bg-brand-navy text-surface-sand hover:bg-stillage-blue px-5 py-2.5 rounded-sm font-display font-bold uppercase tracking-wider text-xs inline-flex items-center gap-2 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter by SWL &amp; Footprint</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Technical Blog & Engineering Guides Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-b border-steel-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
              CONTENTFUL BLOG &amp; KNOWLEDGE BASE
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-brand-navy mt-1">
              Technical Stillage Guides &amp; Safety Standards
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-wider text-sm text-stillage-blue hover:text-brand-navy"
          >
            <span>View All Engineering Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Bespoke Industrial Fabrication & Bulk Order Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-brand-navy text-surface-white p-8 sm:p-10 border-l-8 border-stillage-blue grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="font-mono text-xs uppercase text-surface-sand">
              CUSTOM STEEL FABRICATION &amp; BULK RUNS
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide">
              Built to Your Exact Footprint, SWL &amp; Corporate RAL Colour
            </h2>
            <p className="text-steel-200 text-sm sm:text-base leading-relaxed max-w-2xl">
              Alongside our standard online range, Stillage Storage Solutions designs and fabricates custom sheet stillages, automotive component racks, and LOLER-certified crane-lift cages.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-surface-sand">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                <span>5% Off 5+ Units Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                <span>10% Off 10+ Units Online</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                <span>Instant B2B VAT Proformas</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/products"
              className="bg-stillage-blue hover:bg-stillage-blueLight text-white text-center font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm text-sm transition-colors"
            >
              Configure Standard Stillages
            </Link>
            <a
              href="mailto:sales@stillagestoragesolutions.co.uk"
              className="bg-surface-sand hover:bg-white text-brand-navy text-center font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm text-sm transition-colors"
            >
              Request Custom CAD Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
