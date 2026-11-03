import type { Metadata } from 'next';
import { Barlow_Condensed, Inter, JetBrains_Mono, Roboto_Slab } from 'next/font/google';
import './globals.css';
import { VatProvider } from '@/context/VatContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-slab',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
});

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
    <html
      lang="en-GB"
      className={`${barlow.variable} ${robotoSlab.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
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
