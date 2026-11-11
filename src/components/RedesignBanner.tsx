import React from 'react';
import Link from 'next/link';
import { Eye, GitBranch, Sparkles } from 'lucide-react';

interface RedesignBannerProps {
  currentApproach: 1 | 2 | 3;
  title: string;
  tagline: string;
}

export function RedesignBanner({ currentApproach, title, tagline }: RedesignBannerProps) {
  const branches = [
    { num: 1, name: '1. Clean Catalog', branch: 'design/approach-1-clean-catalog' },
    { num: 2, name: '2. Spec Finder', branch: 'design/approach-2-spec-finder' },
    { num: 3, name: '3. Editorial Showcase', branch: 'design/approach-3-editorial-showcase' },
  ];

  return (
    <div className="bg-brand-navyDark text-surface-white border-b-2 border-stillage-blue py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="bg-accent-teal text-brand-navy font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px]">
            UX Redesign Option {currentApproach} of 3
          </span>
          <span className="font-display font-bold uppercase tracking-wider text-surface-sand text-sm">
            {title}
          </span>
          <span className="hidden lg:inline text-steel-400 font-sans">• {tagline}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <GitBranch className="w-3.5 h-3.5 text-steel-400" />
            <span className="text-steel-400">Branches:</span>
            {branches.map((b) => (
              <span
                key={b.num}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  b.num === currentApproach
                    ? 'bg-stillage-blue text-white ring-1 ring-white/30'
                    : 'bg-white/10 text-steel-300'
                }`}
                title={`git checkout ${b.branch}`}
              >
                {b.name}
              </span>
            ))}
          </div>

          <Link
            href="/redesign-preview"
            className="inline-flex items-center gap-1.5 bg-surface-sand text-brand-navy hover:bg-white font-mono font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors"
          >
            <Eye className="w-3 h-3 text-stillage-blue" />
            <span>Side-by-Side Images</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
