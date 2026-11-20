'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  User,
  LogOut,
  Package,
  BarChart3,
  LineChart,
} from 'lucide-react';
import { useVat } from '@/context/VatContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { BrandIcon } from '@/components/BrandIcon';
import { SEED_PRODUCTS } from '@/data/seedCatalog';
import { searchProductsWithAlgolia } from '@/lib/algolia';
import { AlgoliaArticleRecord, ParsedSearchIntent, Product } from '@/types/catalog';
import { AlgoliaHighlight } from '@/components/AlgoliaHighlight';
import { FEATURES } from '@/lib/features';

export function Header() {
  const { data: session, status } = useSession();
  const { showIncVat, setShowIncVat, basket, formatPrice, formatBothPrices } = useVat();
  const { navigation, microtexts } = useSiteContent();
  const headerCopy = microtexts.header;
  const headerNavItems = (navigation['header-main']?.items || []).filter(
    (item) => !item.requiresBlogFeature || FEATURES.enableBlogGuides
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAuthenticated = status === 'authenticated' && Boolean(session?.user);
  const isAdmin = session?.user?.role === 'admin';
  const accountDisplayName = session?.user?.name || session?.user?.email || 'Account';

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
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountMenuOpen(false);
        setProductsMenuOpen(false);
        setAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 xl:gap-6">
        {/* Left: Brand Icon + Stacked Brand Wordmark + Navigation Links */}
        <div className="flex items-center gap-6 xl:gap-10 min-w-0">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <BrandIcon size={40} className="w-10 h-10 shrink-0 transition-transform group-hover:scale-105" />
            <span className="flex flex-col">
              <span className="font-display font-extrabold text-3xl sm:text-[34px] tracking-tight text-brand-navy leading-[0.85] uppercase">
                {headerCopy.brandWordmarkPrimary}
              </span>
              <span className="font-display font-bold text-[11px] sm:text-xs tracking-[0.08em] text-brand-navy uppercase mt-0.5">
                {headerCopy.brandWordmarkSecondary}
              </span>
            </span>
          </Link>

          {/* Contentful-Managed Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-5 xl:gap-7">
            {headerNavItems.map((item) => {
              const visibleChildren = (item.children || []).filter(
                (child) => !child.requiresBlogFeature || FEATURES.enableBlogGuides
              );

              if (visibleChildren.length > 0) {
                return (
                  <div key={`${item.label}-${item.href}`} ref={productsMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProductsMenuOpen((prev) => !prev)}
                      aria-expanded={productsMenuOpen}
                      className="inline-flex items-center gap-1 font-display font-bold text-base xl:text-lg text-brand-navy hover:text-stillage-blue transition-colors whitespace-nowrap"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4 text-brand-navy" />
                    </button>

                    {productsMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-60 bg-surface-white border border-steel-200 rounded-lg shadow-xl py-2 z-50">
                        {visibleChildren.map((child, idx) => (
                          <Link
                            key={`${child.label}-${child.href}`}
                            href={child.href}
                            onClick={() => setProductsMenuOpen(false)}
                            className={`block px-4 py-2 font-display text-base hover:bg-steel-50 hover:text-stillage-blue ${
                              idx === 0
                                ? 'font-bold text-brand-navy'
                                : 'font-medium text-steel-800'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.isExternal || item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
                return (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="font-display font-bold text-base xl:text-lg text-brand-navy hover:text-stillage-blue transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className="font-display font-bold text-base xl:text-lg text-brand-navy hover:text-stillage-blue transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Phone, VAT Toggle, Account & Quote Basket Button */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 xl:gap-4 shrink-0">
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
                  {headerCopy.searchAriaLabel}
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
                  placeholder={headerCopy.searchPlaceholder}
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
                    {headerCopy.noSearchMatchesPrefix} &ldquo;{debouncedQuery}&rdquo; — press Enter to view all results.
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
                    <span>
                      {headerCopy.viewAllResultsPrefix} &ldquo;{searchQuery}&rdquo;
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Phone Number */}
          <a
            href={headerCopy.phoneHref}
            className="hidden sm:inline-flex items-center gap-1.5 font-display font-bold text-base xl:text-lg text-brand-navy hover:text-stillage-blue transition-colors whitespace-nowrap shrink-0"
          >
            <Phone className="w-4 h-4 text-brand-navy fill-brand-navy shrink-0" />
            <span>{headerCopy.phoneDisplay}</span>
          </a>

          {/* Compact VAT Toggle */}
          <button
            type="button"
            onClick={() => setShowIncVat(!showIncVat)}
            className="hidden xl:inline-flex items-center px-2.5 py-1 rounded border border-steel-200 bg-steel-50 hover:bg-steel-100 text-[11px] font-mono font-bold text-brand-navy transition-colors whitespace-nowrap shrink-0"
            title={headerCopy.vatToggleTitle}
          >
            {showIncVat ? headerCopy.vatToggleIncLabel : headerCopy.vatToggleExLabel}
          </button>

          {/* Desktop Auth Control (Always visible on md+ desktop, never hidden behind xl:) */}
          {isAuthenticated ? (
            <div ref={accountMenuRef} className="relative hidden md:block shrink-0">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls="header-account-menu"
                className="inline-flex items-center gap-2 border border-steel-200 bg-steel-50 hover:bg-steel-100 text-brand-navy px-3 py-2 rounded-md font-display font-bold text-sm transition-colors whitespace-nowrap"
              >
                <User className="w-4 h-4 text-stillage-blue shrink-0" />
                <span className="max-w-[100px] xl:max-w-[140px] truncate">
                  {accountDisplayName}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-accent-teal text-white'
                      : 'bg-steel-100 text-brand-navy border border-steel-200'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'ACCOUNT'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-steel-600 shrink-0" />
              </button>

              {accountMenuOpen && (
                <div
                  id="header-account-menu"
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 top-full mt-2 w-64 bg-surface-white border border-steel-200 rounded-lg shadow-xl py-1.5 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-steel-200 bg-steel-50/70">
                    <div className="font-display font-bold text-sm text-brand-navy truncate">
                      {accountDisplayName}
                    </div>
                    {session?.user?.email && (
                      <div className="font-mono text-[11px] text-steel-600 truncate">
                        {session.user.email}
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-steel-50 hover:text-stillage-blue transition-colors"
                    >
                      <Package className="w-4 h-4 text-stillage-blue shrink-0" />
                      <span>My Account &amp; Orders</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/analytics"
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-steel-50 hover:text-stillage-blue transition-colors"
                        >
                          <BarChart3 className="w-4 h-4 text-accent-teal shrink-0" />
                          <span>Admin Analytics</span>
                        </Link>
                        <Link
                          href="/analytics-report"
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-steel-50 hover:text-stillage-blue transition-colors"
                        >
                          <LineChart className="w-4 h-4 text-stillage-blue shrink-0" />
                          <span>SEO &amp; GEO Monitor</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-steel-200 pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        void signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-steel-800 hover:bg-steel-50 hover:text-red-700 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="hidden md:inline-flex items-center gap-1.5 border border-steel-200 bg-steel-50 hover:bg-steel-100 text-brand-navy px-3.5 py-2 rounded-md font-display font-bold text-sm transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Quote Basket Button */}
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-stillage-blue hover:bg-stillage-blueLight text-white px-3.5 sm:px-4 xl:px-5 py-2 xl:py-2.5 rounded-md font-display font-bold text-sm xl:text-base transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>
              {totalUnits > 0
                ? `${headerCopy.basketLabel} (${totalUnits} • ${formatPrice(totalExVat)})`
                : headerCopy.basketLabel}
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
            {headerNavItems.flatMap((item) => {
              const visibleChildren = (item.children || []).filter(
                (child) => !child.requiresBlogFeature || FEATURES.enableBlogGuides
              );
              if (visibleChildren.length > 0) {
                return visibleChildren.map((child, idx) => (
                  <Link
                    key={`mobile-${child.label}-${child.href}`}
                    href={child.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-3 rounded-md ${
                      idx === 0 ? 'bg-steel-50' : 'hover:bg-steel-50'
                    }`}
                  >
                    {child.label}
                  </Link>
                ));
              }
              if (item.isExternal || item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
                return [
                  <a
                    key={`mobile-${item.label}-${item.href}`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-md hover:bg-steel-50"
                  >
                    {item.label}
                  </a>,
                ];
              }
              return [
                <Link
                  key={`mobile-${item.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-md hover:bg-steel-50"
                >
                  {item.label}
                </Link>,
              ];
            })}
          </div>

          {/* Mobile Drawer Auth Controls */}
          <div className="border-t border-steel-200 pt-3 space-y-1.5">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 rounded-md bg-steel-50 border border-steel-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-brand-navy truncate">
                      {accountDisplayName}
                    </div>
                    {session?.user?.email && (
                      <div className="font-mono text-[11px] text-steel-600 truncate">
                        {session.user.email}
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-accent-teal text-white'
                        : 'bg-steel-100 text-brand-navy border border-steel-200'
                    }`}
                  >
                    {isAdmin ? 'ADMIN' : 'ACCOUNT'}
                  </span>
                </div>

                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 px-3 rounded-md font-display font-bold text-base text-brand-navy hover:bg-steel-50"
                >
                  <Package className="w-4 h-4 text-stillage-blue shrink-0" />
                  <span>My Account &amp; Orders</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-md font-display font-bold text-base text-brand-navy hover:bg-steel-50"
                    >
                      <BarChart3 className="w-4 h-4 text-accent-teal shrink-0" />
                      <span>Admin Analytics</span>
                    </Link>
                    <Link
                      href="/analytics-report"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-md font-display font-bold text-base text-brand-navy hover:bg-steel-50"
                    >
                      <LineChart className="w-4 h-4 text-stillage-blue shrink-0" />
                      <span>SEO &amp; GEO Monitor</span>
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-2.5 py-2 px-3 rounded-md font-display font-bold text-base text-steel-800 hover:bg-steel-50 hover:text-red-700 text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 border border-steel-200 bg-steel-50 hover:bg-steel-100 text-brand-navy py-2.5 px-4 rounded-md font-display font-bold text-base transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
