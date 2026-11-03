import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/seedCatalog';
import { Category, Product } from '@/types/catalog';

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
