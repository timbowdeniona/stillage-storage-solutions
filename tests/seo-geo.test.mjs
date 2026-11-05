import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BLOG_POST_CONTENT_TYPE,
  PRODUCT_CONTENT_TYPE,
  SEED_PRODUCT_ENTRIES,
} from '../scripts/contentful-sync.mjs';

test('Contentful product and blogPost models define optional SEO & FAQ fields with character limit validations', () => {
  for (const model of [PRODUCT_CONTENT_TYPE, BLOG_POST_CONTENT_TYPE]) {
    const seoTitle = model.fields.find((f) => f.id === 'seoTitle');
    const seoDesc = model.fields.find((f) => f.id === 'seoDescription');
    const faqItems = model.fields.find((f) => f.id === 'faqItems');

    assert.ok(seoTitle, `Missing seoTitle field on ${model.id}`);
    assert.equal(seoTitle.required, false, 'seoTitle must be optional for non-technical editors');
    assert.equal(seoTitle.validations?.[0]?.size?.max, 65);

    assert.ok(seoDesc, `Missing seoDescription field on ${model.id}`);
    assert.equal(seoDesc.required, false, 'seoDescription must be optional for non-technical editors');
    assert.equal(seoDesc.validations?.[0]?.size?.max, 165);

    assert.ok(faqItems, `Missing faqItems field on ${model.id}`);
    assert.equal(faqItems.type, 'Array');
    assert.equal(faqItems.required, false);
  }
});

test('GEO public/llms.txt and public/llms-full.txt exist and cover all product SKUs and UK standards', () => {
  const llmsPath = path.resolve(process.cwd(), 'public/llms.txt');
  const llmsFullPath = path.resolve(process.cwd(), 'public/llms-full.txt');

  assert.ok(fs.existsSync(llmsPath), 'Expected public/llms.txt to exist');
  assert.ok(fs.existsSync(llmsFullPath), 'Expected public/llms-full.txt to exist');

  const llmsTxt = fs.readFileSync(llmsPath, 'utf8');
  const llmsFullTxt = fs.readFileSync(llmsFullPath, 'utf8');

  for (const prod of SEED_PRODUCT_ENTRIES) {
    assert.ok(llmsTxt.includes(prod.sku), `Expected llms.txt to include SKU ${prod.sku}`);
    assert.ok(llmsFullTxt.includes(prod.sku), `Expected llms-full.txt to include SKU ${prod.sku}`);
  }

  assert.ok(llmsFullTxt.includes('PUWER 1998'));
  assert.ok(llmsFullTxt.includes('LOLER 1998'));
  assert.ok(llmsFullTxt.includes('BS EN ISO 1461'));
  assert.ok(llmsFullTxt.includes('RAL 5010'));
});

test('Next.js dynamic sitemap.ts, robots.ts, and /api/og route are wired with GEO & SEO rules', () => {
  const sitemapSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/sitemap.ts'),
    'utf8'
  );
  const robotsSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/robots.ts'),
    'utf8'
  );
  const ogSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/og/route.tsx'),
    'utf8'
  );

  assert.ok(sitemapSource.includes('getProducts()'));
  assert.ok(sitemapSource.includes('getCategories()'));
  assert.ok(sitemapSource.includes('getBlogPosts()'));

  assert.ok(robotsSource.includes('GPTBot'));
  assert.ok(robotsSource.includes('PerplexityBot'));
  assert.ok(robotsSource.includes('ClaudeBot'));
  assert.ok(robotsSource.includes('/llms.txt'));
  assert.ok(robotsSource.includes('/sitemap.xml'));

  assert.ok(ogSource.includes('ImageResponse'));
  assert.ok(ogSource.includes('STILLAGE STORAGE SOLUTIONS'));
});

test('SEO & Schema.org module implements JSON-LD builders and Zero-Config Contentful fallbacks', () => {
  const seoSource = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/seo.ts'), 'utf8');
  const productPageSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/products/[slug]/page.tsx'),
    'utf8'
  );
  const blogPageSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/blog/[slug]/page.tsx'),
    'utf8'
  );

  for (const fnName of [
    'buildOrganizationSchema',
    'buildProductSchema',
    'buildBreadcrumbSchema',
    'buildBlogPostSchema',
    'buildFaqSchema',
    'resolveProductSeo',
    'resolveBlogPostSeo',
    'parseFaqItems',
    'getProductFaqs',
  ]) {
    assert.ok(seoSource.includes(`export function ${fnName}`), `Missing ${fnName} in src/lib/seo.ts`);
  }

  assert.ok(productPageSource.includes('application/ld+json'));
  assert.ok(productPageSource.includes('ProductGeoSection'));
  assert.ok(blogPageSource.includes('application/ld+json'));
  assert.ok(blogPageSource.includes('buildBlogPostMetadata'));
});

test('Client-friendly analytics module and /analytics-report executive dashboard are wired', () => {
  const analyticsSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/lib/analytics.ts'),
    'utf8'
  );
  const reportPageSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/analytics-report/page.tsx'),
    'utf8'
  );

  assert.ok(analyticsSource.includes('trackB2BEvent'));
  assert.ok(analyticsSource.includes('EXECUTIVE_MONTHLY_REPORT_SAMPLE'));
  assert.ok(reportPageSource.includes('Plain-English Performance, SEO &amp; AI Search Report'));
  assert.ok(reportPageSource.includes('Smart Auto-Fallback'));
});
