import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BLOG_POST_CONTENT_TYPE,
  PRODUCT_CONTENT_TYPE,
  PRODUCT_MEDIA_ASSETS,
  SEED_BLOG_ENTRIES,
  SEED_PRODUCT_ENTRIES,
  toContentfulFields,
} from '../scripts/contentful-sync.mjs';

test('Stillage Product Contentful model defines primaryImage and secondaryImage as Media Asset Links', () => {
  assert.equal(PRODUCT_CONTENT_TYPE.id, 'product');
  const primaryImageField = PRODUCT_CONTENT_TYPE.fields.find((f) => f.id === 'primaryImage');
  const secondaryImageField = PRODUCT_CONTENT_TYPE.fields.find((f) => f.id === 'secondaryImage');

  assert.ok(primaryImageField, 'Missing primaryImage field on product Contentful model');
  assert.equal(primaryImageField.type, 'Link');
  assert.equal(primaryImageField.linkType, 'Asset');
  assert.equal(primaryImageField.required, true);

  assert.ok(secondaryImageField, 'Missing secondaryImage field on product Contentful model');
  assert.equal(secondaryImageField.type, 'Link');
  assert.equal(secondaryImageField.linkType, 'Asset');
  assert.equal(secondaryImageField.required, false);

  for (const asset of PRODUCT_MEDIA_ASSETS) {
    const absPath = path.resolve(process.cwd(), 'public', asset.localPath.replace(/^\//, ''));
    assert.ok(fs.existsSync(absPath), `Expected media asset file to exist at ${absPath}`);
  }

  for (const prod of SEED_PRODUCT_ENTRIES) {
    assert.equal(prod.primaryImage.sys.type, 'Link');
    assert.equal(prod.primaryImage.sys.linkType, 'Asset');
    assert.ok(prod.primaryImage.sys.id.startsWith('asset-'));
    assert.equal(prod.secondaryImage.sys.type, 'Link');
    assert.equal(prod.secondaryImage.sys.linkType, 'Asset');
  }
});

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

  const heroField = BLOG_POST_CONTENT_TYPE.fields.find((f) => f.id === 'heroImage');
  assert.equal(heroField.type, 'Link');
  assert.equal(heroField.linkType, 'Asset');
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
    assert.equal(post.heroImage.sys.type, 'Link');
    assert.equal(post.heroImage.sys.linkType, 'Asset');

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
