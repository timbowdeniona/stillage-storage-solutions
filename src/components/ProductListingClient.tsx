'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Database,
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
  const [searchEngine, setSearchEngine] = useState<
    'algolia-dsn' | 'algolia-dsn-cached' | 'algolia-local-replica'
  >('algolia-local-replica');
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

  // Pillar 1 Quota Saver: 180ms keystroke debounce before querying Algolia DSN
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
        setSearchEngine(res.engine);
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

  // Modern Web Guidance (highlight-text-ranges): CSS Custom Highlight API via cached text nodes (no innerHTML mutation)
  useEffect(() => {
    if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
    const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
    // MANDATORY: Clear previous highlights before registering new ones
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

  const engineLabel =
    searchEngine === 'algolia-dsn-cached'
      ? 'Algolia Session Cache (0 Quota)'
      : searchEngine === 'algolia-dsn'
      ? 'Algolia Live DSN'
      : 'Algolia Instant SSR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Order Confirmation Banner if redirected from checkout */}
      {orderConfirmed && (
        <div className="mb-8 bg-emerald-50 border-2 border-emerald-600 p-4 rounded flex items-center justify-between gap-4">
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

      {/* AI Steel Stillage Engineer & Load Advisor (gemini-3.8-flash + Algolia RAG) */}
      <AiSpecAdvisor
        externalOpenSignal={aiOpenSignal}
        initialPrompt={query.trim() || undefined}
      />

      {/* Top Search & Sort Toolbar */}
      <div className="bg-surface-sandLight border border-steel-200 p-4 mb-8 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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
              placeholder="Instant Algolia search: try 'outdoor', 'crane loler', '1500kg', '1200x1000', or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-steel-200 rounded-sm text-sm focus:outline-none focus:border-stillage-blue"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-steel-600 bg-white px-2.5 py-1.5 border border-steel-200 rounded-sm">
              <Database className="w-3.5 h-3.5 text-stillage-blue" />
              <span>Index: {engineLabel}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-navy" />
              <label htmlFor="sort-select" className="text-steel-600 uppercase">
                Sort:
              </label>
              <select
                id="sort-select"
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchFilterOptions['sortBy'])}
                className="bg-white border border-steel-200 px-3 py-2 rounded-sm font-sans text-xs font-medium text-steel-900"
              >
                <option value="featured">Featured Specifications</option>
                <option value="price-asc">Price: Low to High (Replica)</option>
                <option value="price-desc">Price: High to Low (Replica)</option>
                <option value="swl-desc">Safe Working Load (Highest SWL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Smart Natural-Language Query Intent Badges */}
        {parsedIntent.intentBadges.length > 0 && (
          <div className="pt-2 border-t border-steel-200 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1 text-brand-navy font-bold">
              <Sparkles className="w-3.5 h-3.5 text-stillage-blue" />
              AI Query Filters Detected:
            </span>
            {parsedIntent.intentBadges.map((badge) => (
              <span
                key={badge}
                className="bg-brand-navy text-surface-sand px-2.5 py-0.5 rounded-sm text-[11px] font-bold"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pillar 3: Programmable Algolia Query Rule Merchandising Banners */}
      {ruleBanners.length > 0 && (
        <div className="mb-8 space-y-3">
          {ruleBanners.map((banner) => (
            <div
              key={banner.bannerType}
              className="bg-brand-navy text-surface-white p-4 sm:p-5 border-l-4 border-stillage-blue flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-surface-sand font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
                  <span>ALGOLIA QUERY RULE • {banner.badge}</span>
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
                    className="bg-surface-sand hover:bg-white text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Faceted Technical Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="border border-steel-200 bg-surface-white p-5">
            <div className="flex items-center justify-between border-b border-steel-200 pb-3 mb-4">
              <div className="flex items-center gap-2 font-display font-bold uppercase tracking-wider text-brand-navy text-sm">
                <Filter className="w-4 h-4 text-stillage-blue" />
                <span>Technical Facets</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-stillage-blue hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Category Facet */}
            <div className="mb-6">
              <h3 className="font-mono text-xs uppercase text-steel-600 font-bold mb-2.5">
                Stillage Category
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 text-xs rounded-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-brand-navy text-surface-sand font-bold'
                      : 'hover:bg-steel-100 text-steel-800'
                  }`}
                >
                  <span>All Stillages &amp; Racks</span>
                  <span className="font-mono text-[11px]">{initialProducts.length}</span>
                </button>
                {categories.map((cat) => {
                  const count =
                    facetCounts.categorySlug?.[cat.slug] ??
                    initialProducts.filter((p) => p.categorySlug === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-sm font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-brand-navy text-surface-sand font-bold'
                          : 'hover:bg-steel-100 text-steel-800'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.title}</span>
                      <span className="font-mono text-[11px]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SWL Capacity Facet */}
            <div className="mb-6 border-t border-steel-200 pt-5">
              <h3 className="font-mono text-xs uppercase text-steel-600 font-bold mb-2.5">
                Min. Safe Working Load (SWL)
              </h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {[0, 1000, 1200, 1500].map((swl) => (
                  <button
                    key={swl}
                    type="button"
                    onClick={() => setMinSwlKg(swl)}
                    className={`py-2 px-2.5 border text-center rounded-sm transition-colors ${
                      minSwlKg === swl
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'bg-white text-steel-800 border-steel-200 hover:border-stillage-blue'
                    }`}
                  >
                    {swl === 0 ? 'Any SWL' : `${swl}kg+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Footprint Dimensions Facet */}
            <div className="mb-6 border-t border-steel-200 pt-5">
              <h3 className="font-mono text-xs uppercase text-steel-600 font-bold mb-2.5">
                External Footprint (L × W)
              </h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {FOOTPRINT_OPTIONS.map((fp) => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => setSelectedFootprint(fp.value)}
                    className={`py-2 px-2 border text-center rounded-sm transition-colors ${
                      selectedFootprint === fp.value
                        ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                        : 'bg-white text-steel-800 border-steel-200 hover:border-stillage-blue'
                    }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status Facet */}
            <div className="border-t border-steel-200 pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-steel-900">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-steel-400 text-stillage-blue focus:ring-stillage-blue w-4 h-4"
                />
                <span>In Stock for Immediate Dispatch</span>
              </label>
            </div>
          </div>

          {/* Bespoke Fabrication Callout */}
          <div className="bg-brand-navy text-surface-white p-5 border-l-4 border-accent-amber">
            <div className="font-mono text-[11px] uppercase text-surface-sand">
              Bespoke CAD &amp; Fabrication
            </div>
            <h4 className="font-display font-bold text-lg uppercase mt-1">
              Need Non-Standard Dimensions?
            </h4>
            <p className="text-xs text-steel-200 mt-2 leading-relaxed">
              We manufacture custom footprint stillages, crane-lifting frames, and OEM line-feed racks in batches of 5 to 500+ units.
            </p>
            <div className="mt-4 pt-3 border-t border-white/15 font-mono text-xs text-surface-sand">
              Call Trade Engineering: 01978 800 500
            </div>
          </div>
        </aside>

        {/* Right Product Grid + Federated Technical Guides */}
        <section className="lg:col-span-9 space-y-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-mono text-steel-600">
              <span>
                Showing <strong className="text-steel-900">{results.length}</strong> engineered stillage specification{results.length === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-3">
                {selectedFootprint !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedFootprint('all')}
                    className="text-stillage-blue hover:underline"
                  >
                    Clear footprint ({selectedFootprint}mm) &times;
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-stillage-blue hover:underline"
                  >
                    Clear category filter &times;
                  </button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="border border-steel-200 bg-surface-sandLight p-12 text-center">
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
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {results.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index === 0} />
                ))}
              </div>
            )}
          </div>

          {/* Pillar 2: Federated Technical Blog & Compliance Matches from stillage_articles */}
          {articleHits.length > 0 && (
            <div className="border-t-2 border-steel-200 pt-6">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articleHits.map((article) => (
                  <Link
                    key={article.objectID}
                    href={`/blog/${article.slug}`}
                    className="p-4 border border-steel-200 hover:border-stillage-blue bg-surface-sandLight/50 rounded-sm flex flex-col justify-between transition-colors"
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
    </div>
  );
}
