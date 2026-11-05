import type { Metadata } from 'next';
import { BlogPost, Category, FaqItem, Product } from '@/types/catalog';

export const SITE_URL = 'https://stillagestoragesolutions.co.uk';
export const SITE_NAME = 'Stillage Storage Solutions';
export const TRADE_PHONE = '+44-1978-800500';
export const TRADE_PHONE_DISPLAY = '01978 800 500';
export const TRADE_EMAIL = 'sales@stillagestoragesolutions.co.uk';

export function absoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function buildOgImageUrl(params: {
  title: string;
  subtitle?: string;
  badge?: string;
  sku?: string;
  swl?: string;
  price?: string;
}): string {
  const search = new URLSearchParams();
  search.set('title', params.title);
  if (params.subtitle) search.set('subtitle', params.subtitle);
  if (params.badge) search.set('badge', params.badge);
  if (params.sku) search.set('sku', params.sku);
  if (params.swl) search.set('swl', params.swl);
  if (params.price) search.set('price', params.price);
  return `${SITE_URL}/api/og?${search.toString()}`;
}

/**
 * Parses simple Contentful FAQ strings ("Question? | Answer.") into structured FaqItem objects.
 * Allows non-technical Contentful editors to add FAQs in a plain list without writing JSON.
 */
export function parseFaqItems(rawItems?: string[]): FaqItem[] {
  if (!rawItems || rawItems.length === 0) return [];
  const parsed: FaqItem[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'string') continue;
    const parts = item.split('|').map((s) => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      parsed.push({
        question: parts[0],
        answer: parts.slice(1).join(' '),
      });
    }
  }
  return parsed;
}

/**
 * Generates automatic, engineering-accurate FAQs for a product when the client leaves Contentful's
 * optional faqItems field blank. Ensures 100% of products qualify for Google FAQ Rich Results and AI Search citations.
 */
export function getProductFaqs(product: Product): FaqItem[] {
  const customFaqs = parseFaqItems(product.faqItems);
  if (customFaqs.length > 0) {
    return customFaqs;
  }

  const priceExVat = (product.basePriceExVatPence / 100).toFixed(2);
  return [
    {
      question: `What is the Safe Working Load (SWL) and stacking capacity of the ${product.title} (${product.sku})?`,
      answer: `The ${product.title} (${product.sku}) is engineered in ${product.steelSpecification} British steel with a certified ${product.swlKg.toLocaleString('en-GB')} kg Safe Working Load (SWL) and is rated as ${product.stackableHeight}.`,
    },
    {
      question: `What are the external dimensions and unit tare weight of ${product.sku}?`,
      answer: `The external footprint measures ${product.externalLengthMm}mm (L) × ${product.externalWidthMm}mm (W) × ${product.externalHeightMm}mm (H), with an unladen tare weight of ${product.unitWeightKg} kg.`,
    },
    {
      question: `What protective finishes and mobility options are available for this stillage?`,
      answer: `It is supplied as standard in ${product.standardFinish} (£${priceExVat} Ex. VAT), and can be configured online in Raw Unpainted Mill Steel (-£10/unit), Custom Corporate RAL (+£25/unit), or Hot-Dip Galvanised to BS EN ISO 1461 (+£45/unit), with optional enclosed 4-way forklift pockets or heavy-duty castors.`,
    },
    {
      question: `What are the UK pallet delivery lead times and bulk trade discounts for ${product.sku}?`,
      answer: `${product.leadTimeText}. Up to 4 units ship per oversized HGV pallet space nationwide across the UK, with automatic online bulk discounts of 5% on 5+ units and 10% on 10+ units.`,
    },
  ];
}

