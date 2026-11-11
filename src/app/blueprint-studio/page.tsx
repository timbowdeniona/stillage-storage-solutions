import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Download, FileCode2, Layers, Sliders, Wrench } from 'lucide-react';
import { getProducts } from '@/lib/contentful';
import { EditableBlueprintStudio } from '@/components/EditableBlueprintStudio';

export const metadata: Metadata = {
  title: 'Interactive CAD Blueprint Studio | Stillage Storage Solutions',
  description:
    'Manually edit technical stillage blueprints in the browser or download multi-layer editable .SVG drawings for Figma, Inkscape, and Adobe Illustrator.',
};

interface BlueprintStudioPageProps {
  searchParams: Promise<{ sku?: string }>;
}

export default async function BlueprintStudioPage({ searchParams }: BlueprintStudioPageProps) {
  const { sku } = await searchParams;
  const products = await getProducts();

  const standaloneFiles = [
    {
      sku: 'BBFH2-1',
      title: 'Free Standing Bulk Bag Filling Hopper with Stand',
      svgHref: '/images/blueprints/bbfh2-1-editable.svg',
      jpgHref: '/images/products/bbfh2-1-blueprint.jpg',
      dims: '1120 × 1120 × 1850 mm (1080 mm Foot Centres)',
    },
    {
      sku: 'SSS-CANT-3B8A',
      title: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
      svgHref: '/images/blueprints/sss-cant-3b8a-editable.svg',
      jpgHref: '/images/products/sss-cant-3b8a-blueprint.jpg',
      dims: '2400 × 1100 × 1450 mm (1,500 kg SWL)',
    },
    {
      sku: 'SSS-MSH-1210HD',
      title: 'Mesh Sided Half-Drop Gate Stillage Cage',
      svgHref: '/images/blueprints/sss-msh-1210hd-editable.svg',
      jpgHref: '/images/products/sss-msh-1210hd-blueprint.jpg',
      dims: '1200 × 1000 × 900 mm (1,000 kg SWL)',
    },
  ];

  return (
    <div className="bg-surface-sandLight min-h-screen pb-16">
      {/* Hero Header */}
      <div className="bg-brand-navy text-surface-white border-b border-white/15 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent-teal font-bold">
            <Compass className="w-4 h-4" />
            <span>Multi-Layer Vector CAD Workflow • BS 8888 Compliant</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide">
            Interactive CAD Blueprint &amp; Vector Annotation Studio
          </h1>
          <p className="text-sm sm:text-base text-surface-sand max-w-3xl leading-relaxed">
            Every blueprint combines a clean 3D isometric steel render on{' '}
            <code className="font-mono text-white">#layer-3d-cad-subject</code> with live editable
            vector dimension leaders and callouts. Edit measurements and drag arrows directly below,
            or download the standalone <code className="font-mono text-white">.svg</code> files to
            edit in <strong>Figma</strong>, <strong>Inkscape</strong>, or{' '}
            <strong>Adobe Illustrator</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/workshop"
              className="inline-flex items-center gap-2 bg-accent-teal hover:bg-teal-600 text-brand-navy font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs"
            >
              <Wrench className="w-4 h-4" />
              <span>Launch Interactive Workshop (Stack Modules &amp; Test Clearance) &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Direct Standalone Layered SVG Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {standaloneFiles.map((item) => (
            <div
              key={item.sku}
              className="bg-surface-white border border-steel-200 p-5 rounded-sm shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="bg-brand-navy text-surface-sand px-2.5 py-0.5 font-bold rounded-sm">
                    {item.sku}
                  </span>
                  <span className="text-accent-teal font-bold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />5 Vector Layers
                  </span>
                </div>
                <h2 className="font-display font-bold text-lg uppercase text-brand-navy mt-2">
                  {item.title}
                </h2>
                <p className="font-mono text-xs text-steel-600 mt-1">{item.dims}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-steel-200 font-mono text-xs">
                <a
                  href={item.svgHref}
                  download
                  className="flex-1 bg-stillage-blue hover:bg-brand-navy text-white font-bold px-3 py-2 rounded-sm inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Download .SVG</span>
                </a>
                <a
                  href={item.jpgHref}
                  download
                  className="px-3 py-2 border border-steel-200 hover:border-brand-navy text-brand-navy font-bold rounded-sm inline-flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.JPG</span>
                </a>
                <Link
                  href={`/blueprint-studio?sku=${item.sku}`}
                  className="px-3 py-2 bg-surface-sand hover:bg-surface-sandDark text-brand-navy font-bold rounded-sm inline-flex items-center justify-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Load</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Browser Blueprint Editor */}
        <EditableBlueprintStudio products={products} initialSku={sku} />
      </div>
    </div>
  );
}
