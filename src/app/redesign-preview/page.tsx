import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, GitBranch, Layers, Sliders, LayoutGrid } from 'lucide-react';

export const metadata = {
  title: 'UX Redesign Review — Stillage Storage Solutions',
  description: 'Review the 3 UX redesign concepts for our 12-product inventory.',
};

export default function RedesignPreviewPage() {
  const approaches = [
    {
      id: 1,
      title: 'Approach 1: Clean Industrial Catalog & Visual Grid',
      subtitle: 'Zero Clutter, Instant Product Access',
      branch: 'design/approach-1-clean-catalog',
      image: '/images/redesign/approach-1-clean-catalog.jpg',
      icon: LayoutGrid,
      highlight: 'Recommended for fast B2B buying',
      summary:
        'Eliminates nested showcase stages, secondary banners, and deep category clicks. Places all 12 models in an airy, scannable grid with one-click filter pills, clean specs, and direct configuration.',
      pros: [
        'All 12 products visible in under 30 seconds',
        'Generous white space — no visual claustrophobia',
        'Immediate price and SWL transparency on every card',
        'Retains 100% of brand colors and typography',
      ],
      bestFor: 'Clients wanting modern e-commerce simplicity and fast ordering.',
    },
    {
      id: 2,
      title: 'Approach 2: Interactive Spec Finder & Solution Guide',
      subtitle: 'Decision-Driven Guided Selection',
      branch: 'design/approach-2-spec-finder',
      image: '/images/redesign/approach-2-spec-finder.jpg',
      icon: Sliders,
      highlight: 'Best for guiding non-technical buyers',
      summary:
        'Features a clean 3-step interactive selector widget directly in the hero (Storage Type → Load SWL → Footprint). Dynamically surfaces matching stillages alongside technical CAD blueprint previews.',
      pros: [
        'Solves decision fatigue for buyers who do not know SKU codes',
        'Matches buyers directly by fork-truck / warehouse capacity',
        'Interactive CAD blueprint preview on every matched card',
        'Seamless gateway for custom dimensions & CAD quotes',
      ],
      bestFor: 'Clients wanting an engineered, consultative website experience.',
    },
    {
      id: 3,
      title: 'Approach 3: Editorial Craftsmanship & Master Showcase',
      subtitle: 'High-End Engineering Authority',
      branch: 'design/approach-3-editorial-showcase',
      image: '/images/redesign/approach-3-editorial-showcase.jpg',
      icon: Layers,
      highlight: 'Best for high-trust fabrication authority',
      summary:
        'Industrial engineering portfolio aesthetic. Deep Navy hero with subtle blueprint gridlines, flagship stillage with weld/SWL callout lines, 3 curated master families, and a 12-model specification comparison table.',
      pros: [
        'Positions company as a premier British fabricator rather than a reseller',
        'Master comparison matrix lets procurement officers compare all 12 models in one view',
        'Hero callout dots highlight British steel quality and safety standards',
        'Extremely authoritative, professional, and uncluttered',
      ],
      bestFor: 'Clients aiming for corporate authority, large procurement tenders, and CAD contracts.',
    },
  ];

  return (
    <div className="bg-surface-sandLight min-h-screen text-steel-900 pb-20">
      {/* Top Header */}
      <div className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-surface-sand hover:text-white font-mono text-xs uppercase font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider mb-2">
                Client Review &amp; Selection
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
                3 UX Redesign Approaches <span className="text-surface-sand">(12 Products)</span>
              </h1>
              <p className="text-steel-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Redesigned to eliminate visual clutter, remove redundant nesting, and give the 12 core models space to shine — keeping your exact brand colours and typography.
              </p>
            </div>

            <div className="bg-brand-navyDark p-4 rounded border border-white/10 text-xs font-mono space-y-2 shrink-0">
              <div className="text-surface-sand font-bold flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent-teal" />
                <span>Dedicated GitHub Branches</span>
              </div>
              <div className="text-steel-300">Each design is committed to its own branch:</div>
              <ul className="text-steel-400 space-y-1 text-[11px]">
                <li><code className="text-white bg-white/10 px-1 py-0.5 rounded">design/approach-1-clean-catalog</code></li>
                <li><code className="text-white bg-white/10 px-1 py-0.5 rounded">design/approach-2-spec-finder</code></li>
                <li><code className="text-white bg-white/10 px-1 py-0.5 rounded">design/approach-3-editorial-showcase</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {approaches.map((app) => {
          const IconComponent = app.icon;
          return (
            <section
              key={app.id}
              id={`approach-${app.id}`}
              className="bg-surface-white border-2 border-steel-200 rounded-sm overflow-hidden shadow-lg"
            >
              {/* Header Bar */}
              <div className="bg-brand-navy text-surface-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded bg-stillage-blue flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-surface-sand text-brand-navy font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded-sm">
                      {app.highlight}
                    </span>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight mt-1 text-white">
                      {app.title}
                    </h2>
                    <p className="text-steel-300 text-xs font-mono">{app.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs bg-brand-navyDark px-3 py-1.5 rounded border border-white/15 text-surface-sand">
                    Branch: <strong className="text-white">{app.branch}</strong>
                  </span>
                </div>
              </div>

              {/* High-Resolution Mockup Image */}
              <div className="bg-steel-100 p-4 sm:p-8 border-b border-steel-200">
                <div className="border border-steel-300 rounded shadow-md overflow-hidden bg-white">
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="text-center font-mono text-xs text-steel-600 mt-3">
                  Full-fidelity desktop layout mockup for {app.title}
                </div>
              </div>

              {/* Details & UX Breakdown */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-display font-bold text-xl uppercase text-brand-navy">
                    UX Strategy &amp; Layout Changes
                  </h3>
                  <p className="text-steel-800 text-sm leading-relaxed">{app.summary}</p>
                  <div className="p-4 bg-surface-sandLight rounded border border-surface-sandDark text-xs text-brand-navy">
                    <strong>Best For:</strong> {app.bestFor}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-display font-bold text-lg uppercase text-brand-navy">
                    Key Client Benefits
                  </h3>
                  <ul className="space-y-2.5 text-xs text-steel-800">
                    {app.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 font-mono text-xs">
                    <span className="text-steel-600">Checkout command:</span>
                    <pre className="bg-steel-900 text-surface-sand p-2.5 rounded mt-1 overflow-x-auto text-[11px]">
                      git checkout {app.branch}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
