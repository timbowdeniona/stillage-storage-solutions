import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Stillage',
    description:
      'Direct UK manufacturer of heavy-duty steel stillages, cantilever bar racks, hopper bins, and post pallets.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F2342',
    theme_color: '#0F2342',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
