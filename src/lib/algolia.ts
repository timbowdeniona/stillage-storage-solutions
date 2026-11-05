import {
  AlgoliaProductRecord,
  ParsedSearchIntent,
  Product,
  ProductRecommendation,
  ProductRecommendationsResult,
} from '@/types/catalog';
import { SEED_PRODUCTS } from '@/data/seedCatalog';

function getEnv(name: string, fallback = ''): string {
  if (typeof process === 'undefined' || !process.env) return fallback;
  return process.env[name] || fallback;
}

const ALGOLIA_APP_ID = getEnv('NEXT_PUBLIC_ALGOLIA_APP_ID');
const ALGOLIA_SEARCH_KEY = getEnv('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
const ALGOLIA_INDEX = getEnv('NEXT_PUBLIC_ALGOLIA_INDEX_NAME', 'stillage_products');

export interface SearchFilterOptions {
  query?: string;
  categorySlug?: string;
  minSwlKg?: number;
  footprintMm?: string;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'swl-desc';
}

export interface AlgoliaSearchResponse {
  hits: Product[];
  facets?: Record<string, Record<string, number>>;
  parsedIntent: ParsedSearchIntent;
  engine: 'algolia-dsn' | 'algolia-local-replica';
}

const COMPATIBILITY_MAP: Record<
  string,
  {
    compatibleSkus: string[];
    useCases: string[];
    environmentTags: string[];
    recommendedFinishIds: string[];
    recommendedMobilityIds: string[];
  }
> = {
  'SSS-CANT-3B8A': {
    compatibleSkus: ['SSS-CANT-2B4A', 'SSS-PST-1111D', 'SSS-SHT-1210'],
    useCases: [
      '6m steel bar storage',
      'long tube and pipe rack',
      'RHS box section storage',
      'extrusion rack',
      'scaffold tube storage',
      'double sided cantilever rack',
    ],
    environmentTags: ['indoor fabrication shop', 'outdoor yard galvanised', 'forklift skid base', '1500kg heavy duty'],
    recommendedFinishIds: ['standard-blue', 'galvanised'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
  },
  'SSS-CANT-2B4A': {
    compatibleSkus: ['SSS-CANT-3B8A', 'SSS-PST-1111D', 'SSS-MSH-1210HD'],
    useCases: [
      'band saw station rack',
      'CNC tube laser infeed',
      '3m bar and conduit storage',
      'transit van loading rack',
      'compact cantilever stillage',
    ],
    environmentTags: ['machine shop', 'saw station workflow', 'forklift base pockets', '1200kg swl'],
    recommendedFinishIds: ['standard-blue', 'custom-ral'],
    recommendedMobilityIds: ['forklift-pockets', 'heavy-duty-castors'],
  },
  'SSS-HOP-4T1000': {
    compatibleSkus: ['SSS-SHT-1210', 'SSS-MSH-1210HD', 'SSS-PST-1111D'],
    useCases: [
      'gravity feed hopper',
      'bulk aggregate dispensing',
      '4-high modular bin tower',
      'fastener and casting hopper',
      'interlocking bin stillage',
    ],
    environmentTags: ['high density warehouse', '4-high stacking', 'forklift guide hoops', 'ukca certified'],
    recommendedFinishIds: ['standard-blue', 'galvanised', 'raw-steel'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
  },
  'SSS-SHT-1210': {
    compatibleSkus: ['SSS-MSH-1210HD', 'SSS-HOP-4T1000', 'SSS-PST-1111D'],
    useCases: [
      'heavy metal castings',
      'oily press shop stampings',
      'scrap metal bin',
      'solid sheet steel tote',
      'automotive WIP bin',
      '1200x1000 euro footprint stillage',
    ],
    environmentTags: ['foundry raw steel', 'outdoor yard galvanised', 'indoor warehouse', '4-high stackable'],
    recommendedFinishIds: ['standard-blue', 'raw-steel', 'galvanised'],
    recommendedMobilityIds: ['standard-feet', 'forklift-pockets', 'heavy-duty-castors'],
  },
  'SSS-MSH-1210HD': {
    compatibleSkus: ['SSS-SHT-1210', 'SSS-HOP-4T1000', 'SSS-PST-1111D'],
    useCases: [
      'order picking cage',
      'half drop gate mesh stillage',
      'visible stock storage',
      'warehouse aisle picking',
      'boxed component cage',
      '1200x1000 inter-stacking cage',
    ],
    environmentTags: ['3PL logistics warehouse', 'order picking', 'high visibility mesh', '4-high stackable'],
    recommendedFinishIds: ['standard-blue', 'custom-ral', 'galvanised'],
    recommendedMobilityIds: ['heavy-duty-castors', 'standard-feet', 'both-castors-pockets'],
  },
  'SSS-PST-1111D': {
    compatibleSkus: ['SSS-CANT-3B8A', 'SSS-SHT-1210', 'SSS-MSH-1210HD'],
    useCases: [
      'returnable transport packaging',
      'demountable post pallet',
      'collapsible corner posts',
      'construction site telehandler pallet',
      'timber and extrusion pallet',
      '5-high stackable pallet',
    ],
    environmentTags: ['outdoor construction site', 'return HGV fleet', 'telehandler handling', 'space saving'],
    recommendedFinishIds: ['galvanised', 'standard-blue'],
    recommendedMobilityIds: ['forklift-pockets', 'standard-feet'],
  },
};

export function enrichProductForAlgolia(product: Product): AlgoliaProductRecord {
  const footprintMm = `${product.externalLengthMm}x${product.externalWidthMm}`;
  const dimensionsText = `${product.externalLengthMm}x${product.externalWidthMm}x${product.externalHeightMm}mm`;
  const meta = COMPATIBILITY_MAP[product.sku] || {
    compatibleSkus: ['SSS-SHT-1210', 'SSS-MSH-1210HD', 'SSS-CANT-3B8A'].filter((s) => s !== product.sku),
    useCases: [product.categoryName.toLowerCase(), 'industrial steel stillage', 'uk warehouse storage'],
    environmentTags: ['indoor warehouse', 'outdoor galvanised', 'ukca certified'],
    recommendedFinishIds: ['standard-blue', 'galvanised'],
    recommendedMobilityIds: ['standard-feet', 'forklift-pockets'],
  };

  return {
    ...product,
    objectID: product.id,
    footprintMm,
    dimensionsText,
    compatibleSkus: meta.compatibleSkus,
    useCases: meta.useCases,
    environmentTags: meta.environmentTags,
    recommendedFinishIds: meta.recommendedFinishIds,
    recommendedMobilityIds: meta.recommendedMobilityIds,
  };
}

function unwrapField<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object' && !Array.isArray(val)) {
    const record = val as Record<string, unknown>;
    if ('en-US' in record && record['en-US'] !== undefined) {
      return record['en-US'] as T;
    }
    if ('en-GB' in record && record['en-GB'] !== undefined) {
      return record['en-GB'] as T;
    }
    const firstKey = Object.keys(record)[0];
    if (firstKey) return record[firstKey] as T;
  }
  return val as T;
}

function unwrapImageField(val: unknown, fallback?: string): string | undefined {
  const unwrapped = unwrapField<unknown>(val, fallback);
  if (typeof unwrapped === 'string') {
    return unwrapped.startsWith('//') ? `https:${unwrapped}` : unwrapped;
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const assetId = (unwrapped as { sys?: { id?: string } }).sys?.id;
    const assetFallbackMap: Record<string, string> = {
      'asset-cantilever-rack-cutout': '/images/products/cantilever-rack-cutout.png',
      'asset-cantilever-rack-sand': '/images/products/cantilever-rack-sand.png',
      'asset-stacked-hopper-stillage': '/images/products/stacked-hopper-stillage.png',
    };
    if (assetId && assetFallbackMap[assetId]) {
      return assetFallbackMap[assetId];
    }
  }
  return fallback;
}

export function normalizeWebhookOrProductPayload(payload: Record<string, unknown>): AlgoliaProductRecord | null {
  if (!payload || typeof payload !== 'object') return null;

  const sys = payload.sys as Record<string, unknown> | undefined;
  const contentTypeId =
    (sys?.contentType as { sys?: { id?: string } } | undefined)?.sys?.id ||
    (payload.contentTypeId as string | undefined);

  // Ignore non-product Contentful entries (such as blogPost or category) if contentType is explicitly set
  if (contentTypeId && contentTypeId !== 'product') {
    return null;
  }

  const rawFields = (payload.fields as Record<string, unknown> | undefined) || payload;
  const id = String(sys?.id || payload.objectID || payload.id || '');
  const sku = unwrapField<string>(rawFields.sku, '');
  const title = unwrapField<string>(rawFields.title, '');

  if (!id || (!sku && !title)) {
    return null;
  }

  const seedFallback = SEED_PRODUCTS.find((p) => p.id === id || p.sku === sku);

  const product: Product = {
    id,
    title: title || seedFallback?.title || 'Industrial Steel Stillage',
    slug: unwrapField<string>(rawFields.slug, seedFallback?.slug || id),
    sku: sku || seedFallback?.sku || 'SSS-CUSTOM',
    categorySlug: unwrapField<string>(rawFields.categorySlug, seedFallback?.categorySlug || 'sheet-stillages'),
    categoryName: unwrapField<string>(rawFields.categoryName, seedFallback?.categoryName || 'Steel Stillages'),
    shortDescription: unwrapField<string>(rawFields.shortDescription, seedFallback?.shortDescription || ''),
    fullDescription: unwrapField<string>(rawFields.fullDescription, seedFallback?.fullDescription || ''),
    basePriceExVatPence: Number(
      unwrapField<number>(rawFields.basePriceExVatPence, seedFallback?.basePriceExVatPence || 18900)
    ),
    swlKg: Number(unwrapField<number>(rawFields.swlKg, seedFallback?.swlKg || 1000)),
    externalLengthMm: Number(
      unwrapField<number>(rawFields.externalLengthMm, seedFallback?.externalLengthMm || 1200)
    ),
    externalWidthMm: Number(
      unwrapField<number>(rawFields.externalWidthMm, seedFallback?.externalWidthMm || 1000)
    ),
    externalHeightMm: Number(
      unwrapField<number>(rawFields.externalHeightMm, seedFallback?.externalHeightMm || 900)
    ),
    unitWeightKg: Number(unwrapField<number>(rawFields.unitWeightKg, seedFallback?.unitWeightKg || 68)),
    stackableHeight: unwrapField<string>(
      rawFields.stackableHeight,
      seedFallback?.stackableHeight || '4-High Stackable'
    ),
    steelSpecification: unwrapField<string>(
      rawFields.steelSpecification,
      seedFallback?.steelSpecification || '50x50x3mm RHS Steel'
    ),
    standardFinish: unwrapField<string>(
      rawFields.standardFinish,
      seedFallback?.standardFinish || 'RAL 5010 Stillage Blue'
    ),
    ukcaCertified: Boolean(unwrapField<boolean>(rawFields.ukcaCertified, seedFallback?.ukcaCertified ?? true)),
    inStock: Boolean(unwrapField<boolean>(rawFields.inStock, seedFallback?.inStock ?? true)),
    leadTimeText: unwrapField<string>(
      rawFields.leadTimeText,
      seedFallback?.leadTimeText || 'In Stock — Dispatch in 2–3 Working Days'
    ),
    featured: Boolean(unwrapField<boolean>(rawFields.featured, seedFallback?.featured ?? false)),
    primaryImage:
      unwrapImageField(
        rawFields.primaryImage,
        seedFallback?.primaryImage || '/images/products/cantilever-rack-cutout.png'
      ) || '/images/products/cantilever-rack-cutout.png',
    secondaryImage: unwrapImageField(rawFields.secondaryImage, seedFallback?.secondaryImage),
    backdropStyle:
      unwrapField<string>(rawFields.backdropStyle, seedFallback?.backdropStyle || 'sand') === 'white'
        ? 'white'
        : 'sand',
    highlights: unwrapField<string[]>(rawFields.highlights, seedFallback?.highlights || []),
  };

  return enrichProductForAlgolia(product);
}

export function parseNaturalLanguageSearchIntent(rawQuery: string): ParsedSearchIntent {
  const intentBadges: string[] = [];
  let working = rawQuery.trim();
  const lower = working.toLowerCase();

  let detectedMinSwlKg: number | undefined;
  const swlMatch = lower.match(/\b(1[,.]?000|1[,.]?200|1[,.]?500|2[,.]?000)\s*kg\b/i);
  if (swlMatch) {
    const numeric = Number(swlMatch[1].replace(/[,.]/g, ''));
    if (numeric > 0) {
      detectedMinSwlKg = numeric;
      intentBadges.push(`Min SWL: ${numeric}kg`);
    }
  }

  let detectedFootprintMm: string | undefined;
  const fpMatch = lower.match(/\b(1200|1130|2400|1800)\s*[x×*]\s*(1000|1200|1130|1100|1050)\b/i);
  if (fpMatch) {
    detectedFootprintMm = `${fpMatch[1]}x${fpMatch[2]}`;
    intentBadges.push(`Footprint: ${fpMatch[1]}×${fpMatch[2]}mm`);
    working = working.replace(fpMatch[0], '').trim();
  }

  let suggestedFinishOption: string | undefined;
  if (/\b(galvanis\w*|galvaniz\w*|hdg|outdoor|weatherproof|rust\s*proof|iso\s*1461)\b/i.test(lower)) {
    suggestedFinishOption = 'galvanised';
    intentBadges.push('Suggested Finish: Hot-Dip Galvanised');
    working = working
      .replace(/\b(galvanis\w*|galvaniz\w*|hdg|outdoor|weatherproof|rust\s*proof)\b/gi, '')
      .trim();
  } else if (/\b(raw\s*steel|unpainted|oiled|self\s*colour|foundry|hot\s*castings)\b/i.test(lower)) {
    suggestedFinishOption = 'raw-steel';
    intentBadges.push('Suggested Finish: Raw Mill Steel');
    working = working.replace(/\b(raw\s*steel|unpainted|oiled)\b/gi, '').trim();
  } else if (/\b(custom\s*ral|corporate\s*colour|traffic\s*red|traffic\s*green)\b/i.test(lower)) {
    suggestedFinishOption = 'custom-ral';
    intentBadges.push('Suggested Finish: Custom RAL');
  }

  let suggestedMobilityOption: string | undefined;
  if (/\b(castors?|wheels?|mobile|trolley|braked)\b/i.test(lower)) {
    suggestedMobilityOption = 'heavy-duty-castors';
    intentBadges.push('Mobility: Lockable Castors');
    working = working.replace(/\b(with\s+)?(castors?|wheels?|mobile)\b/gi, '').trim();
  } else if (/\b(telehandler|forklift\s*pockets?|4-way\s*pockets?|rough\s*terrain)\b/i.test(lower)) {
    suggestedMobilityOption = 'forklift-pockets';
    intentBadges.push('Handling: 4-Way Forklift Pockets');
    working = working.replace(/\b(telehandler|forklift\s*pockets?)\b/gi, '').trim();
  }

  let detectedCategorySlug: string | undefined;
  if (/\b(cantilever|bar\s*rack|tube\s*rack|pipe\s*rack|extrusion|band\s*saw)\b/i.test(lower)) {
    detectedCategorySlug = 'cantilever-bar-racks';
  } else if (/\b(hopper|gravity\s*feed|aggregate\s*tower)\b/i.test(lower)) {
    detectedCategorySlug = 'hopper-bin-stillages';
  } else if (/\b(mesh|drop\s*gate|wire\s*cage|order\s*picking)\b/i.test(lower)) {
    detectedCategorySlug = 'mesh-stillages';
  } else if (/\b(post\s*pallet|demountable|removable\s*posts?)\b/i.test(lower)) {
    detectedCategorySlug = 'post-pallets';
  } else if (/\b(solid\s*sheet|corrugated\s*bin|sheet\s*steel\s*bin)\b/i.test(lower)) {
    detectedCategorySlug = 'sheet-stillages';
  }

  const cleanedQuery = working.replace(/\s{2,}/g, ' ').trim();

  return {
    cleanedQuery: cleanedQuery || rawQuery.trim(),
    detectedMinSwlKg,
    detectedFootprintMm,
    detectedCategorySlug,
    suggestedFinishOption,
    suggestedMobilityOption,
    intentBadges,
  };
}

export async function searchProductsWithAlgolia(
  initialProducts: Product[],
  filters: SearchFilterOptions
): Promise<AlgoliaSearchResponse> {
  const {
    query = '',
    categorySlug,
    minSwlKg,
    footprintMm,
    inStockOnly,
    sortBy = 'featured',
  } = filters;

  const parsedIntent = parseNaturalLanguageSearchIntent(query);
  const effectiveMinSwl =
    minSwlKg && minSwlKg > 0 ? minSwlKg : parsedIntent.detectedMinSwlKg || 0;
  const effectiveFootprint =
    footprintMm && footprintMm !== 'all' ? footprintMm : parsedIntent.detectedFootprintMm;

  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
      const facetFilters: string[] = [];
      if (categorySlug && categorySlug !== 'all') {
        facetFilters.push(`categorySlug:${categorySlug}`);
      }
      if (effectiveFootprint && effectiveFootprint !== 'all') {
        facetFilters.push(`footprintMm:${effectiveFootprint}`);
      }
      if (inStockOnly) {
        facetFilters.push('inStock:true');
      }

      const numericFilters: string[] = [];
      if (effectiveMinSwl > 0) {
        numericFilters.push(`swlKg>=${effectiveMinSwl}`);
      }

      const effectiveQuery =
        effectiveFootprint && parsedIntent.detectedFootprintMm
          ? parsedIntent.cleanedQuery
          : query;

      const res = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
          },
          body: JSON.stringify({
            query: effectiveQuery,
            facetFilters,
            numericFilters,
            facets: ['categorySlug', 'footprintMm', 'stackableHeight', 'inStock'],
            hitsPerPage: 50,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.hits)) {
          // Verify the index has been seeded (if an unfiltered empty query returns 0 hits, fall back to local replica)
          const isUnfilteredEmptyQuery =
            !effectiveQuery && facetFilters.length === 0 && numericFilters.length === 0;
          if (!isUnfilteredEmptyQuery || data.hits.length > 0) {
            return {
              hits: sortProducts(data.hits as Product[], sortBy),
              facets: data.facets,
              parsedIntent,
              engine: 'algolia-dsn',
            };
          }
        }
      }
    } catch {
      // Fall back to deterministic local replica when offline or unconfigured
    }
  }

  const normalizedQuery = (
    effectiveFootprint && parsedIntent.detectedFootprintMm
      ? parsedIntent.cleanedQuery
      : query
  )
    .trim()
    .toLowerCase();

  const enrichedLocal = initialProducts.map((p) => enrichProductForAlgolia(p));

  const filtered = enrichedLocal.filter((product) => {
    if (categorySlug && categorySlug !== 'all' && product.categorySlug !== categorySlug) {
      return false;
    }
    if (effectiveFootprint && effectiveFootprint !== 'all' && product.footprintMm !== effectiveFootprint) {
      return false;
    }
    if (effectiveMinSwl && product.swlKg < effectiveMinSwl) {
      return false;
    }
    if (inStockOnly && !product.inStock) {
      return false;
    }
    if (!normalizedQuery) return true;

    const searchableText = [
      product.title,
      product.sku,
      product.categoryName,
      product.shortDescription,
      product.fullDescription,
      product.steelSpecification,
      product.footprintMm,
      product.dimensionsText,
      `${product.swlKg}kg`,
      ...product.highlights,
      ...product.useCases,
      ...product.environmentTags,
    ]
      .join(' ')
      .toLowerCase();

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => searchableText.includes(token));
  });

  // Compute local facet counts for parity
  const facets: Record<string, Record<string, number>> = {
    categorySlug: {},
    footprintMm: {},
  };
  for (const p of enrichedLocal) {
    facets.categorySlug[p.categorySlug] = (facets.categorySlug[p.categorySlug] || 0) + 1;
    facets.footprintMm[p.footprintMm] = (facets.footprintMm[p.footprintMm] || 0) + 1;
  }

  return {
    hits: sortProducts(filtered, sortBy),
    facets,
    parsedIntent,
    engine: 'algolia-local-replica',
  };
}

