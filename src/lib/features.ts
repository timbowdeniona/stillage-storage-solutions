/**
 * Central Feature Flags for Stillage Storage Solutions.
 *
 * Launch configuration hides Blog Posts & Technical Guides and Product Filters
 * (while the catalog only has ~10 products).
 *
 * To re-enable Blog Posts & Technical Guides across navigation, homepage, search, sitemap, and `/blog` routes:
 *   1) Set `NEXT_PUBLIC_ENABLE_BLOG_GUIDES=true` in `.env.local` or deployment environment variables, OR
 *   2) Change the `enableBlogGuides` fallback below to `true`.
 *
 * To re-enable Product Filters on the homepage and `/products` listing page:
 *   1) Set `NEXT_PUBLIC_ENABLE_PRODUCT_FILTERS=true` in `.env.local` or deployment environment variables, OR
 *   2) Change the `enableProductFilters` fallback below to `true`.
 */
export const FEATURES = {
  enableBlogGuides: process.env.NEXT_PUBLIC_ENABLE_BLOG_GUIDES === 'true',
  enableProductFilters: process.env.NEXT_PUBLIC_ENABLE_PRODUCT_FILTERS === 'true',
} as const;
