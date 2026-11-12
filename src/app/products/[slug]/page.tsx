import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/contentful';
import { getProductRecommendations } from '@/lib/algolia';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductMetadata,
  buildProductSchema,
  getProductFaqs,
} from '@/lib/seo';
import { ProductConfigurator } from '@/components/ProductConfigurator';
import { ProductGeoSection } from '@/components/ProductGeoSection';
import { AlgoliaRecommendations } from '@/components/AlgoliaRecommendations';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Stillage Specification Not Found' };
  }
  return buildProductMetadata(product);
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getProductBySlug(slug), getProducts()]);

  if (!product) {
    notFound();
  }

  const recommendations = await getProductRecommendations(product, allProducts, 3);
  const productJsonLd = buildProductSchema(product);
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'All Stillages & Storage Racks', path: '/products' },
    { name: product.categoryName, path: `/products?category=${product.categorySlug}` },
    { name: `${product.title} (${product.sku})`, path: `/products/${product.slug}` },
  ]);
  const faqJsonLd = buildFaqSchema(getProductFaqs(product));

  return (
    <div className="bg-surface-white min-h-screen">
      {/* Schema.org JSON-LD for Google Rich Snippets & AI Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Clean Breadcrumb Bar */}
      <div className="bg-steel-50 border-b border-steel-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-mono text-steel-600"
          >
            <Link href="/" className="hover:text-brand-navy">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-brand-navy">
              All Stillages
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-brand-navy"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-navy font-bold">{product.sku}</span>
          </nav>
        </div>
      </div>

      {/* Main Configurator & Spec Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="font-mono text-sm text-steel-600 py-8">
              Loading interactive steel configurator...
            </div>
          }
        >
          <ProductConfigurator product={product} />
        </Suspense>

        {/* Technical Specification Table, Direct-Answer Summary & Buyer FAQs */}
        <ProductGeoSection product={product} />

        {/* Compatible Equipment & Similar Specifications */}
        <AlgoliaRecommendations
          sourceProductSku={product.sku}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
