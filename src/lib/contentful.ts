import { SEED_BLOG_POSTS, SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/seedCatalog';
import { BlogPost, Category, Product } from '@/types/catalog';

function getEnv(name: string, fallback = ''): string {
  if (typeof process === 'undefined' || !process.env) return fallback;
  return process.env[name] || fallback;
}

const CONTENTFUL_SPACE_ID = getEnv('NEXT_PUBLIC_CONTENTFUL_SPACE_ID', 'q9ktabz6dqby');
const CONTENTFUL_ENVIRONMENT = getEnv('NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT', 'master');
const CONTENTFUL_CDA_TOKEN = getEnv('CONTENTFUL_ACCESS_TOKEN', '');

interface ContentfulAssetLink {
  sys: {
    type: 'Link';
    linkType: 'Asset';
    id: string;
  };
}

interface ContentfulAsset {
  sys: { id: string };
  fields?: {
    title?: string;
    file?: {
      url?: string;
      contentType?: string;
    };
  };
}

interface ContentfulEntry<T> {
  sys: { id: string };
  fields: T;
}

interface ContentfulCollection<T> {
  items: ContentfulEntry<T>[];
  includes?: {
    Asset?: ContentfulAsset[];
  };
}

const STATIC_ASSET_FALLBACK_MAP: Record<string, string> = {
  'asset-cantilever-rack-cutout': '/images/products/cantilever-rack-cutout.png',
  'asset-cantilever-rack-sand': '/images/products/cantilever-rack-sand.png',
  'asset-stacked-hopper-stillage': '/images/products/stacked-hopper-stillage.png',
};

export function resolveContentfulImage(
  value: string | ContentfulAssetLink | undefined | null,
  assetMap: Record<string, string>,
  fallback?: string
): string | undefined {
  if (!value) return fallback;
  if (typeof value === 'string') {
    return value.startsWith('//') ? `https:${value}` : value;
  }
  if (typeof value === 'object' && value.sys?.id) {
    const resolved = assetMap[value.sys.id] || STATIC_ASSET_FALLBACK_MAP[value.sys.id];
    if (resolved) return resolved;
  }
  return fallback;
}

async function fetchContentfulCollection<T>(
  contentType: string
): Promise<{ items: ContentfulEntry<T>[]; assetMap: Record<string, string> } | null> {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_CDA_TOKEN) {
    return null;
  }

  try {
    const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?content_type=${contentType}&include=2&limit=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CONTENTFUL_CDA_TOKEN}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data: ContentfulCollection<T> = await res.json();
    const assetMap: Record<string, string> = {};
    for (const asset of data.includes?.Asset || []) {
      const rawUrl = asset.fields?.file?.url;
      if (asset.sys?.id && rawUrl) {
        assetMap[asset.sys.id] = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl;
      }
    }

    return {
      items: data.items || [],
      assetMap,
    };
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const result = await fetchContentfulCollection<
    Omit<Category, 'id' | 'imageUrl'> & { imageUrl?: string | ContentfulAssetLink }
  >('category');
  if (!result || result.items.length === 0) {
    return SEED_CATEGORIES;
  }

  const { items, assetMap } = result;
  return items
    .map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      slug: item.fields.slug,
      description: item.fields.description,
      badgeText: item.fields.badgeText,
      imageUrl: resolveContentfulImage(item.fields.imageUrl, assetMap),
      displayOrder: item.fields.displayOrder ?? 99,
      seoTitle: item.fields.seoTitle,
      seoDescription: item.fields.seoDescription,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getProducts(): Promise<Product[]> {
  const result = await fetchContentfulCollection<
    Omit<Product, 'id' | 'primaryImage' | 'secondaryImage'> & {
      primaryImage?: string | ContentfulAssetLink;
      secondaryImage?: string | ContentfulAssetLink;
    }
  >('product');
  if (!result || result.items.length === 0) {
    return SEED_PRODUCTS;
  }

  const { items, assetMap } = result;
  return items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title,
    slug: item.fields.slug,
    sku: item.fields.sku,
    categorySlug: item.fields.categorySlug,
    categoryName: item.fields.categoryName,
    shortDescription: item.fields.shortDescription,
    fullDescription: item.fields.fullDescription,
    basePriceExVatPence: item.fields.basePriceExVatPence,
    swlKg: item.fields.swlKg,
    externalLengthMm: item.fields.externalLengthMm,
    externalWidthMm: item.fields.externalWidthMm,
    externalHeightMm: item.fields.externalHeightMm,
    unitWeightKg: item.fields.unitWeightKg,
    stackableHeight: item.fields.stackableHeight,
    steelSpecification: item.fields.steelSpecification,
    standardFinish: item.fields.standardFinish,
    ukcaCertified: Boolean(item.fields.ukcaCertified),
    inStock: Boolean(item.fields.inStock),
    leadTimeText: item.fields.leadTimeText,
    featured: Boolean(item.fields.featured),
    primaryImage:
      resolveContentfulImage(
        item.fields.primaryImage,
        assetMap,
        '/images/products/cantilever-rack-cutout.png'
      ) || '/images/products/cantilever-rack-cutout.png',
    secondaryImage: resolveContentfulImage(item.fields.secondaryImage, assetMap),
    backdropStyle: item.fields.backdropStyle === 'white' ? 'white' : 'sand',
    highlights: item.fields.highlights || [],
    seoTitle: item.fields.seoTitle,
    seoDescription: item.fields.seoDescription,
    faqItems: item.fields.faqItems || [],
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export function mapContentfulBlogPost(
  item: ContentfulEntry<
    Partial<Omit<BlogPost, 'id' | 'heroImage'>> & {
      heroImage?: string | ContentfulAssetLink;
    }
  >,
  assetMap: Record<string, string> = {}
): BlogPost {
  return {
    id: item.sys.id,
    title: item.fields.title || 'Untitled Technical Guide',
    slug: item.fields.slug || item.sys.id,
    excerpt: item.fields.excerpt || '',
    category: item.fields.category || 'Technical Standards & Safety',
    author: item.fields.author || 'Stillage Storage Engineering Team',
    authorRole: item.fields.authorRole || 'UK Steel Fabrication Specialists',
    publishedAt: item.fields.publishedAt || '2026-10-01',
    readingTimeMinutes: item.fields.readingTimeMinutes ?? 5,
    featured: Boolean(item.fields.featured),
    heroImage:
      resolveContentfulImage(
        item.fields.heroImage,
        assetMap,
        '/images/products/cantilever-rack-cutout.png'
      ) || '/images/products/cantilever-rack-cutout.png',
    backdropStyle: item.fields.backdropStyle === 'white' ? 'white' : 'sand',
    tags: item.fields.tags || [],
    keyTakeaways: item.fields.keyTakeaways || [],
    body: item.fields.body || '',
    relatedProductSkus: item.fields.relatedProductSkus || [],
    seoTitle: item.fields.seoTitle,
    seoDescription: item.fields.seoDescription,
    faqItems: item.fields.faqItems || [],
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const result = await fetchContentfulCollection<
    Partial<Omit<BlogPost, 'id' | 'heroImage'>> & {
      heroImage?: string | ContentfulAssetLink;
    }
  >('blogPost');
  const posts =
    !result || result.items.length === 0
      ? [...SEED_BLOG_POSTS]
      : result.items.map((item) => mapContentfulBlogPost(item, result.assetMap));

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const featured = posts.filter((post) => post.featured);
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}
