import React from 'react';
import { CheckCircle2, HelpCircle, ShieldCheck, TableProperties } from 'lucide-react';
import { FaqItem, Product } from '@/types/catalog';
import { getProductFaqs } from '@/lib/seo';

interface ProductGeoSectionProps {
  product: Product;
}

export function ProductGeoSection({ product }: ProductGeoSectionProps) {
  const faqs: FaqItem[] = getProductFaqs(product);
  const basePriceGbp = (product.basePriceExVatPence / 100).toFixed(2);
  const tier5Gbp = ((product.basePriceExVatPence * 0.95) / 100).toFixed(2);
  const tier10Gbp = ((product.basePriceExVatPence * 0.9) / 100).toFixed(2);

  return (
    <section
      aria-labelledby="geo-spec-sheet-heading"
      className="mt-14 pt-12 border-t border-steel-200 space-y-12"
    >
      {/* Direct Answer & Technical Specification Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Direct Entity Definition & Compliance Summary */}
        <div className="lg:col-span-5 bg-steel-50 border-l-4 border-stillage-blue border border-steel-200 p-6 rounded-sm space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stillage-blue font-bold">
            <ShieldCheck className="w-4 h-4 text-accent-teal" />
            <span>UK Engineering Specification Summary</span>
          </div>

          <h2
            id="geo-spec-sheet-heading"
            className="font-display font-extrabold text-2xl uppercase text-brand-navy leading-tight"
          >
            What is the {product.title} ({product.sku})?
          </h2>

          <p className="text-sm text-steel-800 leading-relaxed">
            The <strong>{product.title}</strong> (SKU: <code className="font-mono font-bold text-brand-navy">{product.sku}</code>) is a UK-manufactured industrial steel storage unit engineered from{' '}
            <strong>{product.steelSpecification}</strong> with a certified{' '}
            <strong>{product.swlKg.toLocaleString('en-GB')} kg Safe Working Load (SWL)</strong> and{' '}
            <strong>{product.stackableHeight}</strong> rating.
          </p>

          <div className="pt-2 border-t border-steel-200 space-y-2">
            <div className="font-mono text-xs font-bold uppercase text-brand-navy">
              Regulatory &amp; Quality Standards
            </div>
            <ul className="space-y-1.5 text-xs text-steel-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <span>
                  <strong>PUWER 1998 Compliant:</strong> Manufactured in structural British box-section steel with load-rated welds.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <span>
                  <strong>BS EN ISO 1461 Option:</strong> Available hot-dip galvanised for 25+ year outdoor corrosion resistance.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                <span>
                  <strong>LOLER 1998 Bespoke Option:</strong> Overhead crane lifting eyes available to order via our UK fabrication desk.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Technical Data Sheet Table */}
        <div className="lg:col-span-7 border border-steel-200 bg-surface-white rounded-sm overflow-hidden shadow-xs">
          <div className="bg-brand-navy text-surface-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-bold uppercase tracking-wider text-sm">
              <TableProperties className="w-4 h-4 text-stillage-sky" />
              <span>Technical Data Sheet — {product.sku}</span>
            </div>
            <span className="font-mono text-xs text-stillage-sky">
              {product.ukcaCertified ? 'UKCA / SWL Certified' : 'Industrial Grade'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table
              aria-label={`Technical specification table for ${product.title}`}
              className="w-full text-left border-collapse text-xs sm:text-sm"
            >
              <tbody className="divide-y divide-steel-200">
                <tr className="bg-steel-50">
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600 w-2/5">
                    Specification Code (SKU)
                  </th>
                  <td className="py-3 px-4 font-mono font-bold text-brand-navy">{product.sku}</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    External Footprint (L × W × H)
                  </th>
                  <td className="py-3 px-4 font-mono font-bold text-brand-navy">
                    {product.externalLengthMm}mm × {product.externalWidthMm}mm × {product.externalHeightMm}mm
                  </td>
                </tr>
                <tr className="bg-steel-50">
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Safe Working Load (SWL)
                  </th>
                  <td className="py-3 px-4 font-mono font-bold text-stillage-blue">
                    {product.swlKg.toLocaleString('en-GB')} kg (Uniformly Distributed)
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Vertical Stacking Rating
                  </th>
                  <td className="py-3 px-4 font-semibold text-brand-navy">{product.stackableHeight}</td>
                </tr>
                <tr className="bg-steel-50">
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Unladen Tare Weight
                  </th>
                  <td className="py-3 px-4 font-mono text-steel-900">{product.unitWeightKg} kg</td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Steel Box-Section Gauge
                  </th>
                  <td className="py-3 px-4 font-mono text-steel-900">{product.steelSpecification}</td>
                </tr>
                <tr className="bg-steel-50">
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Protective Finish Options
                  </th>
                  <td className="py-3 px-4 text-steel-900">
                    {product.standardFinish} (Standard), Raw Mill Steel (-£10), Custom Corporate RAL (+£25), Hot-Dip Galvanised BS EN ISO 1461 (+£45)
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    Online Trade Pricing Tiers (Ex. VAT)
                  </th>
                  <td className="py-3 px-4 font-mono text-brand-navy">
                    1–4 Units: <strong>£{basePriceGbp}</strong> | 5–9 Units (-5%):{' '}
                    <strong>£{tier5Gbp}</strong> | 10+ Units (-10%): <strong>£{tier10Gbp}</strong>
                  </td>
                </tr>
                <tr className="bg-steel-50">
                  <th scope="row" className="py-3 px-4 font-mono text-xs uppercase text-steel-600">
                    UK HGV Pallet Shipping
                  </th>
                  <td className="py-3 px-4 text-steel-900">
                    Up to 4 units per HGV pallet space • {product.leadTimeText}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Buyer & Technical FAQ Accordion */}
      <div className="border border-steel-200 bg-surface-white p-6 sm:p-8 rounded-sm">
        <div className="pb-6 border-b border-steel-200">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-stillage-blue font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Engineering &amp; Procurement Questions</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl uppercase text-brand-navy mt-1">
            Buyer Questions for {product.sku}
          </h3>
        </div>

        <div className="divide-y divide-steel-200 mt-2">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group py-4" open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer list-none font-display font-bold text-base sm:text-lg uppercase text-brand-navy group-hover:text-stillage-blue">
                <span>{faq.question}</span>
                <span className="ml-4 font-mono text-xs px-2 py-0.5 bg-steel-50 border border-steel-200 rounded-sm text-brand-navy">
                  Q{idx + 1}
                </span>
              </summary>
              <p className="mt-2.5 text-sm text-steel-800 leading-relaxed pl-0 sm:pr-12">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
