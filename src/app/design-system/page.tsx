import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FINISH_OPTIONS } from '@/data/seedCatalog';

export const metadata: Metadata = {
  title: 'Design System, Colour Palette & Typography Specimens',
  description:
    'Visual reference sheet of colours, RAL steel finishes, and Google Fonts for Stillage Storage Solutions (stillagestoragesolutions.co.uk).',
};

const COLOUR_GROUPS = [
  {
    title: '1. Primary Brand & Structural Navy',
    description: 'Used for top headers, navigation bars, hero backgrounds, and footers.',
    swatches: [
      {
        name: 'Brand Navy',
        hex: '#0F2342',
        cssVar: '--color-brand-navy',
        twClass: 'bg-brand-navy',
        textSample: '#FFFFFF',
        usage: 'Main Header, Hero Banner, Footer, Table Headers',
      },
      {
        name: 'Brand Navy Dark',
        hex: '#09172C',
        cssVar: '--color-brand-navy-dark',
        twClass: 'bg-brand-navyDark',
        textSample: '#F2E3CE',
        usage: 'Top Utility Strip & Footer Trust Bar',
      },
      {
        name: 'Brand Navy Light',
        hex: '#18345E',
        cssVar: 'N/A',
        twClass: 'bg-brand-navyLight',
        textSample: '#FFFFFF',
        usage: 'Category Navigation Strip & Secondary Hovers',
      },
    ],
  },
  {
    title: '2. Interactive & Stillage Blue Accents (RAL 5010)',
    description:
      'Matched to standard factory-painted RAL 5010 Gentian / Stillage Blue steel frames.',
    swatches: [
      {
        name: 'Stillage Blue',
        hex: '#145DA0',
        cssVar: '--color-stillage-blue',
        twClass: 'bg-stillage-blue',
        textSample: '#FFFFFF',
        usage: 'Primary CTAs ("Configure & Buy"), Active Filters & Borders',
      },
      {
        name: 'Stillage Blue Dark',
        hex: '#0D447A',
        cssVar: '--color-stillage-blue-dark',
        twClass: 'bg-stillage-blueDark',
        textSample: '#FFFFFF',
        usage: 'Primary CTA Hover State',
      },
      {
        name: 'Stillage Blue Light',
        hex: '#2176C7',
        cssVar: 'N/A',
        twClass: 'bg-stillage-blueLight',
        textSample: '#FFFFFF',
        usage: 'Search Button Hover & Dark-Mode Icon Accents',
      },
    ],
  },
  {
    title: '3. Product Stage Backdrops & Surfaces',
    description: 'Warm workshop sand and studio white surfaces that make blue steel cutouts pop.',
    swatches: [
      {
        name: 'Workshop Sand',
        hex: '#F2E3CE',
        cssVar: '--color-surface-sand',
        twClass: 'bg-surface-sand',
        textSample: '#0F2342',
        usage: 'Hero Showcase Stage, Card Hover Stage, Badges on Navy',
      },
      {
        name: 'Workshop Sand Light',
        hex: '#FAF5EE',
        cssVar: '--color-surface-sand-light',
        twClass: 'bg-surface-sandLight',
        textSample: '#1C2026',
        usage: 'Alternating Page Sections, Quote Box, Filter Toolbar',
      },
      {
        name: 'Studio White',
        hex: '#FFFFFF',
        cssVar: '--color-surface-white',
        twClass: 'bg-surface-white',
        textSample: '#1C2026',
        usage: 'Page Canvas, Default Product Cards & Configurator Panel',
      },
    ],
  },
  {
    title: '4. Industrial Steel Greys & Status Accents',
    description: 'Typography inks, 1px blueprint borders, UKCA badges, and bulk discount highlights.',
    swatches: [
      {
        name: 'Steel 900 (Primary Ink)',
        hex: '#1C2026',
        cssVar: '--color-steel-900',
        twClass: 'bg-steel-900',
        textSample: '#FFFFFF',
        usage: 'Core Body Text & Product Titles',
      },
      {
        name: 'Steel 600 (Muted Ink)',
        hex: '#4A525D',
        cssVar: '--color-steel-600',
        twClass: 'bg-steel-600',
        textSample: '#FFFFFF',
        usage: 'Secondary Spec Labels & Metadata',
      },
      {
        name: 'Steel 200 (Blueprint Grid)',
        hex: '#DCE1E7',
        cssVar: '--color-steel-200',
        twClass: 'bg-steel-200',
        textSample: '#1C2026',
        usage: '1px Structural Card & Table Borders',
      },
      {
        name: 'Certification Teal',
        hex: '#00897B',
        cssVar: '--color-accent-teal',
        twClass: 'bg-accent-teal',
        textSample: '#FFFFFF',
        usage: 'UKCA / SWL Tested Badges & Icons',
      },
      {
        name: 'Safety Amber',
        hex: '#D97706',
        cssVar: '--color-safety-amber',
        twClass: 'bg-accent-amber',
        textSample: '#FFFFFF',
        usage: 'Bulk Tier Discounts (Save 10%) & Tail-Lift Notices',
      },
    ],
  },
];

