import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: ['/api/checkout', '/api/webhooks', '/checkout/return'],
      },
      {
        // Explicitly allow AI Search / Answer Engine crawlers for Generative Engine Optimisation (GEO)
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Googlebot',
          'Bingbot',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/products', '/blog'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
