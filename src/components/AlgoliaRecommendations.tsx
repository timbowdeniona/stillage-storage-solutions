'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ProductRecommendation, ProductRecommendationsResult } from '@/types/catalog';
import { ProductCard } from '@/components/ProductCard';
import { trackAlgoliaEvent } from '@/lib/algolia';

interface AlgoliaRecommendationsProps {
  sourceProductSku: string;
  recommendations: ProductRecommendationsResult;
}

export function AlgoliaRecommendations({
  sourceProductSku,
  recommendations,
}: AlgoliaRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'compatible' | 'similar'>('compatible');

  const activeList: ProductRecommendation[] =
    activeTab === 'compatible'
      ? recommendations.compatibleEquipment
      : recommendations.similarSpecifications;

  return (
    <section className="mt-16 pt-12 border-t border-steel-200" aria-labelledby="algolia-rec-heading">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-stillage-blue font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMPATIBLE EQUIPMENT • FOR {sourceProductSku}</span>
          </div>
          <h2
            id="algolia-rec-heading"
            className="font-display font-bold text-2xl sm:text-3xl uppercase text-brand-navy mt-1"
          >
            Recommended Stillages &amp; Fleet Equipment
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Recommendation type"
          className="inline-flex bg-steel-50 p-1 border border-steel-200 rounded-sm self-start lg:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'compatible'}
            onClick={() => setActiveTab('compatible')}
            className={`px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'compatible'
                ? 'bg-stillage-blue text-white'
                : 'text-steel-800 hover:text-brand-navy'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compatible &amp; Inter-Stacking ({recommendations.compatibleEquipment.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'similar'}
            onClick={() => setActiveTab('similar')}
            className={`px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'similar'
                ? 'bg-stillage-blue text-white'
                : 'text-steel-800 hover:text-brand-navy'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Similar Specifications ({recommendations.similarSpecifications.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activeList.map((rec) => {
          const configLink = rec.suggestedConfig
            ? `/products/${rec.product.slug}?finish=${encodeURIComponent(
                rec.suggestedConfig.finishOption || 'standard-blue'
              )}&mobility=${encodeURIComponent(
                rec.suggestedConfig.mobilityOption || 'standard-feet'
              )}&qty=${rec.suggestedConfig.quantity || 4}`
            : `/products/${rec.product.slug}`;

          return (
            <div
              key={`${activeTab}-${rec.product.id}`}
              className="flex flex-col justify-between space-y-2"
              onClick={() =>
                trackAlgoliaEvent({
                  eventType: 'click',
                  eventName:
                    activeTab === 'compatible'
                      ? 'Clicked Compatible Recommendation'
                      : 'Clicked Similar Specification',
                  objectIDs: [rec.product.id],
                })
              }
            >
              {/* Match Reason Callout Strip */}
              <div className="bg-steel-50 border border-steel-200 border-l-4 border-l-stillage-blue px-3.5 py-2.5 flex items-start gap-2 text-xs rounded-sm">
                <CheckCircle2 className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] uppercase text-steel-600 font-bold">
                    {activeTab === 'compatible' ? 'Fleet Compatibility Match' : 'Specification Match'}
                  </div>
                  <div className="font-medium text-brand-navy leading-snug mt-0.5">
                    {rec.matchReason}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <ProductCard product={rec.product} />
              </div>

              {rec.suggestedConfig && (
                <Link
                  href={configLink}
                  className="bg-brand-navy hover:bg-stillage-blue text-white px-3.5 py-2 rounded-sm font-mono text-[11px] font-bold flex items-center justify-between transition-colors"
                >
                  <span>
                    1-Click Pre-Configured ({rec.suggestedConfig.quantity || 4}× Units)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
