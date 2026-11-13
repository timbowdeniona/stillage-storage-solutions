'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/catalog';
import { useVat } from '@/context/VatContext';
import { useSiteContent } from '@/context/SiteContentContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { formatBothPrices } = useVat();
  const { microtexts } = useSiteContent();
  const cardCopy = microtexts.productCard;
  const priceDisplay = formatBothPrices(product.basePriceExVatPence);
  const hasDrawing = Boolean(product.technicalDrawing);

  return (
    <article className="group bg-surface-white border border-steel-200 hover:border-stillage-blue rounded-xl p-5 transition-all duration-200 flex flex-col justify-between relative shadow-xs hover:shadow-md">
      <div>
        {/* Crisp White Image Stage with CAD Blueprint Hover Flick */}
        <Link
          href={`/products/${product.slug}`}
          className="block relative h-48 p-2 overflow-hidden bg-surface-white flex items-center justify-center rounded-lg"
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
              className="absolute inset-0 w-full h-full p-2 object-contain opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 pointer-events-none"
            />
          ) : null}

          {/* CAD Blueprint Badge on Hover */}
          {hasDrawing ? (
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-brand-navy/95 text-white border border-white/20 text-[10px] font-mono uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
              {cardCopy.cadBadgeLabel || 'CAD Drawing'}
            </span>
          ) : null}
        </Link>

        {/* Product Title */}
        <h3 className="font-display font-bold text-xl text-brand-navy mt-3 leading-tight group-hover:text-stillage-blue transition-colors line-clamp-2 min-h-[2.75rem]">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>

        {/* Option 1 Spec Pill Badges: SWL & Dimensions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="bg-steel-100 text-brand-navy font-display font-bold text-xs px-2.5 py-1 rounded">
            {product.swlKg.toLocaleString('en-GB')}kg {cardCopy.swlSuffix}
          </span>
          <span className="bg-steel-100 text-brand-navy font-display font-bold text-xs px-2.5 py-1 rounded">
            {product.externalLengthMm}x{product.externalWidthMm}x{product.externalHeightMm}mm
          </span>
        </div>
      </div>

      {/* Price & Full-Width Configure & Buy Button matching Option 1 */}
      <div className="mt-4 pt-1">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-display font-extrabold text-2xl text-brand-navy">
            {priceDisplay.primary}
          </span>
          <span className="font-display font-bold text-xs text-brand-navy">
            {priceDisplay.label.toLowerCase()}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="w-full bg-stillage-blue hover:bg-stillage-blueLight text-white font-display font-bold text-base py-2.5 px-4 rounded-md text-center block transition-colors shadow-xs"
        >
          {cardCopy.configureButtonLabel}
        </Link>
      </div>
    </article>
  );
}
