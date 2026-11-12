import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-navy text-surface-white border-t border-steel-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-2xl tracking-tight text-surface-white leading-none uppercase">
              STILLAGE
            </span>
            <span className="font-display font-bold text-[11px] tracking-[0.08em] text-stillage-sky uppercase mt-0.5">
              STORAGE SOLUTIONS
            </span>
          </div>
          <p className="text-xs text-steel-200 leading-relaxed">
            Direct UK manufacturer of heavy-duty steel stillages, cantilever bar racks, hopper bins, and stackable post pallets.
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            Products
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            <li>
              <Link href="/products" className="hover:text-white">
                All 12 Standard Models
              </Link>
            </li>
            <li>
              <Link href="/products?category=cantilever-bar-racks" className="hover:text-white">
                Cantilever Racks (3)
              </Link>
            </li>
            <li>
              <Link href="/products?category=hopper-bin-stillages" className="hover:text-white">
                Hopper Stillages (3)
              </Link>
            </li>
            <li>
              <Link href="/products?category=sheet-stillages" className="hover:text-white">
                Solid &amp; Mesh Cages (4)
              </Link>
            </li>
            <li>
              <Link href="/products?category=post-pallets" className="hover:text-white">
                Post Pallets (2)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            Engineering &amp; Guides
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            <li>
              <Link href="/workshop" className="hover:text-white">
                Custom Fab &amp; Stack Builder
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Technical Guides &amp; Safety Standards
              </Link>
            </li>
            <li>
              <Link
                href="/blog/swl-puwer-ukca-stillage-stacking-safety-guide"
                className="hover:text-white"
              >
                SWL, PUWER &amp; Stacking Guide
              </Link>
            </li>
            <li>
              <Link
                href="/blog/hot-dip-galvanised-vs-ral-5010-painted-steel-stillages"
                className="hover:text-white"
              >
                Galvanised vs RAL 5010 Finishes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-white mb-3">
            Contact Trade Desk
          </h4>
          <div className="text-xs text-steel-200 space-y-1.5">
            <div className="font-display font-bold text-base text-surface-white">
              +44 (0) 1978 800 500
            </div>
            <div>sales@stillagestoragesolutions.co.uk</div>
            <div className="text-steel-400">Mon–Fri: 07:30 – 17:00 GMT</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-steel-400 flex flex-wrap items-center justify-center gap-4">
        <span>
          &copy; {new Date().getFullYear()} Stillage Storage Solutions. All prices subject to UK VAT at 20%.
        </span>
      </div>
    </footer>
  );
}
