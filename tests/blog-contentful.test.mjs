import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BLOG_POST_CONTENT_TYPE,
  SEED_BLOG_ENTRIES,
  toContentfulFields,
} from '../scripts/contentful-sync.mjs';

test('Contentful blogPost content type model defines all required and array fields', () => {
  assert.equal(BLOG_POST_CONTENT_TYPE.id, 'blogPost');
  assert.equal(BLOG_POST_CONTENT_TYPE.displayField, 'title');

  const fieldIds = BLOG_POST_CONTENT_TYPE.fields.map((f) => f.id);
  const expectedFields = [
    'title',
    'slug',
    'excerpt',
    'category',
    'author',
    'authorRole',
    'publishedAt',
    'readingTimeMinutes',
    'featured',
    'heroImage',
    'backdropStyle',
    'tags',
    'keyTakeaways',
    'body',
    'relatedProductSkus',
  ];

  for (const field of expectedFields) {
    assert.ok(fieldIds.includes(field), `Missing field "${field}" on blogPost Contentful model`);
  }
});

test('Test blog pages in SEED_BLOG_ENTRIES have valid slugs, takeaways, and CMA payload formatting', () => {
  assert.ok(SEED_BLOG_ENTRIES.length >= 5, 'Expected at least 5 test blog posts');

  const slugs = new Set();
  for (const post of SEED_BLOG_ENTRIES) {
    assert.ok(post.id.startsWith('blog-'), `Expected blog id prefix on ${post.id}`);
    assert.ok(post.slug.length > 5, `Expected valid slug on ${post.id}`);
    assert.ok(!slugs.has(post.slug), `Duplicate blog slug: ${post.slug}`);
    slugs.add(post.slug);

    assert.ok(post.title.length > 10);
    assert.ok(post.excerpt.length > 20);
    assert.ok(post.body.includes('## '), `Expected markdown headings in body of ${post.slug}`);
    assert.ok(Array.isArray(post.keyTakeaways) && post.keyTakeaways.length >= 3);
    assert.ok(Array.isArray(post.relatedProductSkus) && post.relatedProductSkus.length >= 1);

    const cmaPayload = toContentfulFields(post, 'en-US');
    assert.equal(cmaPayload.fields.id, undefined);
    assert.equal(cmaPayload.fields.title['en-US'], post.title);
    assert.equal(cmaPayload.fields.slug['en-US'], post.slug);
    assert.deepEqual(cmaPayload.fields.tags['en-US'], post.tags);
  }
});

test('Next.js seedCatalog.ts and blog routes include all seeded test blog posts', () => {
  const seedCatalogSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/data/seedCatalog.ts'),
    'utf8'
  );

  for (const post of SEED_BLOG_ENTRIES) {
    assert.ok(
      seedCatalogSource.includes(post.slug),
      `Expected seedCatalog.ts to contain test blog slug "${post.slug}"`
    );
  }

  assert.ok(fs.existsSync(path.resolve(process.cwd(), 'src/app/blog/page.tsx')));
  assert.ok(fs.existsSync(path.resolve(process.cwd(), 'src/app/blog/[slug]/page.tsx')));
});