export function getBlogPostFaqs(post: BlogPost): FaqItem[] {
  const customFaqs = parseFaqItems(post.faqItems);
  if (customFaqs.length > 0) {
    return customFaqs;
  }

  return [
    {
      question: `What are the key engineering takeaways from "${post.title}"?`,
      answer:
        post.keyTakeaways.length > 0
          ? post.keyTakeaways.join(' ')
          : post.excerpt,
    },
    {
      question: `Which UK manufactured stillages relate to ${post.category}?`,
      answer:
        post.relatedProductSkus.length > 0
          ? `This engineering guide covers stillage specifications ${post.relatedProductSkus.join(', ')}, manufactured in the UK by Stillage Storage Solutions and compliant with UKCA and PUWER 1998 standards.`
          : `All Stillage Storage Solutions products are manufactured in British box-section steel with certified Safe Working Load (SWL) ratings.`,
    },
  ];
}

/**
 * Resolves SEO title & description with Zero-Configuration Fallbacks for non-technical Contentful editors.
 */
export function resolveProductSeo(product: Product): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string;
  usedFallbackTitle: boolean;
  usedFallbackDescription: boolean;
} {
  const priceGbp = `£${(product.basePriceExVatPence / 100).toFixed(2)}`;
  const customTitle = product.seoTitle?.trim();
  const customDesc = product.seoDescription?.trim();

  const fallbackTitle = `${product.title} (${product.sku}) — ${product.swlKg}kg SWL`;
  const rawFallbackDesc = `${product.shortDescription} ${product.externalLengthMm}x${product.externalWidthMm}x${product.externalHeightMm}mm, ${product.swlKg}kg SWL, ${product.stackableHeight}. From ${priceGbp} Ex. VAT with fast UK HGV delivery.`;
  const fallbackDescription =
    rawFallbackDesc.length > 160 ? `${rawFallbackDesc.slice(0, 157).trim()}...` : rawFallbackDesc;

  return {
    title: customTitle || fallbackTitle,
    description: customDesc || fallbackDescription,
    canonicalUrl: absoluteUrl(`/products/${product.slug}`),
    ogImageUrl: buildOgImageUrl({
      title: product.title,
      subtitle: `${product.externalLengthMm}×${product.externalWidthMm}×${product.externalHeightMm}mm • ${product.steelSpecification}`,
      badge: product.categoryName,
      sku: product.sku,
      swl: `${product.swlKg}kg SWL`,
      price: `${priceGbp} Ex. VAT`,
    }),
    usedFallbackTitle: !customTitle,
    usedFallbackDescription: !customDesc,
  };
}

export function resolveBlogPostSeo(post: BlogPost): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string;
  usedFallbackTitle: boolean;
  usedFallbackDescription: boolean;
} {
  const customTitle = post.seoTitle?.trim();
  const customDesc = post.seoDescription?.trim();

  const fallbackDescription =
    post.excerpt.length > 160 ? `${post.excerpt.slice(0, 157).trim()}...` : post.excerpt;

  return {
    title: customTitle || post.title,
    description: customDesc || fallbackDescription,
    canonicalUrl: absoluteUrl(`/blog/${post.slug}`),
    ogImageUrl: buildOgImageUrl({
      title: post.title,
      subtitle: `By ${post.author} (${post.authorRole})`,
      badge: post.category,
      sku: `${post.readingTimeMinutes} MIN GUIDE`,
    }),
    usedFallbackTitle: !customTitle,
    usedFallbackDescription: !customDesc,
  };
}

export function resolveCategorySeo(category: Category): {
  title: string;
  description: string;
  canonicalUrl: string;
} {
  return {
    title: category.seoTitle?.trim() || `${category.title} | Heavy-Duty UK Steel Stillages`,
    description:
      category.seoDescription?.trim() ||
      `${category.description} Direct UK factory steel fabrication with 5%–10% bulk trade discounts.`,
    canonicalUrl: absoluteUrl(`/products?category=${category.slug}`),
  };
}

