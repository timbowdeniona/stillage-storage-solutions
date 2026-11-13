/**
 * Central Feature Flags for Stillage Storage Solutions.
 *
 * Launch configuration hides Blog Posts & Technical Guides.
 * To re-enable them across navigation, homepage, search, sitemap, and `/blog` routes:
 *   1) Set `NEXT_PUBLIC_ENABLE_BLOG_GUIDES=true` in `.env.local` or deployment environment variables, OR
 *   2) Change the fallback below to `true`.
 */
export const FEATURES = {
  enableBlogGuides: process.env.NEXT_PUBLIC_ENABLE_BLOG_GUIDES === 'true',
} as const;
