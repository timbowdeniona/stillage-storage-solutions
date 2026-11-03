import type { Metadata } from 'next';
import './globals.css';
import { VatProvider } from '@/context/VatContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Stillage Storage Solutions | Heavy-Duty UK Steel Stillages, Racks & Post Pallets',
    template: '%s | Stillage Storage Solutions (stillagestoragesolutions.co.uk)',
  },
  description:
    'UK manufacturer and online supplier of heavy-duty steel stillages, double-sided cantilever bar racks, modular stackable hopper bins, mesh cages, and post pallets. Buy online at stillagestoragesolutions.co.uk.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Roboto+Slab:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-surface-white text-steel-900">
        <VatProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </VatProvider>
      </body>
    </html>
  );
}
