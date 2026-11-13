'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Phone,
  ShoppingCart,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { useVat } from '@/context/VatContext';
import { SEED_PRODUCTS } from '@/data/seedCatalog';
import { searchProductsWithAlgolia } from '@/lib/algolia';
import { AlgoliaArticleRecord, ParsedSearchIntent, Product } from '@/types/catalog';
import { AlgoliaHighlight } from '@/components/AlgoliaHighlight';
import { FEATURES } from '@/lib/features';

export function Header() {
  const { showIncVat, setShowIncVat, basket, formatPrice, formatBothPrices } = useVat();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [instantHits, setInstantHits] = useState<Product[]>([]);
  const [instantArticles, setInstantArticles] = useState<AlgoliaArticleRecord[]>([]);
  const [instantIntent, setInstantIntent] = useState<ParsedSearchIntent>({
    cleanedQuery: '',
    intentBadges: [],
  });
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
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
      includeArticles: FEATURES.enableBlogGuides,
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
      if (
        productsMenuRef.current &&
        !productsMenuRef.current.contains(e.target as Node)
      ) {
        setProductsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setAutocompleteOpen(false);
    setSearchOpen(false);
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
  };

  // Modern Web Guidance (ime-safe-enter-submit): guard custom keydown handler against IME composition
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setAutocompleteOpen(false);
      setSearchOpen(false);
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
    <header className="sticky top-0 z-40 bg-surface-white text-brand-navy border-b border-steel-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Left: Option 1 Stacked Brand Logo + Navigation Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex flex-col shrink-0 group">
            <span className="font-display font-extrabold text-3xl sm:text-[34px] tracking-tight text-brand-navy leading-[0.85] uppercase">
              STILLAGE
            </span>
            <span className="font-display font-bold text-[11px] sm:text-xs tracking-[0.08em] text-brand-navy uppercase mt-0.5">
              STORAGE SOLUTIONS
            </span>
          </Link>

          {/* Clean Option 1 Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-7">
            <div ref={productsMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProductsMenuOpen((prev) => !prev)}
                aria-expanded={productsMenuOpen}
                className="inline-flex items-center gap-1 font-display font-bold text-lg text-brand-navy hover:text-stillage-blue transition-colors"
              >
                <span>Products</span>
                <ChevronDown className="w-4 h-4 text-brand-navy" />
              </button>

              {productsMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-surface-white border border-steel-200 rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/products"
                    onClick={() => setProductsMenuOpen(false)}
                    className="block px-4 py-2 font-display font-bold text-base text-brand-navy hover:bg-steel-50 hover:text-stillage-blue"
                  >
                    All 12 Models
                  </Link>
                  <Link
                    href="/products?category=cantilever-bar-racks"
                    onClick={() => setProductsMenuOpen(false)}
                    className="block px-4 py-2 font-display font-medium text-base text-steel-800 hover:bg-steel-50 hover:text-stillage-blue"
                  >
                    Cantilever Racks (3)
                  </Link>
                  <Link
                    href="/products?category=hopper-bin-stillages"
                    onClick={() => setProductsMenuOpen(false)}
                    className="block px-4 py-2 font-display font-medium text-base text-steel-800 hover:bg-steel-50 hover:text-stillage-blue"
                  >
                    Hopper Stillages (3)
                  </Link>
                  <Link
                    href="/products?category=sheet-stillages"
                    onClick={() => setProductsMenuOpen(false)}
                    className="block px-4 py-2 font-display font-medium text-base text-steel-800 hover:bg-steel-50 hover:text-stillage-blue"
                  >
                    Solid &amp; Mesh Cages (4)
                  </Link>
                  <Link
                    href="/products?category=post-pallets"
                    onClick={() => setProductsMenuOpen(false)}
                    className="block px-4 py-2 font-display font-medium text-base text-steel-800 hover:bg-steel-50 hover:text-stillage-blue"
                  >
                    Post Pallets (2)
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/workshop"
              className="font-display font-bold text-lg text-brand-navy hover:text-stillage-blue transition-colors"
            >
              Custom Fab
            </Link>

            {FEATURES.enableBlogGuides && (
              <Link
                href="/blog"
                className="font-display font-bold text-lg text-brand-navy hover:text-stillage-blue transition-colors"
              >
                About &amp; Guides
              </Link>
            )}

            <a
              href="mailto:sales@stillagestoragesolutions.co.uk"
              className="font-display font-bold text-lg text-brand-navy hover:text-stillage-blue transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Right: Search, Phone, VAT Toggle & Quote Basket Button */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Compact Instant Search */}
          <form
            ref={searchContainerRef}
            onSubmit={handleSearch}
            autoComplete="off"
            className="hidden md:flex items-center relative"
          >
            {searchOpen ? (
              <div className="flex items-center">
                <label htmlFor="header-algolia-search" className="sr-only">
                  Search stillages, storage racks, and compliance guides
                </label>
                <input
                  id="header-algolia-search"
                  type="search"
                  role="combobox"
                  autoFocus
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
                  placeholder="Search SKU, SWL or size..."
                  className="w-56 bg-steel-50 text-brand-navy placeholder-steel-400 text-sm px-3.5 py-2 rounded-l-md border border-steel-200 focus:outline-none focus:border-stillage-blue"
                />
                <button
                  type="submit"
                  className="bg-stillage-blue hover:bg-stillage-blueLight text-white px-3 py-2 rounded-r-md border border-stillage-blue"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-brand-navy hover:text-stillage-blue rounded-md hover:bg-steel-50 transition-colors"
                aria-label="Open product search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Instant Search Autocomplete Overlay */}
            {showDropdown && (
              <div
                id="header-algolia-autocomplete"
                role="region"
                aria-label="Instant search suggestions"
                className="absolute right-0 top-full mt-2 w-96 bg-surface-white text-steel-900 border border-steel-200 shadow-2xl rounded-lg z-50 overflow-hidden"
              >
                {instantIntent.intentBadges.length > 0 && (
                  <div className="bg-steel-50 px-3.5 py-2 border-b border-steel-200 flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="inline-flex items-center gap-1 text-stillage-blue font-bold">
                      <Sparkles className="w-3 h-3" />
                      {instantIntent.intentBadges[0]}
                    </span>
                  </div>
                )}

                {instantHits.length === 0 && instantArticles.length === 0 ? (
                  <div className="p-4 text-xs text-steel-600 font-mono">
                    No direct SKU matches for &ldquo;{debouncedQuery}&rdquo; — press Enter to view all results.
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
                              onClick={() => {
                                setAutocompleteOpen(false);
                                setSearchOpen(false);
                              }}
                              className="p-3 hover:bg-steel-50 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={hit.primaryImage}
                                  alt={hit.title}
                                  width={44}
                                  height={44}
                                  className="w-11 h-11 object-contain bg-surface-white p-1 rounded border border-steel-200 shrink-0"
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
                                  </div>
                                  <div className="font-display font-bold text-sm text-brand-navy truncate">
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

                    {FEATURES.enableBlogGuides && instantArticles.length > 0 && (
                      <div className="border-t border-steel-200 bg-steel-50">
                        <div className="px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold text-steel-600 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-stillage-blue" />
                          <span>Technical Guides</span>
                        </div>
                        <div className="divide-y divide-steel-200">
                          {instantArticles.map((art) => (
                            <Link
                              key={art.objectID}
                              href={`/blog/${art.slug}`}
                              onClick={() => {
                                setAutocompleteOpen(false);
                                setSearchOpen(false);
                              }}
                              className="px-3.5 py-2.5 hover:bg-steel-100 flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="font-display font-bold text-xs text-brand-navy truncate">
                                  <AlgoliaHighlight
                                    fallbackText={art.title}
                                    highlightField={art._highlightResult?.title}
                                  />
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

          {/* Phone Number matching Option 1 */}
          <a
            href="tel:01978800500"
            className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-lg text-brand-navy hover:text-stillage-blue transition-colors"
          >
            <Phone className="w-4 h-4 text-brand-navy fill-brand-navy" />
            <span>+44 (0) 1978 800 500</span>
          </a>

          {/* Compact VAT Toggle */}
          <button
            type="button"
            onClick={() => setShowIncVat(!showIncVat)}
            className="hidden xl:inline-flex items-center px-2.5 py-1 rounded border border-steel-200 bg-steel-50 hover:bg-steel-100 text-[11px] font-mono font-bold text-brand-navy transition-colors"
            title="Toggle Ex. VAT / Inc. VAT pricing"
          >
            {showIncVat ? 'INC. VAT' : 'EX. VAT'}
          </button>

          {/* Quote Basket Button matching Option 1 */}
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueLight text-white px-5 py-2.5 rounded-md font-display font-bold text-base transition-colors shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {totalUnits > 0
                ? `Quote Basket (${totalUnits} • ${formatPrice(totalExVat)})`
                : 'Quote Basket'}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md border border-steel-200 text-brand-navy"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-white border-t border-steel-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
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
              className="w-full bg-steel-50 text-brand-navy text-sm px-3 py-2 rounded-l-md border border-steel-200"
            />
            <button
              type="submit"
              className="bg-stillage-blue text-white px-4 py-2 rounded-r-md font-display text-sm font-bold"
            >
              Search
            </button>
          </form>
          <div className="grid grid-cols-1 gap-1 pt-2 font-display font-bold text-base text-brand-navy">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md bg-steel-50"
            >
              All 12 Models
            </Link>
            <Link
              href="/products?category=cantilever-bar-racks"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-steel-50"
            >
              Cantilever Racks (3)
            </Link>
            <Link
              href="/products?category=hopper-bin-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-steel-50"
            >
              Hopper Stillages (3)
            </Link>
            <Link
              href="/products?category=sheet-stillages"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-steel-50"
            >
              Solid &amp; Mesh Cages (4)
            </Link>
            <Link
              href="/products?category=post-pallets"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-steel-50"
            >
              Post Pallets (2)
            </Link>
            <Link
              href="/workshop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-steel-50"
            >
              Custom Fab
            </Link>
            {FEATURES.enableBlogGuides && (
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-md hover:bg-steel-50"
              >
                About &amp; Guides
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