function buildCompatibilityReason(
  source: AlgoliaProductRecord,
  candidate: AlgoliaProductRecord
): { reason: string; suggestedConfig?: ProductRecommendation['suggestedConfig'] } {
  if (
    source.footprintMm === candidate.footprintMm &&
    source.stackableHeight.includes('4-High') &&
    candidate.stackableHeight.includes('4-High')
  ) {
    return {
      reason: `Identical ${source.externalLengthMm}×${source.externalWidthMm}mm Footprint — Inter-Stacks 4-High on Pressed Pyramid Feet`,
      suggestedConfig: {
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        quantity: 4,
        note: 'Order in multiples of 4 to combine on 1 HGV pallet space',
      },
    };
  }

  if (
    source.categorySlug === 'cantilever-bar-racks' &&
    candidate.categorySlug === 'cantilever-bar-racks'
  ) {
    return {
      reason:
        candidate.externalLengthMm < source.externalLengthMm
          ? 'Compact 1800mm Saw-Station Companion for Point-of-Use Cutting'
          : 'Full-Length 2400mm 3-Bay Rack for 6m Bulk Bar Stockholding',
      suggestedConfig: {
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        quantity: 2,
      },
    };
  }

  if (candidate.sku === 'SSS-PST-1111D') {
    return {
      reason: 'Demountable Post Pallet — Nests 4:1 Empty to Cut Return Freight Volume by 75%',
      suggestedConfig: {
        finishOption: 'galvanised',
        mobilityOption: 'forklift-pockets',
        quantity: 4,
      },
    };
  }

  if (candidate.sku === 'SSS-HOP-4T1000') {
    return {
      reason: 'Modular 4-Tier Gravity Feed Hopper — Shares 50×50×3mm RHS Forklift Base Geometry',
      suggestedConfig: {
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        quantity: 2,
      },
    };
  }

  return {
    reason: `Compatible UKCA-Certified Fleet Pairing (${candidate.swlKg}kg SWL • ${candidate.footprintMm.replace('x', '×')}mm)`,
    suggestedConfig: {
      finishOption: 'standard-blue',
      mobilityOption: 'standard-feet',
      quantity: 4,
    },
  };
}

