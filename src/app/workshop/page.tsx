import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Layers, ShieldCheck, Sliders, Wrench } from 'lucide-react';
import { WorkshopConfigurator } from '@/components/WorkshopConfigurator';

export const metadata: Metadata = {
  title: 'Interactive Stillage Workshop & Modular Stack Configurator | Stillage Storage Solutions',
  description:
    'Build, stack, and validate modular stillage solutions in real time. Snap together hoppers, stands, and cages with live PUWER structural calculations and BS 8888 CAD blueprint export.',
};

interface WorkshopPageProps {
  searchParams: Promise<{
    preset?: string;
    sku?: string;
  }>;
}

export default async function WorkshopPage({ searchParams }: WorkshopPageProps) {
  const { preset, sku } = await searchParams;

  return (
    <div className="bg-surface-sandLight min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-brand-navy text-surface-white border-b border-white/15 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent-teal font-bold">
            <Wrench className="w-4 h-4" />
            <span>Interactive Workshop Configurator • Modular CAD Blueprint Assembly</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide">
            Workshop: Modular Stillage Stacking &amp; Solution Builder
          </h1>
          <p className="text-sm sm:text-base text-surface-sand max-w-3xl leading-relaxed">
            Manipulate technical vector blueprints online to see how stillage modules come together.
            Stack solid-sheet bins, half-drop mesh cages, conical hoppers, and support stands with live
            interlocking cup alignment, PUWER compliance checks, warehouse clearance limits, and 1-click
            quote generation.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-steel-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-teal" />
              PUWER 1998 Regulation 6 Verified
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-stillage-blueLight" />
              BS 8888 Technical CAD Drawings
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent-amber" />
              Real-Time Vector Stacking Engine
            </span>
          </div>
        </div>
      </div>

      {/* Workshop Configurator Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <WorkshopConfigurator initialPresetId={preset} initialSku={sku} />
      </div>
    </div>
  );
}
