import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/contentful';
import { ProductConfigurator } from '@/components/ProductConfigurator';
import { ProductCard } from '@/components/ProductCard';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Stillage Specification Not Found' };
  }
  return {
    title: `${product.title} (${product.sku})`,
    description: product.shortDescription,
  };
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

  const relatedProducts = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div>
      {/* Breadcrumb Bar */}
      <div className="bg-surface-sandLight border-b border-steel-200">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductConfigurator product={product} />

        {/* Related Stillages */}
        <section className="mt-16 pt-12 border-t border-steel-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
                COMPATIBLE HANDLING EQUIPMENT
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase text-brand-navy mt-0.5">
                Other Heavy-Duty Stillage Specifications
              </h2>
            </div>
            <Link
              href="/products"
              className="font-display font-bold uppercase text-sm text-stillage-blue hover:underline"
            >
              View Full Range &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
