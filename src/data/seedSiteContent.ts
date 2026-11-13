import {
  HomePageContent,
  NavigationMenuMap,
  SiteMicrotexts,
} from '@/types/content';

export const SEED_HOME_PAGE: HomePageContent = {
  heroHeadlineLine1: 'Heavy-Duty Steel Stillages.',
  heroHeadlineLine2: 'Built in the UK. Delivered Fast.',
  heroSubtitleTemplate:
    '{count} precision-engineered standard models in stock for rapid dispatch.',
  heroCtaLabel: 'Explore All {count} Models',
  heroCtaHref: '#catalog',
  heroImage: '/images/products/base-render-sss-cant-3b8a.jpg',
  heroImageAlt: 'Heavy-Duty Cantilever Bar Rack',
  filterAllLabel: 'All',
  filterCantileverLabel: 'Cantilever Racks',
  filterHopperLabel: 'Hopper Stillages',
  filterSheetMeshLabel: 'Solid & Mesh Cages',
  filterPostPalletsLabel: 'Post Pallets',
  guidesTitle: 'Technical Guides & Safety Standards',
  guidesSubtitle:
    'UK engineering guides covering SWL ratings, PUWER compliance, and finish selection.',
  guidesViewAllLabel: 'View All Guides',
  seoTitle:
    'Stillage Storage Solutions | Heavy-Duty UK Steel Stillages, Racks & Post Pallets',
  seoDescription:
    'UK manufacturer and online supplier of heavy-duty steel stillages, double-sided cantilever bar racks, modular stackable hopper bins, mesh cages, and post pallets. Buy online at stillagestoragesolutions.co.uk.',
};

export const SEED_NAVIGATION_MENUS: NavigationMenuMap = {
  'header-main': {
    menuKey: 'header-main',
    title: 'Header Main Navigation',
    items: [
      {
        label: 'Products',
        href: '/products',
        order: 1,
        children: [
          { label: 'All 12 Models', href: '/products', order: 1 },
          {
            label: 'Cantilever Racks (3)',
            href: '/products?category=cantilever-bar-racks',
            order: 2,
          },
          {
            label: 'Hopper Stillages (3)',
            href: '/products?category=hopper-bin-stillages',
            order: 3,
          },
          {
            label: 'Solid & Mesh Cages (4)',
            href: '/products?category=sheet-stillages',
            order: 4,
          },
          {
            label: 'Post Pallets (2)',
            href: '/products?category=post-pallets',
            order: 5,
          },
        ],
      },
      {
        label: 'Custom Fab',
        href: '/workshop',
        order: 2,
      },
      {
        label: 'About & Guides',
        href: '/blog',
        order: 3,
        requiresBlogFeature: true,
      },
      {
        label: 'Contact',
        href: 'mailto:sales@stillagestoragesolutions.co.uk',
        order: 4,
        isExternal: true,
      },
    ],
  },
  'footer-products': {
    menuKey: 'footer-products',
    title: 'Footer Products Column',
    items: [
      { label: 'All 12 Standard Models', href: '/products', order: 1 },
      {
        label: 'Cantilever Racks (3)',
        href: '/products?category=cantilever-bar-racks',
        order: 2,
      },
      {
        label: 'Hopper Stillages (3)',
        href: '/products?category=hopper-bin-stillages',
        order: 3,
      },
      {
        label: 'Solid & Mesh Cages (4)',
        href: '/products?category=sheet-stillages',
        order: 4,
      },
      {
        label: 'Post Pallets (2)',
        href: '/products?category=post-pallets',
        order: 5,
      },
    ],
  },
  'footer-engineering': {
    menuKey: 'footer-engineering',
    title: 'Footer Engineering Column',
    items: [
      { label: 'Custom Fab & Stack Builder', href: '/workshop', order: 1 },
      {
        label: 'Quote Basket & Proforma Checkout',
        href: '/checkout',
        order: 2,
      },
      {
        label: 'Technical Guides & Safety Standards',
        href: '/blog',
        order: 3,
        requiresBlogFeature: true,
      },
      {
        label: 'SWL, PUWER & Stacking Guide',
        href: '/blog/swl-puwer-ukca-stillage-stacking-safety-guide',
        order: 4,
        requiresBlogFeature: true,
      },
      {
        label: 'Galvanised vs RAL 5010 Finishes',
        href: '/blog/hot-dip-galvanised-vs-ral-5010-painted-steel-stillages',
        order: 5,
        requiresBlogFeature: true,
      },
    ],
  },
};

export const SEED_SITE_MICROTEXTS: SiteMicrotexts = {
  header: {
    brandWordmarkPrimary: 'STILLAGE',
    brandWordmarkSecondary: 'STORAGE SOLUTIONS',
    searchPlaceholder: 'Search SKU, SWL or size...',
    searchAriaLabel: 'Search stillages, storage racks, and compliance guides',
    noSearchMatchesPrefix: 'No direct SKU matches for',
    viewAllResultsPrefix: 'View All Results for',
    phoneDisplay: '+44 (0) 1978 800 500',
    phoneHref: 'tel:01978800500',
    vatToggleExLabel: 'EX. VAT',
    vatToggleIncLabel: 'INC. VAT',
    vatToggleTitle: 'Toggle Ex. VAT / Inc. VAT pricing',
    basketLabel: 'Quote Basket',
  },
  footer: {
    brandWordmarkPrimary: 'STILLAGE',
    brandWordmarkSecondary: 'STORAGE SOLUTIONS',
    brandTagline:
      'Direct UK manufacturer of heavy-duty steel stillages, cantilever bar racks, hopper bins, and stackable post pallets.',
    productsHeading: 'Products',
    engineeringHeadingDefault: 'Custom Engineering',
    engineeringHeadingWithBlog: 'Engineering & Guides',
    contactHeading: 'Contact Trade Desk',
    phoneDisplay: '+44 (0) 1978 800 500',
    emailDisplay: 'sales@stillagestoragesolutions.co.uk',
    openingHours: 'Mon–Fri: 07:30 – 17:00 GMT',
    copyrightSuffix: 'Stillage Storage Solutions. All prices subject to UK VAT at 20%.',
  },
  productCard: {
    cadBadgeLabel: 'CAD Drawing',
    swlSuffix: 'SWL',
    configureButtonLabel: 'Configure & Buy',
  },
  blogCard: {
    featuredBadgeLabel: 'Featured Guide',
    minReadSuffix: 'min read',
    readGuideLabel: 'Read Engineering Guide',
  },
  configurator: {
    addToBasketLabel: 'Add Specification to Order Basket & Keep Browsing',
    proformaButtonLabel: 'Generate Official B2B VAT Proforma Invoice',
    bulkTier5Badge: 'Save 5% (5+)',
    bulkTier10Badge: 'Save 10% (10+)',
    leadTimePrefix: 'Dispatch:',
    ukcaBadgeLabel: 'UKCA / PUWER Certified',
  },
  checkout: {
    pageTitle: 'Quote Basket & Trade Checkout',
    emptyBasketTitle: 'Your Quote Basket is Empty',
    emptyBasketCta: 'Browse 12 Standard Models',
    proformaButtonLabel: 'Request B2B Proforma Invoice',
    stripeButtonLabel: 'Pay Online Now (Card / BACS)',
  },
};