export default function DesignSystemPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="bg-brand-navy text-surface-white p-8 border-l-8 border-stillage-blue flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase text-surface-sand">
            CLIENT BRAND &amp; STYLE GUIDE REFERENCE
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-wide mt-1">
            Colour Palette, Typography &amp; UI Specimens
          </h1>
          <p className="text-steel-200 text-sm mt-2 max-w-2xl">
            Live browser specimen sheet for Stillage Storage Solutions (stillagestoragesolutions.co.uk). Every colour swatch and font role below is controlled centrally via CSS tokens.
          </p>
        </div>
        <Link
          href="/"
          className="bg-surface-sand text-brand-navy font-display font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-sm shrink-0 hover:bg-white transition-colors"
        >
          &larr; Back to Storefront
        </Link>
      </div>

      {/* Section 1: Live Colour Swatch Cards */}
      <section className="space-y-10">
        <div>
          <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
            SECTION 01 • COLOUR TOKENS
          </div>
          <h2 className="font-display font-extrabold text-3xl uppercase text-brand-navy mt-1">
            Live Colour Palette Swatches
          </h2>
        </div>

        {COLOUR_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <div className="border-b border-steel-200 pb-2">
              <h3 className="font-display font-bold text-xl uppercase text-brand-navy">
                {group.title}
              </h3>
              <p className="text-xs text-steel-600">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.swatches.map((swatch) => (
                <div
                  key={swatch.name}
                  className="border border-steel-200 bg-surface-white rounded-sm overflow-hidden shadow-sm"
                >
                  <div
                    className="h-28 p-4 flex flex-col justify-between border-b border-steel-200"
                    style={{ backgroundColor: swatch.hex, color: swatch.textSample }}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold">{swatch.hex}</span>
                      <span className="opacity-80">{swatch.twClass}</span>
                    </div>
                    <div className="font-display font-bold uppercase tracking-wider text-lg">
                      Sample Contrast Text — Aa 123
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-steel-900">{swatch.name}</span>
                      <code className="font-mono text-xs text-stillage-blue font-bold">
                        {swatch.hex}
                      </code>
                    </div>
                    <div className="font-mono text-[11px] text-steel-600">
                      CSS Token: {swatch.cssVar}
                    </div>
                    <p className="text-xs text-steel-600 pt-1">{swatch.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Section 2: Live Typography Specimens */}
      <section className="space-y-8">
        <div>
          <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
            SECTION 02 • GOOGLE FONTS SPECIMENS
          </div>
          <h2 className="font-display font-extrabold text-3xl uppercase text-brand-navy mt-1">
            Typography &amp; Font Pairings
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Font 1: Barlow Condensed */}
          <div className="border border-steel-200 bg-surface-sandLight p-6 border-l-4 border-l-stillage-blue space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-stillage-blue font-bold">
              <span>ROLE 1: DISPLAY &amp; SECTION HEADINGS — BARLOW CONDENSED</span>
              <span>CSS: var(--font-barlow) | Class: font-display</span>
            </div>
            <div className="font-display font-extrabold text-4xl sm:text-5xl uppercase text-brand-navy tracking-tight">
              HEAVY-DUTY STEEL STILLAGES, CANTILEVER RACKS &amp; POST PALLETS
            </div>
            <div className="font-display font-bold text-2xl uppercase text-steel-900 tracking-wide">
              3-Bay Double-Sided Heavy Duty Cantilever Bar &amp; Pipe Stillage Rack
            </div>
            <p className="text-xs text-steel-600">
              <strong>Where used:</strong> Hero headlines, page headers, product card titles, category banners, and uppercase CTA buttons.{' '}
              <strong>Alternative options if changing:</strong> Oswald, Chakra Petch, Space Grotesk, or Bebas Neue.
            </p>
          </div>

          {/* Font 2: Roboto Slab */}
          <div className="border border-steel-200 bg-brand-navy text-surface-white p-6 border-l-4 border-l-surface-sand space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-surface-sand font-bold">
              <span>ROLE 2: BRAND EMBLEM &amp; WORDMARK — ROBOTO SLAB</span>
              <span>CSS: var(--font-slab) | Class: font-slab</span>
            </div>
            <div className="font-slab font-bold text-3xl sm:text-4xl tracking-tight">
              STILLAGE STORAGE SOLUTIONS
            </div>
            <p className="text-xs text-steel-200">
              <strong>Where used:</strong> Standalone brand wordmark in the header and footer.{' '}
              <strong>Alternative options if changing:</strong> Zilla Slab, Bitter, Arvo, or unify with Barlow Condensed.
            </p>
          </div>

          {/* Font 3: Inter */}
          <div className="border border-steel-200 bg-surface-white p-6 border-l-4 border-l-steel-900 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-stillage-blue font-bold">
              <span>ROLE 3: UI CONTROLS &amp; BODY COPY — INTER</span>
              <span>CSS: var(--font-inter) | Class: font-sans</span>
            </div>
            <p className="font-sans text-base text-steel-900 font-medium max-w-3xl">
              Engineered in heavy-gauge British box section steel, our 3-Bay Double-Sided Cantilever Bar Stillage provides 24 individual load arms across four vertical tiers.
            </p>
            <p className="font-sans text-sm text-steel-600 max-w-3xl leading-relaxed">
              Each arm features welded upturned safety lugs to prevent round tube, scaffolding, or steel bar stock from rolling off during forklift transport. Finished in tough industrial RAL 5010 Gentian Blue.
            </p>
            <p className="text-xs text-steel-600">
              <strong>Where used:</strong> Product descriptions, engineering highlights, delivery notices, and form inputs.{' '}
              <strong>Alternative options if changing:</strong> Plus Jakarta Sans, IBM Plex Sans, or DM Sans.
            </p>
          </div>

          {/* Font 4: JetBrains Mono */}
          <div className="border border-steel-200 bg-surface-sandLight p-6 border-l-4 border-l-accent-teal space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-accent-teal font-bold">
              <span>ROLE 4: TECHNICAL SPECS, SKUS, DIMENSIONS &amp; PRICING — JETBRAINS MONO</span>
              <span>CSS: var(--font-mono) | Class: font-mono</span>
            </div>
            <div className="font-mono font-bold text-2xl sm:text-3xl text-brand-navy">
              £385.00 Ex. VAT &nbsp;|&nbsp; £462.00 Inc. VAT &nbsp;|&nbsp; 10+ Rate: £346.50
            </div>
            <div className="font-mono text-sm font-bold text-stillage-blue">
              SKU: SSS-CANT-3B8A • SWL: 1,500kg UDL • Footprint: 2400(L) × 1100(W) × 1450(H) mm • 80×80×4mm RHS
            </div>
            <p className="text-xs text-steel-600">
              <strong>Where used:</strong> SKUs, millimetre dimensions, SWL capacity pills, specification tables, and live Ex./Inc. VAT pricing.{' '}
              <strong>Alternative options if changing:</strong> IBM Plex Mono, Space Mono, or Roboto Mono.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Configurator Steel Finish Swatches */}
      <section className="space-y-6">
        <div>
          <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
            SECTION 03 • PRODUCT CONFIGURATOR SWATCHES
          </div>
          <h2 className="font-display font-extrabold text-3xl uppercase text-brand-navy mt-1">
            Steel Coating &amp; Finish Swatches
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FINISH_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className="border border-steel-200 bg-surface-white p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full border-2 border-black/15 shrink-0 shadow-inner"
                  style={{ backgroundColor: opt.swatchHex }}
                />
                <div>
                  <div className="font-mono font-bold text-sm text-brand-navy">{opt.code}</div>
                  <div className="font-mono text-xs text-stillage-blue">{opt.swatchHex}</div>
                </div>
              </div>
              <div className="font-bold text-xs text-steel-900">{opt.name}</div>
              <div className="text-xs text-steel-600">{opt.leadTimeNote}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