export function buildProductMetadata(product: Product): Metadata {
  const seo = resolveProductSeo(product);
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      url: seo.canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: seo.ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.title} (${product.sku}) - ${product.swlKg}kg SWL UK Steel Stillage`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [seo.ogImageUrl],
    },
  };
}

export function buildBlogPostMetadata(post: BlogPost): Metadata {
  const seo = resolveBlogPostSeo(post);
  return {
    title: seo.title,
    description: seo.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      url: seo.canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: seo.ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [seo.ogImageUrl],
    },
  };
}

/**
 * Schema.org JSON-LD Generators for Rich Snippets & Generative Engine Optimisation (GEO)
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Manufacturer', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Stillage Storage Solutions UK',
    url: SITE_URL,
    logo: `${SITE_URL}/images/products/cantilever-rack-cutout.png`,
    image: `${SITE_URL}/images/products/cantilever-rack-cutout.png`,
    description:
      'Direct UK manufacturer and online supplier of heavy-duty steel stillages, double-sided cantilever bar storage racks, modular stackable hopper bins, mesh security cages, and demountable post pallets.',
    telephone: TRADE_PHONE,
    email: TRADE_EMAIL,
    priceRange: '££',
    currenciesAccepted: 'GBP',
    paymentAccepted: 'Credit Card, Debit Card, B2B Proforma Invoice, BACS',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Wrexham Industrial Estate',
      addressLocality: 'Wrexham',
      addressRegion: 'Wales & West Midlands Hub',
      postalCode: 'LL13 9UG',
      addressCountry: 'GB',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:30',
        closes: '17:00',
      },
    ],
    knowsAbout: [
      'Heavy-Duty Steel Stillages',
      'Double-Sided Cantilever Bar Racks',
      'Stackable Hopper Bin Stillages',
      'Demountable Post Pallets',
      'Mesh Sided Stillage Cages',
      'PUWER 1998 & LOLER 1998 Stillage Compliance',
      'BS EN ISO 1461 Hot-Dip Galvanised Steel Fabrication',
      'RAL 5010 Gentian Blue Industrial Coating',
    ],
  };
}

export function buildProductSchema(product: Product) {
  const priceGbp = (product.basePriceExVatPence / 100).toFixed(2);
  const imageUrl = product.primaryImage.startsWith('http')
    ? product.primaryImage
    : absoluteUrl(product.primaryImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.title,
    sku: product.sku,
    mpn: product.sku,
    description: product.fullDescription,
    image: [imageUrl],
    category: product.categoryName,
    material: `British Structural Box-Section Steel (${product.steelSpecification})`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    manufacturer: {
      '@id': `${SITE_URL}/#organization`,
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: product.unitWeightKg,
      unitCode: 'KGM',
    },
    depth: {
      '@type': 'QuantitativeValue',
      value: product.externalLengthMm,
      unitCode: 'MMT',
    },
    width: {
      '@type': 'QuantitativeValue',
      value: product.externalWidthMm,
      unitCode: 'MMT',
    },
    height: {
      '@type': 'QuantitativeValue',
      value: product.externalHeightMm,
      unitCode: 'MMT',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Safe Working Load (SWL)',
        value: `${product.swlKg} kg`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Stackable Rating',
        value: product.stackableHeight,
      },
      {
        '@type': 'PropertyValue',
        name: 'Steel Specification',
        value: product.steelSpecification,
      },
      {
        '@type': 'PropertyValue',
        name: 'Standard Finish',
        value: product.standardFinish,
      },
      {
        '@type': 'PropertyValue',
        name: 'Compliance Certification',
        value: product.ukcaCertified ? 'UKCA / PUWER 1998 Load Tested' : 'Standard Industrial Grade',
      },
    ],
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: 'GBP',
      price: priceGbp,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      seller: {
        '@id': `${SITE_URL}/#organization`,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'GB',
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '65.00',
          currency: 'GBP',
        },
      },
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : absoluteUrl(item.path),
    })),
  };
}

export function buildBlogPostSchema(post: BlogPost) {
  const imageUrl = post.heroImage.startsWith('http')
    ? post.heroImage
    : absoluteUrl(post.heroImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${absoluteUrl(`/blog/${post.slug}`)}#article`,
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${post.slug}`),
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