function buildSimilarityReason(
  source: AlgoliaProductRecord,
  candidate: AlgoliaProductRecord
): string {
  if (source.categorySlug === candidate.categorySlug) {
    return `Same ${candidate.categoryName} Range • ${candidate.swlKg}kg SWL (${candidate.externalLengthMm}×${candidate.externalWidthMm}mm)`;
  }
  if (source.swlKg === candidate.swlKg) {
    return `Matching ${candidate.swlKg}kg Safe Working Load (SWL) & ${candidate.stackableHeight}`;
  }
  return `Alternative Heavy-Gauge British Steel Specification (${candidate.swlKg}kg SWL • ${candidate.steelSpecification})`;
}

export async function getProductRecommendations(
  targetProduct: Product,
  allProducts: Product[] = SEED_PRODUCTS,
  limit = 3
): Promise<ProductRecommendationsResult> {
  const enrichedSource = enrichProductForAlgolia(targetProduct);

  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
      // 1. Try Algolia Recommend API (/1/indexes/*/recommendations) first
      const recRes = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
          },
          body: JSON.stringify({
            requests: [
              {
                indexName: ALGOLIA_INDEX,
                objectID: targetProduct.id,
                model: 'bought-together',
                threshold: 0,
                maxRecommendations: limit,
              },
              {
                indexName: ALGOLIA_INDEX,
                objectID: targetProduct.id,
                model: 'related-products',
                threshold: 0,
                maxRecommendations: limit,
              },
            ],
          }),
        }
      );

      if (recRes.ok) {
        const recData = await recRes.json();
        const btHits = (recData?.results?.[0]?.hits || []) as Product[];
        const relHits = (recData?.results?.[1]?.hits || []) as Product[];

        if (btHits.length > 0 && relHits.length > 0) {
          return {
            compatibleEquipment: btHits.slice(0, limit).map((hit, idx) => {
              const enrichedHit = enrichProductForAlgolia(hit);
              const { reason, suggestedConfig } = buildCompatibilityReason(
                enrichedSource,
                enrichedHit
              );
              return {
                product: hit,
                relationship: 'compatible-equipment',
                matchReason: reason,
                score: 100 - idx * 10,
                suggestedConfig,
              };
            }),
            similarSpecifications: relHits.slice(0, limit).map((hit, idx) => {
              const enrichedHit = enrichProductForAlgolia(hit);
              return {
                product: hit,
                relationship: 'similar-specification',
                matchReason: buildSimilarityReason(enrichedSource, enrichedHit),
                score: 95 - idx * 10,
              };
            }),
            engine: 'algolia-recommend',
          };
        }
      }

      // 2. Live Algolia Multi-Query with Scored optionalFilters (works immediately on Day 1 without waiting for 1,000+ click events)
      const compatibleOptionalFilters = [
        ...enrichedSource.compatibleSkus.map((sku, idx) => `sku:${sku}<score=${12 - idx * 2}>`),
        `footprintMm:${enrichedSource.footprintMm}<score=8>`,
      ];

      const similarOptionalFilters = [
        `categorySlug:${enrichedSource.categorySlug}<score=10>`,
        `stackableHeight:${enrichedSource.stackableHeight}<score=5>`,
        `footprintMm:${enrichedSource.footprintMm}<score=4>`,
      ];

      const dsnRes = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/queries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
            'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
          },
          body: JSON.stringify({
            requests: [
              {
                indexName: ALGOLIA_INDEX,
                query: '',
                facetFilters: [`id:-${targetProduct.id}`],
                optionalFilters: compatibleOptionalFilters,
                sumOrFiltersScores: true,
                hitsPerPage: limit,
              },
              {
                indexName: ALGOLIA_INDEX,
                query: '',
                facetFilters: [`id:-${targetProduct.id}`],
                optionalFilters: similarOptionalFilters,
                sumOrFiltersScores: true,
                hitsPerPage: limit,
              },
            ],
          }),
        }
      );

      if (dsnRes.ok) {
        const dsnData = await dsnRes.json();
        const compHits = (dsnData?.results?.[0]?.hits || []) as Product[];
        const simHits = (dsnData?.results?.[1]?.hits || []) as Product[];

        if (compHits.length > 0 || simHits.length > 0) {
          return {
            compatibleEquipment: compHits.slice(0, limit).map((hit, idx) => {
              const enrichedHit = enrichProductForAlgolia(hit);
              const { reason, suggestedConfig } = buildCompatibilityReason(
                enrichedSource,
                enrichedHit
              );
              return {
                product: hit,
                relationship: 'compatible-equipment',
                matchReason: reason,
                score: 98 - idx * 8,
                suggestedConfig,
              };
            }),
            similarSpecifications: simHits.slice(0, limit).map((hit, idx) => {
              const enrichedHit = enrichProductForAlgolia(hit);
              return {
                product: hit,
                relationship: 'similar-specification',
                matchReason: buildSimilarityReason(enrichedSource, enrichedHit),
                score: 94 - idx * 8,
              };
            }),
            engine: 'algolia-dsn-scored',
          };
        }
      }
    } catch {
      // Fall back to deterministic local replica scoring below
    }
  }

  // Deterministic Local Replica Scoring Fallback
  const candidates = allProducts
    .filter((p) => p.id !== targetProduct.id && p.slug !== targetProduct.slug)
    .map((p) => enrichProductForAlgolia(p));

  const compatibleScored = [...candidates]
    .map((candidate) => {
      let score = 50;
      const skuIndex = enrichedSource.compatibleSkus.indexOf(candidate.sku);
      if (skuIndex !== -1) score += 40 - skuIndex * 8;
      if (candidate.footprintMm === enrichedSource.footprintMm) score += 20;
      const { reason, suggestedConfig } = buildCompatibilityReason(enrichedSource, candidate);
      return {
        product: candidate,
        relationship: 'compatible-equipment' as const,
        matchReason: reason,
        score,
        suggestedConfig,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const similarScored = [...candidates]
    .map((candidate) => {
      let score = 40;
      if (candidate.categorySlug === enrichedSource.categorySlug) score += 35;
      if (candidate.stackableHeight === enrichedSource.stackableHeight) score += 15;
      if (candidate.swlKg === enrichedSource.swlKg) score += 10;
      if (candidate.footprintMm === enrichedSource.footprintMm) score += 10;
      return {
        product: candidate,
        relationship: 'similar-specification' as const,
        matchReason: buildSimilarityReason(enrichedSource, candidate),
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    compatibleEquipment: compatibleScored,
    similarSpecifications: similarScored,
    engine: 'algolia-local-replica',
  };
}

function sortProducts(products: Product[], sortBy: SearchFilterOptions['sortBy']): Product[] {
  const copy = [...products];
  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => a.basePriceExVatPence - b.basePriceExVatPence);
    case 'price-desc':
      return copy.sort((a, b) => b.basePriceExVatPence - a.basePriceExVatPence);
    case 'swl-desc':
      return copy.sort((a, b) => b.swlKg - a.swlKg);
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function trackAlgoliaEvent(event: {
  eventType: 'view' | 'click' | 'conversion';
  eventName: string;
  objectIDs: string[];
  userToken?: string;
}): void {
  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY || typeof fetch === 'undefined') {
    return;
  }

  try {
    // Deprioritize background telemetry fetch so user-initiated search/quote calls never contend for bandwidth
    fetch('https://insights.algolia.io/1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
      },
      body: JSON.stringify({
        events: [
          {
            eventType: event.eventType,
            eventName: event.eventName,
            index: ALGOLIA_INDEX,
            userToken: event.userToken || 'uk-trade-buyer-session',
            objectIDs: event.objectIDs,
            timestamp: Date.now(),
          },
        ],
      }),
      priority: 'low',
    } as RequestInit).catch(() => {
      // Non-blocking background analytics
    });
  } catch {
    // Ignore telemetry errors
  }
}
