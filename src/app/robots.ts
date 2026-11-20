import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/seo';
import { FEATURES } from '@/lib/features';

export const dynamic = 'force-dynamic';

function isNetlifyOrStagingHost(rawHost: string): boolean {
  if (process.env.SITE_NOINDEX === 'true') {
    return true;
  }
  const hostname = rawHost.split(',')[0].trim().split(':')[0].toLowerCase();
  return hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.live');
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';

  // Shield staging / *.netlify.app preview domains from search engines & AI crawlers
  if (isNetlifyOrStagingHost(host)) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  const baseDisallow = [
    '/admin',
    '/account',
    '/analytics-report',
    '/login',
    '/api/checkout',
    '/api/webhooks',
    '/checkout/return',
  ];
  const disallowLaunch = FEATURES.enableBlogGuides
    ? baseDisallow
    : [...baseDisallow, '/blog'];

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
