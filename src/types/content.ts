export interface NavigationItem {
  label: string;
  href: string;
  order: number;
  isExternal?: boolean;
  requiresBlogFeature?: boolean;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  menuKey: string;
  title: string;
  items: NavigationItem[];
}

export type NavigationMenuMap = Record<string, NavigationMenu>;

export interface HomePageContent {
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroSubtitleTemplate: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroImage: string;
  heroImageAlt: string;
  filterAllLabel: string;
  filterCantileverLabel: string;
  filterHopperLabel: string;
  filterSheetMeshLabel: string;
  filterPostPalletsLabel: string;
  guidesTitle: string;
  guidesSubtitle: string;
  guidesViewAllLabel: string;
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
}

export interface HeaderMicrotexts {
  brandWordmarkPrimary: string;
  brandWordmarkSecondary: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  noSearchMatchesPrefix: string;
  viewAllResultsPrefix: string;
  phoneDisplay: string;
  phoneHref: string;
  vatToggleExLabel: string;
  vatToggleIncLabel: string;
  vatToggleTitle: string;
  basketLabel: string;
}

export interface FooterMicrotexts {
  brandWordmarkPrimary: string;
  brandWordmarkSecondary: string;
  brandTagline: string;
  productsHeading: string;
  engineeringHeadingDefault: string;
  engineeringHeadingWithBlog: string;
  contactHeading: string;
  phoneDisplay: string;
  emailDisplay: string;
  openingHours: string;
  copyrightSuffix: string;
}

export interface ProductCardMicrotexts {
  cadBadgeLabel: string;
  swlSuffix: string;
  configureButtonLabel: string;
}

export interface BlogCardMicrotexts {
  featuredBadgeLabel: string;
  minReadSuffix: string;
  readGuideLabel: string;
}

export interface ConfiguratorMicrotexts {
  addToBasketLabel: string;
  proformaButtonLabel: string;
  bulkTier5Badge: string;
  bulkTier10Badge: string;
  leadTimePrefix: string;
  ukcaBadgeLabel: string;
}

export interface CheckoutMicrotexts {
  pageTitle: string;
  emptyBasketTitle: string;
  emptyBasketCta: string;
  proformaButtonLabel: string;
  stripeButtonLabel: string;
}

export interface SiteMicrotexts {
  header: HeaderMicrotexts;
  footer: FooterMicrotexts;
  productCard: ProductCardMicrotexts;
  blogCard: BlogCardMicrotexts;
  configurator: ConfiguratorMicrotexts;
  checkout: CheckoutMicrotexts;
}

export interface SiteContentBundle {
  homePage: HomePageContent;
  navigation: NavigationMenuMap;
  microtexts: SiteMicrotexts;
}
