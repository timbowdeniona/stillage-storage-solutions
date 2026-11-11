import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Wrench, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-navy text-surface-white border-t-4 border-stillage-blue mt-20">
      {/* Engineering Trust Strip */}
      <div className="bg-brand-navyDark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-7 h-7 text-accent-teal shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider text-surface-sand text-sm">
                Certified Safe Working Loads
              </h3>
              <p className="text-xs text-steel-200 mt-1">
                Every stillage and post pallet is welded in heavy-gauge British box section steel and rated for full stackability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Wrench className="w-7 h-7 text-stillage-blueLight shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider text-surface-sand text-sm">
                Custom RAL &amp; Bespoke Builds
              </h3>
              <p className="text-xs text-steel-200 mt-1">
                Supplied in standard RAL 5010 Stillage Blue, Raw Mill Steel, Hot-Dip Galvanised, or custom corporate RAL colours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Truck className="w-7 h-7 text-accent-amber shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider text-surface-sand text-sm">
                UK HGV Pallet Network
              </h3>
              <p className="text-xs text-steel-200 mt-1">
                Nationwide tracked delivery with optional Lorry Tail-Lift offload for sites without forklift facilities.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Layers className="w-7 h-7 text-surface-sand shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold uppercase tracking-wider text-surface-sand text-sm">
                Trade &amp; Proforma Accounts
              </h3>
              <p className="text-xs text-steel-200 mt-1">
                Instant online card checkout or 1-click official UK VAT Proforma Invoices for construction and warehouse buyers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <div className="font-slab font-bold text-lg text-white">
            STILLAGE STORAGE SOLUTIONS
          </div>
          <p className="text-xs text-steel-200 leading-relaxed">
            Direct UK manufacturer and supplier of heavy-duty steel stillages, cantilever bar storage racks, modular hopper towers, and stackable post pallets.
          </p>
          <div className="font-mono text-xs text-surface-sand pt-1">
            stillagestoragesolutions.co.uk
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-sand mb-3">
            Product Range
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            <li>
              <Link href="/products?category=cantilever-bar-racks" className="hover:text-white">
                Cantilever &amp; Bar Storage Racks
              </Link>
            </li>
            <li>
              <Link href="/products?category=hopper-bin-stillages" className="hover:text-white">
                Stackable Hopper &amp; Bin Stillages
              </Link>
            </li>
            <li>
              <Link href="/products?category=sheet-stillages" className="hover:text-white">
                Solid Sheet Steel Stillages
              </Link>
            </li>
            <li>
              <Link href="/products?category=mesh-stillages" className="hover:text-white">
                Mesh Sided Stillages &amp; Cages
              </Link>
            </li>
            <li>
              <Link href="/products?category=post-pallets" className="hover:text-white">
                Demountable Post Pallets
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-sand mb-3">
            Technical Guides &amp; Tools
          </h4>
          <ul className="space-y-2 text-xs text-steel-200">
            <li>
              <Link href="/workshop" className="text-accent-teal font-bold hover:underline">
                Workshop: Modular Stack Configurator &rarr;
              </Link>
            </li>
            <li>
              <Link href="/blueprint-studio" className="text-surface-sand font-bold hover:underline">
                CAD Blueprint Vector Studio &rarr;
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-surface-sand font-bold hover:underline">
                Technical Blog &amp; Engineering Guides &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="/blog/swl-puwer-ukca-stillage-stacking-safety-guide"
                className="hover:text-white"
              >
                SWL, PUWER &amp; 4-High Stacking Guide
              </Link>
            </li>
            <li>
              <Link
                href="/blog/hot-dip-galvanised-vs-ral-5010-painted-steel-stillages"
                className="hover:text-white"
              >
                Hot-Dip Galvanised vs RAL 5010 Finishes
              </Link>
            </li>
            <li>
              <Link
                href="/blog/hgv-pallet-delivery-tail-lift-offloading-guide"
                className="hover:text-white"
              >
                HGV Pallet Delivery &amp; Tail-Lift Guide
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold uppercase tracking-wider text-surface-sand mb-3">
            Trade Sales &amp; Enquiries
          </h4>
          <p className="text-xs text-steel-200 mb-3">
            Need custom dimensions, stencil ID numbering, or a bulk fabrication tender?
          </p>
          <div className="bg-brand-navyDark p-3.5 rounded border border-white/10 font-mono text-xs space-y-1">
            <div className="text-surface-sand font-bold">Tel: 01978 800 500</div>
            <div className="text-steel-200">sales@stillagestoragesolutions.co.uk</div>
            <div className="text-[11px] text-accent-teal pt-1">Mon–Fri: 07:30 – 17:00 GMT</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 px-4 text-center text-xs text-steel-400 font-mono flex flex-wrap items-center justify-center gap-4">
        <span>
          &copy; {new Date().getFullYear()} Stillage Storage Solutions (stillagestoragesolutions.co.uk). All prices subject to UK VAT at 20%.
        </span>
        <Link href="/analytics-report" className="text-accent-teal hover:underline font-bold">
          Client SEO, GEO &amp; Monthly Analytics Dashboard &rarr;
        </Link>
        <Link href="/design-system" className="text-surface-sand hover:underline">
          View Design System &amp; Colour/Font Swatches &rarr;
        </Link>
      </div>
    </footer>
  );
}
