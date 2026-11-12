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
  const hasDrawing = Boolean(product.technicalDrawing);

  return (
    <article className="group bg-surface-white border border-steel-200 hover:border-stillage-blue rounded-sm transition-all duration-200 flex flex-col justify-between relative shadow-xs hover:shadow-lg overflow-hidden">
      <div>
        {/* Clean SKU & SWL Metadata Header */}
        <div className="px-5 py-3 border-b border-steel-200 bg-steel-50 flex items-center justify-between text-xs font-mono">
          <span className="text-steel-600 font-bold">{product.sku}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-brand-navy text-white font-bold text-[11px]">
            <Shield className="w-3 h-3 text-accent-teal" />
            {product.swlKg}kg SWL
          </span>
        </div>

        {/* Crisp Studio White Image Stage with CAD Blueprint Hover Flick */}
        <Link
          href={`/products/${product.slug}`}
          className="block relative h-60 p-6 overflow-hidden bg-surface-white group-hover:bg-steel-50 transition-colors duration-300 border-b border-steel-200"
        >
          {/* Primary Image */}
          {priority ? (
            <img
              src={product.primaryImage}
              alt={product.title}
              fetchPriority="high"
              width={480}
              height={360}
              className={`w-full h-full object-contain transition-all duration-200 ${
                hasDrawing
                  ? 'group-hover:opacity-0 group-hover:scale-105'
                  : 'group-hover:scale-105'
              }`}
            />
          ) : (
            <img
              src={product.primaryImage}
              alt={product.title}
              loading="lazy"
              width={480}
              height={360}
              className={`w-full h-full object-contain transition-all duration-200 ${
                hasDrawing
                  ? 'group-hover:opacity-0 group-hover:scale-105'
                  : 'group-hover:scale-105'
              }`}
            />
          )}

          {/* Technical Drawing (Flicks on Mouseover/Hover) */}
          {hasDrawing && product.technicalDrawing ? (
            <img
              src={product.technicalDrawing}
              alt={`${product.title} Technical Drawing Blueprint`}
              loading="lazy"
              width={480}
              height={360}
              className="absolute inset-0 w-full h-full p-6 object-contain opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 pointer-events-none"
            />
          ) : null}

          {/* CAD Blueprint Badge on Hover */}
          {hasDrawing ? (
            <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-brand-navy/95 text-white border border-white/20 text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
              CAD Drawing
            </span>
          ) : null}

          {product.ukcaCertified && (
            <span className="absolute bottom-3 left-3 bg-steel-100 text-steel-800 border border-steel-200 text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm">
              UKCA Tested
            </span>
          )}
        </Link>

        {/* Product Title, Summary & Key Dimensions */}
        <div className="p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stillage-blue font-bold">
            {product.categoryName}
          </div>
          <h3 className="font-display font-bold text-lg uppercase text-brand-navy mt-1 leading-snug group-hover:text-stillage-blue transition-colors line-clamp-2">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
          <p className="text-xs text-steel-600 mt-2 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Clean 2-Column Technical Specs */}
          <div className="mt-4 pt-3.5 border-t border-steel-100 grid grid-cols-2 gap-3 text-xs font-mono text-steel-800">
            <div>
              <span className="text-steel-400 block text-[10px] uppercase">Dimensions</span>
              <span className="font-bold">
                {product.externalLengthMm}×{product.externalWidthMm}×{product.externalHeightMm}mm
              </span>
            </div>
            <div>
              <span className="text-steel-400 block text-[10px] uppercase">Stacking</span>
              <span className="font-bold text-stillage-blue truncate block">
                {product.stackableHeight}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pricing & CTA Block */}
      <div className="px-5 py-4 bg-steel-50 border-t border-steel-200 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-lg text-brand-navy">
              {priceDisplay.primary}
            </span>
            <span className="font-mono text-[10px] text-steel-600">
              {priceDisplay.label}
            </span>
          </div>
          <div className="font-mono text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>10+ Rate: {bulkDisplay.primary}</span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-sm inline-flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
        >
          <span>Configure &amp; Buy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
