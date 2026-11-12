'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  Truck,
  PhoneCall,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { useVat } from '@/context/VatContext';
import { SEED_PRODUCTS } from '@/data/seedCatalog';
import { searchProductsWithAlgolia } from '@/lib/algolia';
import { AlgoliaArticleRecord, ParsedSearchIntent, Product } from '@/types/catalog';
import { AlgoliaHighlight } from '@/components/AlgoliaHighlight';

export function Header() {
  const { showIncVat, setShowIncVat, basket, formatPrice, formatBothPrices } = useVat();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [instantHits, setInstantHits] = useState<Product[]>([]);
  const [instantArticles, setInstantArticles] = useState<AlgoliaArticleRecord[]>([]);
  const [instantIntent, setInstantIntent] = useState<ParsedSearchIntent>({
    cleanedQuery: '',
    intentBadges: [],
  });
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // 180ms keystroke debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setInstantHits([]);
      setInstantArticles([]);
      setInstantIntent({ cleanedQuery: '', intentBadges: [] });
      return;
    }

    let active = true;
    searchProductsWithAlgolia(SEED_PRODUCTS, {
      query: debouncedQuery,
      includeArticles: true,
    }).then((res) => {
      if (active) {
        setInstantHits(res.hits.slice(0, 4));
        setInstantArticles(res.articleHits.slice(0, 2));
        setInstantIntent(res.parsedIntent);
      }
    });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setAutocompleteOpen(false);
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
  };

  // Modern Web Guidance (ime-safe-enter-submit): guard custom keydown handler against IME composition
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setAutocompleteOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) {
        e.preventDefault();
        return;
      }
    }
  };

  const showDropdown = autocompleteOpen && debouncedQuery.length > 0;

  const totalUnits = basket.reduce((acc, item) => acc + item.quantity, 0);
  const totalExVat = basket.reduce((acc, item) => acc + item.lineTotalExVatPence, 0);

  return (
    <header className="sticky top-0 z-40 bg-brand-navy text-surface-white border-b border-brand-navyLight shadow-md">
      {/* Top Industrial Utility Strip */}
      <div className="bg-brand-navyDark border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-steel-200">
            <span className="inline-flex items-center gap-1.5 font-medium text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
              UK Manufactured Heavy-Gauge Steel Stillages
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-steel-200">
              <Truck className="w-3.5 h-3.5 text-stillage-sky" />
              48–72hr Nationwide HGV Pallet Delivery
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:01978800500"
              className="hidden sm:inline-flex items-center gap-1.5 text-steel-200 hover:text-white transition-colors font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5 text-stillage-sky" />
              Trade Desk: 01978 800 500
            </a>

            {/* Global B2B / B2C VAT Switcher */}
            <div
              className="inline-flex items-center bg-brand-navy p-0.5 rounded border border-white/15"
              role="group"
              aria-label="VAT display mode"
            >
              <button
                type="button"
                onClick={() => setShowIncVat(false)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm transition-colors ${
                  !showIncVat
                    ? 'bg-stillage-blue text-white font-bold'
                    : 'text-steel-200 hover:text-white'
                }`}
              >
                Ex. VAT
              </button>
              <button
                type="button"
                onClick={() => setShowIncVat(true)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm transition-colors ${
                  showIncVat
                    ? 'bg-stillage-blue text-white font-bold'
                    : 'text-steel-200 hover:text-white'
                }`}
              >
                Inc. VAT (20%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Standalone Stillage Storage Solutions Emblem */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-11 h-11 rounded bg-stillage-blue border-2 border-white/30 flex items-center justify-center shadow-inner group-hover:bg-stillage-blueLight transition-colors">
              <svg
                viewBox="0 0 40 40"
                className="w-7 h-7 text-surface-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 14L20 5L35 14" strokeLinecap="square" />
                <rect x="8" y="16" width="24" height="16" strokeWidth="2.2" />
                <path d="M14 16V32M26 16V32M8 24H32" strokeWidth="1.8" />
                <path d="M6 34H12M28 34H34" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </div>
            <div>
              <div className="font-slab font-bold text-lg sm:text-xl tracking-tight text-surface-white leading-none">
                STILLAGE STORAGE
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-stillage-sky">
                  SOLUTIONS UK
                </span>
                <span className="h-3 w-0.5 bg-accent-teal inline-block" />
                <span className="font-mono text-[10px] text-steel-200 hidden sm:inline">
                  stillagestoragesolutions.co.uk
                </span>
              </div>
            </div>
          </Link>

          {/* Clean Instant Search Bar */}
          <form
            ref={searchContainerRef}
            onSubmit={handleSearch}
            autoComplete="off"
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <div className="relative flex w-full">
              <label htmlFor="header-algolia-search" className="sr-only">
                Search stillages, storage racks, and compliance guides
              </label>
              <input
                id="header-algolia-search"
                type="search"
                role="combobox"
                value={searchQuery}
                onFocus={() => setAutocompleteOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setAutocompleteOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="header-algolia-autocomplete"
                placeholder="Search by stillage type, SKU, SWL, or dimensions (e.g. 1200x1000)..."
                className="w-full bg-brand-navyDark text-white placeholder-steel-400 text-sm px-4 py-2.5 rounded-l border border-white/20 focus:outline-none focus:border-stillage-sky"
              />
              <button
                type="submit"
                className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider px-5 py-2.5 rounded-r border border-l-0 border-stillage-blue flex items-center gap-2 text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Instant Search Autocomplete Overlay */}
            {showDropdown && (
              <div
                id="header-algolia-autocomplete"
                role="region"
                aria-label="Instant search suggestions"
                className="absolute left-0 right-0 top-full mt-1.5 bg-surface-white text-steel-900 border-2 border-brand-navy shadow-2xl rounded-sm z-50 overflow-hidden"
              >
                {instantIntent.intentBadges.length > 0 && (
                  <div className="bg-steel-100 px-3.5 py-2 border-b border-steel-200 flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="inline-flex items-center gap-1 text-stillage-blue font-bold">
                      <Sparkles className="w-3 h-3" />
                      {instantIntent.intentBadges[0]}
                    </span>
                  </div>
                )}

                {instantHits.length === 0 && instantArticles.length === 0 ? (
                  <div className="p-4 text-xs text-steel-600 font-mono">
                    No direct SKU matches for &ldquo;{debouncedQuery}&rdquo; — press Enter to view full search results.
                  </div>
                ) : (
                  <div>
                    {instantHits.length > 0 && (
                      <div className="divide-y divide-steel-200">
                        {instantHits.map((hit) => {
                          const queryParams = new URLSearchParams();
                          if (instantIntent.suggestedFinishOption) {
                            queryParams.set('finish', instantIntent.suggestedFinishOption);
                          }
                          if (instantIntent.suggestedMobilityOption) {
                            queryParams.set('mobility', instantIntent.suggestedMobilityOption);
                          }
                          const qs = queryParams.toString();
                          const targetHref = `/products/${hit.slug}${qs ? `?${qs}` : ''}`;

                          return (
                            <Link
                              key={hit.id}
                              href={targetHref}
                              onClick={() => setAutocompleteOpen(false)}
                              className="p-3 hover:bg-steel-100/70 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={hit.primaryImage}
                                  alt={hit.title}
                                  width={44}
                                  height={44}
                                  className="w-11 h-11 object-contain bg-steel-50 p-1 rounded-sm border border-steel-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 font-mono text-[10px]">
                                    <span className="font-bold text-stillage-blue">
                                      <AlgoliaHighlight
                                        fallbackText={hit.sku}
                                        highlightField={hit._highlightResult?.sku}
                                      />
                                    </span>
                                    <span className="text-steel-400">•</span>
                                    <span className="text-brand-navy font-bold">
                                      {hit.swlKg}kg SWL
                                    </span>
                                    <span className="text-steel-400">•</span>
                                    <span className="text-steel-600">
                                      {hit.externalLengthMm}×{hit.externalWidthMm}mm
                                    </span>
                                  </div>
                                  <div className="font-display font-bold text-sm uppercase text-brand-navy truncate">
                                    <AlgoliaHighlight
                                      fallbackText={hit.title}
                                      highlightField={hit._highlightResult?.title}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="text-right font-mono shrink-0">
                                <div className="text-xs font-bold text-brand-navy">
                                  {formatBothPrices(hit.basePriceExVatPence).primary}
                                </div>
                                <div className="text-[10px] text-steel-600">
                                  {formatBothPrices(hit.basePriceExVatPence).label}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {instantArticles.length > 0 && (
                      <div className="border-t-2 border-steel-200 bg-steel-50">
                        <div className="px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold text-steel-600 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-stillage-blue" />
                          <span>Technical Engineering Guides</span>
                        </div>
                        <div className="divide-y divide-steel-200">
                          {instantArticles.map((art) => (
                            <Link
                              key={art.objectID}
                              href={`/blog/${art.slug}`}
                              onClick={() => setAutocompleteOpen(false)}
                              className="px-3.5 py-2.5 hover:bg-steel-100 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="font-display font-bold text-xs uppercase text-brand-navy truncate">
                                  <AlgoliaHighlight
                                    fallbackText={art.title}
                                    highlightField={art._highlightResult?.title}
                                  />
                                </div>
                                <div className="font-mono text-[10px] text-steel-600">
                                  {art.category} • {art.readingTimeMinutes} min read
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-stillage-blue shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-brand-navy text-white px-3.5 py-2 flex items-center justify-between text-xs font-mono">
                  <button
                    type="submit"
                    className="hover:underline inline-flex items-center gap-1.5 font-bold"
                  >
                    <span>View All Results for &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Right Actions: Workshop & Active Quote Basket */}
          <div className="flex items-center gap-3">
            <Link
              href="/workshop"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white/10 text-white hover:bg-stillage-blue border border-white/15 text-xs font-mono uppercase tracking-wider font-bold transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-accent-teal" />
              <span>Workshop</span>
            </Link>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-2.5 bg-surface-white text-brand-navy hover:bg-steel-100 px-3.5 py-2 rounded font-mono text-xs font-bold transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-stillage-blue" />
              <span>
                {totalUnits > 0
                  ? `${totalUnits} Unit${totalUnits > 1 ? 's' : ''} (${formatPrice(totalExVat)})`
                  : 'Order / Checkout'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded border border-white/20 text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Streamlined Category Navigation Bar */}
      <nav
        aria-label="Product categories"
        className="bg-brand-navyLight/60 border-t border-white/10 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-display uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Link
              href="/products"
              className="px-3.5 py-2.5 font-bold text-white hover:bg-stillage-blue/40 transition-colors"
            >
              All 12 Models
            </Link>
            <Link
              href="/products?category=cantilever-bar-racks"
              className="px-3.5 py-2.5 text-steel-200 hover:text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Cantilever Racks
            </Link>
            <Link
              href="/products?category=hopper-bin-stillages"
              className="px-3.5 py-2.5 text-steel-200 hover:text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Hopper Bins
            </Link>
            <Link
              href="/products?category=sheet-stillages"
              className="px-3.5 py-2.5 text-steel-200 hover:text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Solid Sheet &amp; Mesh
            </Link>
            <Link
              href="/products?category=post-pallets"
              className="px-3.5 py-2.5 text-steel-200 hover:text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Post Pallets
            </Link>
            <Link
              href="/blog"
              className="px-3.5 py-2.5 text-stillage-sky font-bold hover:bg-stillage-blue/40 transition-colors"
            >
              Technical Guides
            </Link>
          </div>
          <div className="text-[11px] font-mono text-steel-200 py-2">
            BULK DISCOUNTS: 5+ UNITS (-5%) | 10+ UNITS (-10%)
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navyDark border-t border-white/15 px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearch} autoComplete="off" className="flex">
            <label htmlFor="mobile-algolia-search" className="sr-only">
              Search stillages, SKUs, SWL
            </label>
            <input
              id="mobile-algolia-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              placeholder="Search stillages, SKUs, SWL..."
              className="w-full bg-brand-navy text-white text-sm px-3 py-2 rounded-l border border-white/20"
            />
            <button
              type="submit"
              className="bg-stillage-blue text-white px-4 py-2 rounded-r font-display uppercase text-sm font-bold"
            >
              Go
            </button>
          </form>
          <div className="grid grid-cols-1 gap-1.5 pt-2 font-display uppercase tracking-wider text-sm">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded bg-white/10 text-white font-bold"
            >
              All 12 Models
            </Link>
            <Link
              href="/products?category=cantilever-bar-racks"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5 text-steel-200"
            >
              Cantilever &amp; Bar Racks
            </Link>
            <Link
              href="/products?category=hopper-bin-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5 text-steel-200"
            >
              Stackable Hopper &amp; Bin Stillages
            </Link>
            <Link
              href="/products?category=sheet-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5 text-steel-200"
            >
              Solid Sheet &amp; Mesh Stillages
            </Link>
            <Link
              href="/products?category=post-pallets"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5 text-steel-200"
            >
              Demountable Post Pallets
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded bg-white/5 text-stillage-sky font-bold"
            >
              Technical Blog &amp; Engineering Guides
            </Link>
            <Link
              href="/workshop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded bg-stillage-blue text-white font-bold flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Workshop: Stack Builder</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
