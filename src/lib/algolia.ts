import { Product } from '@/types/catalog';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
const ALGOLIA_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'stillage_products';

export interface SearchFilterOptions {
  query?: string;
  categorySlug?: string;
  minSwlKg?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'swl-desc';
}

export async function searchProductsWithAlgolia(
  initialProducts: Product[],
  filters: SearchFilterOptions
): Promise<{ hits: Product[]; engine: 'algolia-dsn' | 'algolia-local-replica' }> {
  const { query = '', categorySlug, minSwlKg, inStockOnly, sortBy = 'featured' } = filters;

  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
      const facetFilters: string[] = [];
      if (categorySlug && categorySlug !== 'all') {
        facetFilters.push(`categorySlug:${categorySlug}`);
      }
      if (inStockOnly) {
        facetFilters.push('inStock:true');
      }

      const numericFilters: string[] = [];
      if (minSwlKg && minSwlKg > 0) {
        numericFilters.push(`swlKg>=${minSwlKg}`);
      }

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
            query,
            facetFilters,
            numericFilters,
            hitsPerPage: 50,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.hits) && data.hits.length > 0) {
          return {
            hits: sortProducts(data.hits as Product[], sortBy),
            engine: 'algolia-dsn',
          };
        }
      }
    } catch {
      // Fall back to deterministic local replica when offline or unconfigured
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = initialProducts.filter((product) => {
    if (categorySlug && categorySlug !== 'all' && product.categorySlug !== categorySlug) {
      return false;
    }
    if (minSwlKg && product.swlKg < minSwlKg) {
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
      product.steelSpecification,
      `${product.externalLengthMm}x${product.externalWidthMm}`,
      `${product.swlKg}kg`,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return {
    hits: sortProducts(filtered, sortBy),
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
