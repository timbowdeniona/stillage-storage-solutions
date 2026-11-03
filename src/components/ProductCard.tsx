'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { Product } from '@/types/catalog';
import { useVat } from '@/context/VatContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { formatBothPrices } = useVat();
  const priceDisplay = formatBothPrices(product.basePriceExVatPence);
  const bulkTenPlusPence = Math.round(product.basePriceExVatPence * 0.9);
  const bulkDisplay = formatBothPrices(bulkTenPlusPence);

  return (
    <article className="group bg-surface-white border border-steel-200 hover:border-stillage-blue transition-all duration-200 flex flex-col justify-between relative shadow-sm hover:shadow-md">
      {/* Top Blueprint Metadata Bar */}
      <div>
        <div className="px-4 py-2.5 border-b border-steel-200 bg-steel-100/70 flex items-center justify-between text-xs font-mono">
          <span className="text-steel-600 font-bold">{product.sku}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-brand-navy text-surface-sand font-bold text-[11px]">
            <Shield className="w-3 h-3 text-accent-teal" />
            {product.swlKg}kg SWL
          </span>
        </div>

        {/* Dual-Surface Product Image Stage (White -> Warm Workshop Sand on Hover) */}
        <Link
          href={`/products/${product.slug}`}
          className={`block relative h-60 p-6 overflow-hidden transition-colors duration-300 ${
            product.backdropStyle === 'sand'
              ? 'bg-surface-sand/65 group-hover:bg-surface-sand'
              : 'bg-surface-white group-hover:bg-surface-sand/75'
          }`}
        >
          {/* Subtle Blueprint Corner Brackets */}
          <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-brand-navy/25 pointer-events-none" />
          <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-brand-navy/25 pointer-events-none" />
          <span className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-brand-navy/25 pointer-events-none" />
          <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-brand-navy/25 pointer-events-none" />

          {priority ? (
            <img
              src={product.primaryImage}
              alt={product.title}
              fetchPriority="high"
              width={480}
              height={360}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src={product.primaryImage}
              alt={product.title}
              loading="lazy"
              width={480}
              height={360}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          )}

          {product.ukcaCertified && (
            <span className="absolute bottom-3 left-3 bg-brand-navy/90 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm">
              UKCA Tested
            </span>
          )}
        </Link>

        {/* Technical Spec 3-Column Strip */}
        <div className="grid grid-cols-3 border-y border-steel-200 bg-surface-sandLight text-[11px] font-mono divide-x divide-steel-200 text-center">
          <div className="py-2 px-1">
            <div className="text-steel-600 text-[10px] uppercase">Footprint</div>
            <div className="font-bold text-steel-900">
              {product.externalLengthMm}×{product.externalWidthMm}
            </div>
          </div>
          <div className="py-2 px-1">
            <div className="text-steel-600 text-[10px] uppercase">Height</div>
            <div className="font-bold text-steel-900">{product.externalHeightMm}mm</div>
          </div>
          <div className="py-2 px-1">
            <div className="text-steel-600 text-[10px] uppercase">Stacking</div>
            <div className="font-bold text-stillage-blue truncate px-1">
              {product.stackableHeight}
            </div>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="p-4">
          <div className="text-[11px] font-display uppercase tracking-wider text-stillage-blue font-bold">
            {product.categoryName}
          </div>
          <h3 className="font-display font-bold text-lg text-steel-900 mt-0.5 leading-snug group-hover:text-stillage-blue transition-colors">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
          <p className="text-xs text-steel-600 mt-2 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>
      </div>

      {/* Bottom Pricing & CTA Block */}
      <div className="p-4 pt-0 mt-2">
        <div className="border-t border-steel-200 pt-3 flex items-baseline justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-xl text-brand-navy">
                {priceDisplay.primary}
              </span>
              <span className="font-mono text-[11px] font-semibold text-steel-600">
                {priceDisplay.label}
              </span>
            </div>
            <div className="font-mono text-[11px] text-steel-600">{priceDisplay.secondary}</div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-accent-amber/15 text-accent-amber border border-accent-amber/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm">
              10+ Rate: {bulkDisplay.primary}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium mt-2.5 mb-3">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {product.leadTimeText}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="w-full bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-sm py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>Configure &amp; Buy</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
