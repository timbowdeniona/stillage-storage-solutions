'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AlgoliaArticleRecord,
  AlgoliaRuleBanner,
  Category,
  ParsedSearchIntent,
  Product,
} from '@/types/catalog';
import { searchProductsWithAlgolia, SearchFilterOptions } from '@/lib/algolia';
import { ProductCard } from '@/components/ProductCard';
import { AiSpecAdvisor } from '@/components/AiSpecAdvisor';
import { AlgoliaHighlight } from '@/components/AlgoliaHighlight';

interface ProductListingClientProps {
  initialProducts: Product[];
  categories: Category[];
}

const FOOTPRINT_OPTIONS = [
  { value: 'all', label: 'Any Footprint' },
  { value: '1200x1000', label: '1200 × 1000mm' },
  { value: '1130x1130', label: '1130 × 1130mm' },
  { value: '1200x1200', label: '1200 × 1200mm' },
  { value: '1800x1050', label: '1800 × 1050mm' },
  { value: '2400x1100', label: '2400 × 1100mm' },
];

export function ProductListingClient({
  initialProducts,
  categories,
}: ProductListingClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialFootprint = searchParams.get('footprint') || 'all';
  const orderConfirmed = searchParams.get('order_confirmed');

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFootprint, setSelectedFootprint] = useState(initialFootprint);
  const [minSwlKg, setMinSwlKg] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SearchFilterOptions['sortBy']>('featured');
  const [results, setResults] = useState<Product[]>(initialProducts);
  const [articleHits, setArticleHits] = useState<AlgoliaArticleRecord[]>([]);
  const [ruleBanners, setRuleBanners] = useState<AlgoliaRuleBanner[]>([]);
  const [facetCounts, setFacetCounts] = useState<Record<string, Record<string, number>>>({});
  const [parsedIntent, setParsedIntent] = useState<ParsedSearchIntent>({
    cleanedQuery: '',
    intentBadges: [],
  });
  const [aiOpenSignal, setAiOpenSignal] = useState(0);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const cachedTextNodesRef = useRef<Node[]>([]);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
    setSelectedFootprint(searchParams.get('footprint') || 'all');
  }, [searchParams]);

  // 180ms keystroke debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    searchProductsWithAlgolia(initialProducts, {
      query: debouncedQuery,
      categorySlug: selectedCategory,
      minSwlKg,
      footprintMm: selectedFootprint,
      inStockOnly,
      sortBy,
      includeArticles: debouncedQuery.length > 0,
      skipNetworkOnDefault: true,
    }).then((res) => {
      if (active) {
        setResults(res.hits);
        setArticleHits(res.articleHits);
        setRuleBanners(res.ruleBanners);
        setParsedIntent(res.parsedIntent);
        if (res.facets) {
          setFacetCounts(res.facets);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [
    initialProducts,
    debouncedQuery,
    selectedCategory,
    selectedFootprint,
    minSwlKg,
    inStockOnly,
    sortBy,
  ]);

  // Modern Web Guidance (highlight-text-ranges): cache text-node list and rebuild only when grid DOM changes
  useEffect(() => {
    if (!gridContainerRef.current || typeof document === 'undefined') {
      cachedTextNodesRef.current = [];
      return;
    }
    const walker = document.createTreeWalker(
      gridContainerRef.current,
      NodeFilter.SHOW_TEXT
    );
    const nodes: Node[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = walker.nextNode();
    }
    cachedTextNodesRef.current = nodes;
  }, [results]);

  // Modern Web Guidance (highlight-text-ranges): CSS Custom Highlight API via cached text nodes
  useEffect(() => {
    if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
    const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
    registry.delete('algolia-search-match');

    const cleaned = parsedIntent.cleanedQuery.trim().toLowerCase();
    if (!cleaned || cleaned.length < 2 || cachedTextNodesRef.current.length === 0) return;

    const terms = cleaned.split(/\s+/).filter((t) => t.length >= 2);
    if (terms.length === 0) return;

    const matchingRanges: Range[] = [];
    for (const currentNode of cachedTextNodesRef.current) {
      if (!currentNode.isConnected) continue;
      const text = currentNode.textContent || '';
      const lowerText = text.toLowerCase();
      for (const term of terms) {
        let pos = lowerText.indexOf(term);
        while (pos !== -1) {
          const range = new Range();
          range.setStart(currentNode, pos);
          range.setEnd(currentNode, pos + term.length);
          matchingRanges.push(range);
          pos = lowerText.indexOf(term, pos + term.length);
        }
      }
    }

    if (matchingRanges.length > 0 && typeof Highlight !== 'undefined') {
      const highlightInstance = new Highlight(...matchingRanges);
      registry.set('algolia-search-match', highlightInstance);
    }

    return () => {
      registry.delete('algolia-search-match');
    };
  }, [results, parsedIntent.cleanedQuery]);

  const resetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedCategory('all');
    setSelectedFootprint('all');
    setMinSwlKg(0);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedFootprint !== 'all' ||
    minSwlKg > 0 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Order Confirmation Banner if redirected from checkout */}
      {orderConfirmed && (
        <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h2 className="font-display font-bold uppercase text-emerald-950 text-base">
                Order / Proforma Reference Confirmed: {orderConfirmed}
              </h2>
              <p className="text-xs text-emerald-800">
                Your configured stillage specification and UK pallet freight calculation have been logged with our trade dispatch desk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approach 1 Clean Category Filter Pills */}
      <div
        role="tablist"
        aria-label="Stillage categories"
        className="flex flex-wrap items-center gap-2 pb-4 border-b border-steel-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-sm font-mono text-xs uppercase font-bold tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-stillage-blue text-white shadow-xs'
              : 'bg-steel-50 text-steel-800 hover:bg-steel-100 border border-steel-200'
          }`}
        >
          All Models ({initialProducts.length})
        </button>
        {categories.map((cat) => {
          const count =
            facetCounts.categorySlug?.[cat.slug] ??
            initialProducts.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-sm font-mono text-xs uppercase font-bold tracking-wider transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-stillage-blue text-white shadow-xs'
                  : 'bg-steel-50 text-steel-800 hover:bg-steel-100 border border-steel-200'
              }`}
            >
              {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Streamlined Horizontal Filter & Search Bar */}
      <div className="bg-steel-50 border border-steel-200 p-4 rounded-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="catalog-algolia-search" className="sr-only">
              Filter stillage catalog by keyword, footprint, SWL, or SKU
            </label>
            <Search className="w-4 h-4 text-steel-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-algolia-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              placeholder="Filter by keyword, SKU, SWL (e.g. 1500kg), or footprint (e.g. 1200x1000)..."
              className="w-full pl-10 pr-4 py-2 bg-surface-white border border-steel-200 rounded-sm text-sm focus:outline-none focus:border-stillage-blue"
            />
          </div>

          {/* Inline SWL, Footprint & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Min SWL Pills */}
            <div className="inline-flex items-center bg-surface-white border border-steel-200 rounded-sm p-0.5 font-mono text-xs">
              {[0, 1000, 1500].map((swl) => (
                <button
                  key={swl}
                  type="button"
                  onClick={() => setMinSwlKg(swl)}
                  className={`px-2.5 py-1.5 rounded-xs transition-colors ${
                    minSwlKg === swl
                      ? 'bg-brand-navy text-white font-bold'
                      : 'text-steel-600 hover:text-brand-navy'
                  }`}
                >
                  {swl === 0 ? 'Any SWL' : `${swl}kg+`}
                </button>
              ))}
            </div>

            {/* Footprint Select */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <label htmlFor="footprint-select" className="text-steel-600 uppercase sr-only">
                Footprint
              </label>
              <select
                id="footprint-select"
                value={selectedFootprint}
                onChange={(e) => setSelectedFootprint(e.target.value)}
                className="bg-surface-white border border-steel-200 px-3 py-2 rounded-sm font-sans text-xs font-medium text-steel-900"
              >
                {FOOTPRINT_OPTIONS.map((fp) => (
                  <option key={fp.value} value={fp.value}>
                    {fp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-navy" />
              <label htmlFor="sort-select" className="text-steel-600 uppercase sr-only">
                Sort
              </label>
              <select
                id="sort-select"
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchFilterOptions['sortBy'])}
                className="bg-surface-white border border-steel-200 px-3 py-2 rounded-sm font-sans text-xs font-medium text-steel-900"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="swl-desc">Highest SWL Rating</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-mono text-stillage-blue hover:underline font-bold px-2 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Smart Natural-Language Query Intent Badges */}
        {parsedIntent.intentBadges.length > 0 && (
          <div className="pt-2 border-t border-steel-200 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1 text-brand-navy font-bold">
              <Sparkles className="w-3.5 h-3.5 text-stillage-blue" />
              Detected Filters:
            </span>
            {parsedIntent.intentBadges.map((badge) => (
              <span
                key={badge}
                className="bg-brand-navy text-white px-2.5 py-0.5 rounded-sm text-[11px] font-bold"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible AI Steel Stillage Engineer & Load Advisor */}
      <AiSpecAdvisor
        externalOpenSignal={aiOpenSignal}
        initialPrompt={query.trim() || undefined}
      />

      {/* Query Rule Merchandising Banners */}
      {ruleBanners.length > 0 && (
        <div className="space-y-3">
          {ruleBanners.map((banner) => (
            <div
              key={banner.bannerType}
              className="bg-brand-navy text-surface-white p-4 sm:p-5 border-l-4 border-stillage-blue flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-stillage-sky font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
                  <span>ENGINEERING GUIDANCE • {banner.badge}</span>
                </div>
                <h3 className="font-display font-bold text-lg uppercase text-white">
                  {banner.title}
                </h3>
                <p className="text-xs text-steel-200 max-w-3xl leading-relaxed">
                  {banner.description}
                </p>
              </div>
              <div className="shrink-0">
                {banner.ctaAction === 'open-ai-advisor' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAiOpenSignal((n) => n + 1);
                      window.scrollTo({ top: 140, behavior: 'smooth' });
                    }}
                    className="bg-surface-white hover:bg-steel-100 text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : banner.ctaHref ? (
                  <Link
                    href={banner.ctaHref}
                    className="bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Width 3-Column Visual Product Grid */}
      <section className="space-y-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 text-xs font-mono text-steel-600">
            <span>
              Showing <strong className="text-steel-900">{results.length}</strong> engineered stillage model{results.length === 1 ? '' : 's'}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="border border-steel-200 bg-steel-50 p-12 text-center rounded-sm">
              <h3 className="font-display font-bold text-xl uppercase text-brand-navy">
                No Matching Standard Stillages Found
              </h3>
              <p className="text-sm text-steel-600 mt-2 max-w-md mx-auto">
                Try clearing your SWL, footprint, or keyword filters, or use the AI Steel Stillage Engineer above to generate a bespoke CAD quote.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 bg-stillage-blue text-white font-display font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              ref={gridContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {results.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>
          )}
        </div>

        {/* Federated Technical Blog & Compliance Matches */}
        {articleHits.length > 0 && (
          <div className="border-t border-steel-200 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-stillage-blue" />
                <h3 className="font-display font-bold text-xl uppercase text-brand-navy">
                  Matching Technical &amp; Compliance Guides ({articleHits.length})
                </h3>
              </div>
              <Link
                href="/blog"
                className="font-mono text-xs text-stillage-blue hover:underline font-bold"
              >
                All Guides &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articleHits.map((article) => (
                <Link
                  key={article.objectID}
                  href={`/blog/${article.slug}`}
                  className="p-5 border border-steel-200 hover:border-stillage-blue bg-steel-50 rounded-sm flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="font-mono text-[10px] uppercase text-stillage-blue font-bold">
                      {article.category} • {article.readingTimeMinutes} min read
                    </div>
                    <h4 className="font-display font-bold text-base uppercase text-brand-navy mt-1 leading-snug">
                      <AlgoliaHighlight
                        fallbackText={article.title}
                        highlightField={article._highlightResult?.title}
                      />
                    </h4>
                    <p className="text-xs text-steel-600 mt-1.5 line-clamp-2">
                      <AlgoliaHighlight
                        fallbackText={article.excerpt}
                        highlightField={article._highlightResult?.excerpt}
                      />
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-steel-200 font-mono text-[11px] font-bold text-brand-navy flex items-center justify-between">
                    <span>Read Engineering Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stillage-blue" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
