import { SEED_BLOG_POSTS, SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/seedCatalog';
import {
  SEED_HOME_PAGE,
  SEED_NAVIGATION_MENUS,
  SEED_SITE_MICROTEXTS,
} from '@/data/seedSiteContent';
import { BlogPost, Category, Product } from '@/types/catalog';
import {
  HomePageContent,
  NavigationItem,
  NavigationMenuMap,
  SiteContentBundle,
  SiteMicrotexts,
} from '@/types/content';

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
  'asset-sss-cant-3b8a-blueprint': '/images/products/sss-cant-3b8a-blueprint.jpg',
  'asset-sss-msh-1210hd-blueprint': '/images/products/sss-msh-1210hd-blueprint.jpg',
  'asset-bbfh2-1-blueprint': '/images/products/bbfh2-1-blueprint.jpg',
  'asset-base-render-bbfh2-1': '/images/products/base-render-bbfh2-1.jpg',
  'asset-base-render-sss-cant-3b8a': '/images/products/base-render-sss-cant-3b8a.jpg',
  'asset-base-render-sss-msh-1210hd': '/images/products/base-render-sss-msh-1210hd.jpg',
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
  contentType: string,
  tags: string[] = ['contentful-site']
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
      next: { revalidate: 60, tags },
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
    Omit<Product, 'id' | 'primaryImage' | 'secondaryImage' | 'technicalDrawing' | 'gallery'> & {
      primaryImage?: string | ContentfulAssetLink;
      secondaryImage?: string | ContentfulAssetLink;
      technicalDrawing?: string | ContentfulAssetLink;
      gallery?: (string | ContentfulAssetLink)[];
    }
  >('product');
  if (!result || result.items.length === 0) {
    return SEED_PRODUCTS;
  }

  const { items, assetMap } = result;
  return items.map((item) => {
    const rawGallery = Array.isArray(item.fields.gallery)
      ? item.fields.gallery
          .map((img) => resolveContentfulImage(img, assetMap))
          .filter((url): url is string => Boolean(url))
      : [];
    const legacySecondary = resolveContentfulImage(item.fields.secondaryImage, assetMap);
    const gallery =
      rawGallery.length > 0 ? rawGallery : legacySecondary ? [legacySecondary] : [];

    return {
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
      secondaryImage: legacySecondary,
      technicalDrawing: resolveContentfulImage(item.fields.technicalDrawing, assetMap),
      gallery,
      backdropStyle: item.fields.backdropStyle === 'white' ? 'white' : 'sand',
      highlights: item.fields.highlights || [],
      seoTitle: item.fields.seoTitle,
      seoDescription: item.fields.seoDescription,
      faqItems: item.fields.faqItems || [],
    };
  });
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

function nonEmpty(value: string | undefined | null, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

function sortNavItems(items: NavigationItem[]): NavigationItem[] {
  return [...items]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((item) => ({
      ...item,
      children: Array.isArray(item.children) ? sortNavItems(item.children) : undefined,
    }));
}

export async function getHomePageContent(): Promise<HomePageContent> {
  const result = await fetchContentfulCollection<
    Partial<Omit<HomePageContent, 'heroImage' | 'ogImage'>> & {
      heroImage?: string | ContentfulAssetLink;
      ogImage?: string | ContentfulAssetLink;
    }
  >('homePage');

  if (!result || result.items.length === 0) {
    return SEED_HOME_PAGE;
  }

  const fields = result.items[0].fields;
  const { assetMap } = result;

  return {
    heroHeadlineLine1: nonEmpty(fields.heroHeadlineLine1, SEED_HOME_PAGE.heroHeadlineLine1),
    heroHeadlineLine2: nonEmpty(fields.heroHeadlineLine2, SEED_HOME_PAGE.heroHeadlineLine2),
    heroSubtitleTemplate: nonEmpty(
      fields.heroSubtitleTemplate,
      SEED_HOME_PAGE.heroSubtitleTemplate
    ),
    heroCtaLabel: nonEmpty(fields.heroCtaLabel, SEED_HOME_PAGE.heroCtaLabel),
    heroCtaHref: nonEmpty(fields.heroCtaHref, SEED_HOME_PAGE.heroCtaHref),
    heroImage:
      resolveContentfulImage(fields.heroImage, assetMap, SEED_HOME_PAGE.heroImage) ||
      SEED_HOME_PAGE.heroImage,
    heroImageAlt: nonEmpty(fields.heroImageAlt, SEED_HOME_PAGE.heroImageAlt),
    filterAllLabel: nonEmpty(fields.filterAllLabel, SEED_HOME_PAGE.filterAllLabel),
    filterCantileverLabel: nonEmpty(
      fields.filterCantileverLabel,
      SEED_HOME_PAGE.filterCantileverLabel
    ),
    filterHopperLabel: nonEmpty(fields.filterHopperLabel, SEED_HOME_PAGE.filterHopperLabel),
    filterSheetMeshLabel: nonEmpty(
      fields.filterSheetMeshLabel,
      SEED_HOME_PAGE.filterSheetMeshLabel
    ),
    filterPostPalletsLabel: nonEmpty(
      fields.filterPostPalletsLabel,
      SEED_HOME_PAGE.filterPostPalletsLabel
    ),
    guidesTitle: nonEmpty(fields.guidesTitle, SEED_HOME_PAGE.guidesTitle),
    guidesSubtitle: nonEmpty(fields.guidesSubtitle, SEED_HOME_PAGE.guidesSubtitle),
    guidesViewAllLabel: nonEmpty(fields.guidesViewAllLabel, SEED_HOME_PAGE.guidesViewAllLabel),
    seoTitle: nonEmpty(fields.seoTitle, SEED_HOME_PAGE.seoTitle),
    seoDescription: nonEmpty(fields.seoDescription, SEED_HOME_PAGE.seoDescription),
    ogImage: resolveContentfulImage(fields.ogImage, assetMap),
  };
}

export async function getNavigationMenus(): Promise<NavigationMenuMap> {
  const result = await fetchContentfulCollection<{
    menuKey?: string;
    title?: string;
    items?: NavigationItem[];
  }>('navigationMenu');

  if (!result || result.items.length === 0) {
    return SEED_NAVIGATION_MENUS;
  }

  const menus: NavigationMenuMap = { ...SEED_NAVIGATION_MENUS };

  for (const entry of result.items) {
    const key = entry.fields.menuKey;
    if (!key) continue;
    const rawItems = Array.isArray(entry.fields.items) ? entry.fields.items : [];
    const fallbackMenu = SEED_NAVIGATION_MENUS[key];
    menus[key] = {
      menuKey: key,
      title: nonEmpty(entry.fields.title, fallbackMenu?.title || key),
      items:
        rawItems.length > 0
          ? sortNavItems(rawItems)
          : fallbackMenu?.items || [],
    };
  }

  return menus;
}

function mergeMicrotextGroup<T extends object>(
  defaults: T,
  overrides: Record<string, unknown> | undefined
): T {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const val = overrides[key as string];
    if (typeof val === 'string' && val.trim().length > 0) {
      merged[key] = val as T[keyof T];
    }
  }
  return merged;
}

export async function getAllComponentMicrotexts(): Promise<SiteMicrotexts> {
  const result = await fetchContentfulCollection<{
    componentKey?: string;
    title?: string;
    labels?: Record<string, string>;
  }>('componentMicrotexts');

  if (!result || result.items.length === 0) {
    return SEED_SITE_MICROTEXTS;
  }

  const byKey: Record<string, Record<string, string>> = {};
  for (const entry of result.items) {
    if (entry.fields.componentKey && entry.fields.labels) {
      byKey[entry.fields.componentKey] = entry.fields.labels;
    }
  }

  return {
    header: mergeMicrotextGroup(SEED_SITE_MICROTEXTS.header, byKey['header']),
    footer: mergeMicrotextGroup(SEED_SITE_MICROTEXTS.footer, byKey['footer']),
    productCard: mergeMicrotextGroup(
      SEED_SITE_MICROTEXTS.productCard,
      byKey['product-card']
    ),
    blogCard: mergeMicrotextGroup(SEED_SITE_MICROTEXTS.blogCard, byKey['blog-card']),
    configurator: mergeMicrotextGroup(
      SEED_SITE_MICROTEXTS.configurator,
      byKey['product-configurator']
    ),
    checkout: mergeMicrotextGroup(SEED_SITE_MICROTEXTS.checkout, byKey['checkout']),
  };
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  const [homePage, navigation, microtexts] = await Promise.all([
    getHomePageContent(),
    getNavigationMenus(),
    getAllComponentMicrotexts(),
  ]);

  return { homePage, navigation, microtexts };
}
