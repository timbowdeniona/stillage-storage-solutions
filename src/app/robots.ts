import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { FEATURES } from '@/lib/features';

export default function robots(): MetadataRoute.Robots {
  const disallowLaunch = FEATURES.enableBlogGuides
    ? ['/api/checkout', '/api/webhooks', '/checkout/return']
    : ['/api/checkout', '/api/webhooks', '/checkout/return', '/blog'];

  const aiAllow = FEATURES.enableBlogGuides
    ? ['/', '/llms.txt', '/llms-full.txt', '/products', '/blog']
    : ['/', '/llms.txt', '/llms-full.txt', '/products'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: disallowLaunch,
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
        allow: aiAllow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
