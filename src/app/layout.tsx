import type { Metadata } from 'next';
import './globals.css';
import { VatProvider } from '@/context/VatContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import {
  buildOgImageUrl,
  buildOrganizationSchema,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo';

const DEFAULT_OG_IMAGE = buildOgImageUrl({
  title: 'Heavy-Duty UK Steel Stillages, Cantilever Racks & Post Pallets',
  subtitle:
    'Engineered in British Box-Section Steel • Certified 1,000kg–1,500kg SWL • Fast UK HGV Delivery',
  badge: 'DIRECT UK FACTORY STEEL FABRICATION',
  sku: 'UKCA / PUWER 1998',
  swl: 'Up to 1,500kg SWL',
  price: '5%–10% Bulk Trade Tiers',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stillage Storage Solutions | Heavy-Duty UK Steel Stillages, Racks & Post Pallets',
    template: '%s | Stillage Storage Solutions (stillagestoragesolutions.co.uk)',
  },
  description:
    'UK manufacturer and online supplier of heavy-duty steel stillages, double-sided cantilever bar racks, modular stackable hopper bins, mesh cages, and post pallets. Buy online at stillagestoragesolutions.co.uk.',
  keywords: [
    'steel stillages UK',
    'heavy duty stillage manufacturer',
    'double sided cantilever bar rack',
    'demountable post pallets',
    'mesh sided stillage cage',
    'stackable hopper bin stillage',
    'RAL 5010 stillage blue',
    'BS EN ISO 1461 galvanised stillages',
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-GB': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Stillage Storage Solutions | Heavy-Duty UK Steel Stillages, Racks & Post Pallets',
    description:
      'Direct UK factory steel fabrication of certified heavy-duty bin stillages, cantilever bar racks, mesh cages, and post pallets with online trade configurator.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Stillage Storage Solutions — UK Steel Stillages, Cantilever Racks & Post Pallets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stillage Storage Solutions | Heavy-Duty UK Steel Stillages & Racks',
    description:
      'Engineered in British box-section steel. Configure finishes, castors, forklift pockets, and 5%–10% bulk trade tiers online.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = buildOrganizationSchema();

  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Roboto+Slab:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-surface-white text-steel-900">
        <AnalyticsTracker />
        <VatProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </VatProvider>
      </body>
    </html>
  );
}
