import { SEED_BLOG_POSTS, SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/seedCatalog';
import { BlogPost, Category, Product } from '@/types/catalog';

const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'q9ktabz6dqby';
const CONTENTFUL_ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
const CONTENTFUL_CDA_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || '';

interface ContentfulEntry<T> {
  sys: { id: string };
  fields: T;
}

interface ContentfulCollection<T> {
  items: ContentfulEntry<T>[];
}

async function fetchContentfulEntries<T>(contentType: string): Promise<ContentfulEntry<T>[] | null> {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_CDA_TOKEN) {
    return null;
  }

  try {
    const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries?content_type=${contentType}&limit=100`;
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
    return data.items || null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const items = await fetchContentfulEntries<Omit<Category, 'id'>>('category');
  if (!items || items.length === 0) {
    return SEED_CATEGORIES;
  }

  return items
    .map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      slug: item.fields.slug,
      description: item.fields.description,
      badgeText: item.fields.badgeText,
      imageUrl: item.fields.imageUrl,
      displayOrder: item.fields.displayOrder ?? 99,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getProducts(): Promise<Product[]> {
  const items = await fetchContentfulEntries<Omit<Product, 'id'>>('product');
  if (!items || items.length === 0) {
    return SEED_PRODUCTS;
  }

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
    primaryImage: item.fields.primaryImage || '/images/products/cantilever-rack-cutout.png',
    secondaryImage: item.fields.secondaryImage,
    backdropStyle: item.fields.backdropStyle === 'white' ? 'white' : 'sand',
    highlights: item.fields.highlights || [],
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export function mapContentfulBlogPost(item: ContentfulEntry<Partial<Omit<BlogPost, 'id'>>>): BlogPost {
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
    heroImage: item.fields.heroImage || '/images/products/cantilever-rack-cutout.png',
    backdropStyle: item.fields.backdropStyle === 'white' ? 'white' : 'sand',
    tags: item.fields.tags || [],
    keyTakeaways: item.fields.keyTakeaways || [],
    body: item.fields.body || '',
    relatedProductSkus: item.fields.relatedProductSkus || [],
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const items = await fetchContentfulEntries<Partial<Omit<BlogPost, 'id'>>>('blogPost');
  const posts =
    !items || items.length === 0 ? [...SEED_BLOG_POSTS] : items.map((item) => mapContentfulBlogPost(item));

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
