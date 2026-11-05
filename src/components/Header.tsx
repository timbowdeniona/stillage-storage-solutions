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
  SlidersHorizontal,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useVat } from '@/context/VatContext';
import { SEED_PRODUCTS } from '@/data/seedCatalog';
import { searchProductsWithAlgolia } from '@/lib/algolia';
import { trackB2BEvent } from '@/lib/analytics';
import { ParsedSearchIntent, Product } from '@/types/catalog';

export function Header() {
  const { showIncVat, setShowIncVat, basket, formatPrice, formatBothPrices } = useVat();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [instantHits, setInstantHits] = useState<Product[]>([]);
  const [instantIntent, setInstantIntent] = useState<ParsedSearchIntent>({
    cleanedQuery: '',
    intentBadges: [],
  });
  const [instantEngine, setInstantEngine] = useState<'algolia-dsn' | 'algolia-local-replica'>(
    'algolia-local-replica'
  );
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setInstantHits([]);
      setInstantIntent({ cleanedQuery: '', intentBadges: [] });
      return;
    }

    let active = true;
    searchProductsWithAlgolia(SEED_PRODUCTS, { query: trimmed }).then((res) => {
      if (active) {
        setInstantHits(res.hits.slice(0, 4));
        setInstantIntent(res.parsedIntent);
        setInstantEngine(res.engine);
      }
    });

    return () => {
      active = false;
    };
  }, [searchQuery]);

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

  const showDropdown = autocompleteOpen && searchQuery.trim().length > 0;

  const totalUnits = basket.reduce((acc, item) => acc + item.quantity, 0);
  const totalExVat = basket.reduce((acc, item) => acc + item.lineTotalExVatPence, 0);

  return (
    <header className="sticky top-0 z-40 bg-brand-navy text-surface-white border-b border-brand-navyLight shadow-md">
      {/* Top Industrial Utility Strip */}
      <div className="bg-brand-navyDark border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-steel-200">
            <span className="inline-flex items-center gap-1.5 font-medium text-surface-sand">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
              UK Manufactured Heavy-Gauge Steel Stillages
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-steel-200">
              <Truck className="w-3.5 h-3.5 text-stillage-blueLight" />
              Nationwide HGV Pallet Delivery &amp; Tail-Lift Offloading
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:01978800500"
              onClick={() =>
                trackB2BEvent({
                  event: 'trade_contact_click',
                  contactMethod: 'phone',
                })
              }
              className="hidden sm:inline-flex items-center gap-1.5 text-steel-200 hover:text-surface-sand transition-colors font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5 text-accent-amber" />
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
            <div className="w-11 h-11 rounded bg-stillage-blue border-2 border-surface-sand/80 flex items-center justify-center shadow-inner group-hover:bg-stillage-blueLight transition-colors">
              {/* Architectural Steel Frame & Stacking Cup SVG */}
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
                <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-surface-sand">
                  SOLUTIONS UK
                </span>
                <span className="h-3 w-0.5 bg-accent-teal inline-block" />
                <span className="font-mono text-[10px] text-steel-200 hidden sm:inline">
                  stillagestoragesolutions.co.uk
                </span>
              </div>
            </div>
          </Link>

          {/* Algolia Instant Search Bar with Typeahead Autocomplete */}
          <form
            ref={searchContainerRef}
            onSubmit={handleSearch}
            autoComplete="off"
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <div className="relative flex w-full">
              <label htmlFor="header-algolia-search" className="sr-only">
                Search stillages and storage racks
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
                placeholder="Search by stillage type, SKU (e.g. SSS-CANT), dimensions or SWL..."
                className="w-full bg-brand-navyDark text-white placeholder-steel-400 text-sm px-4 py-2.5 rounded-l border border-white/20 focus:outline-none focus:border-surface-sand"
              />
              <button
                type="submit"
                className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider px-5 py-2.5 rounded-r border border-l-0 border-stillage-blue flex items-center gap-2 text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Instant Algolia Autocomplete Overlay */}
            {showDropdown && (
              <div
                id="header-algolia-autocomplete"
                role="region"
                aria-label="Instant Algolia search suggestions"
                className="absolute left-0 right-0 top-full mt-1.5 bg-surface-white text-steel-900 border-2 border-brand-navy shadow-2xl rounded-sm z-50 overflow-hidden"
              >
                <div className="bg-surface-sandLight px-3.5 py-2 border-b border-steel-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1.5 text-brand-navy font-bold">
                    <Database className="w-3.5 h-3.5 text-stillage-blue" />
                    {instantEngine === 'algolia-dsn'
                      ? 'Algolia Live InstantSearch'
                      : 'Algolia Instant Replica'}
                  </span>
                  {instantIntent.intentBadges.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-stillage-blue font-bold">
                      <Sparkles className="w-3 h-3" />
                      {instantIntent.intentBadges[0]}
                    </span>
                  )}
                </div>

                {instantHits.length === 0 ? (
                  <div className="p-4 text-xs text-steel-600 font-mono">
                    No direct SKU matches for &ldquo;{searchQuery}&rdquo; — press Enter to consult our AI Steel Stillage Engineer.
                  </div>
                ) : (
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
                          className="p-3 hover:bg-surface-sand/40 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={hit.primaryImage}
                              alt={hit.title}
                              width={44}
                              height={44}
                              className="w-11 h-11 object-contain bg-surface-sand p-1 rounded-sm border border-steel-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-mono text-[10px]">
                                <span className="font-bold text-stillage-blue">{hit.sku}</span>
                                <span className="text-steel-400">•</span>
                                <span className="text-brand-navy font-bold">{hit.swlKg}kg SWL</span>
                                <span className="text-steel-400">•</span>
                                <span className="text-steel-600">
                                  {hit.externalLengthMm}×{hit.externalWidthMm}mm
                                </span>
                              </div>
                              <div className="font-display font-bold text-sm uppercase text-brand-navy truncate">
                                {hit.title}
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

                <div className="bg-brand-navy text-surface-sand px-3.5 py-2 flex items-center justify-between text-xs font-mono">
                  <button
                    type="submit"
                    className="hover:underline inline-flex items-center gap-1.5 font-bold"
                  >
                    <span>View All Algolia Results for &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Right Actions: Catalog Filter & Active Quote Basket */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded border border-white/20 hover:border-surface-sand text-xs font-mono uppercase tracking-wider text-surface-sand transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Spec Finder
            </Link>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-2.5 bg-surface-sand text-brand-navy hover:bg-white px-3.5 py-2 rounded font-mono text-xs font-bold transition-colors"
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

      {/* Category Navigation Bar */}
      <nav
        aria-label="Product categories"
        className="bg-brand-navyLight/60 border-t border-white/10 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-display uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Link
              href="/products"
              className="px-3.5 py-2.5 font-bold text-surface-sand hover:bg-stillage-blue/40 transition-colors"
            >
              All Stillages &amp; Racks
            </Link>
            <Link
              href="/products?category=cantilever-bar-racks"
              className="px-3.5 py-2.5 text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Cantilever &amp; Bar Racks
            </Link>
            <Link
              href="/products?category=hopper-bin-stillages"
              className="px-3.5 py-2.5 text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Hopper &amp; Bin Stillages
            </Link>
            <Link
              href="/products?category=sheet-stillages"
              className="px-3.5 py-2.5 text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Solid Sheet Stillages
            </Link>
            <Link
              href="/products?category=mesh-stillages"
              className="px-3.5 py-2.5 text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Mesh Security Cages
            </Link>
            <Link
              href="/products?category=post-pallets"
              className="px-3.5 py-2.5 text-white hover:bg-stillage-blue/40 transition-colors"
            >
              Demountable Post Pallets
            </Link>
            <Link
              href="/blog"
              className="px-3.5 py-2.5 text-surface-sand font-bold hover:bg-stillage-blue/40 transition-colors"
            >
              Technical Blog &amp; Guides
            </Link>
          </div>
          <div className="text-[11px] font-mono text-surface-sand/90 py-2">
            BULK TIERS: 5+ UNITS (-5%) | 10+ UNITS (-10%)
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
              className="py-2 px-3 rounded bg-white/5 text-surface-sand font-bold"
            >
              All Stillages &amp; Racks
            </Link>
            <Link
              href="/products?category=cantilever-bar-racks"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5"
            >
              Cantilever &amp; Bar Racks
            </Link>
            <Link
              href="/products?category=hopper-bin-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5"
            >
              Stackable Hopper &amp; Bin Stillages
            </Link>
            <Link
              href="/products?category=sheet-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5"
            >
              Solid Sheet Steel Stillages
            </Link>
            <Link
              href="/products?category=mesh-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5"
            >
              Mesh Sided Stillages
            </Link>
            <Link
              href="/products?category=post-pallets"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded hover:bg-white/5"
            >
              Post Pallets &amp; Cradles
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded bg-white/5 text-surface-sand font-bold"
            >
              Technical Blog &amp; Engineering Guides
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
