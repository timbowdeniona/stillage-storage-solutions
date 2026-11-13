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

test('Stillage Product Contentful model defines primaryImage, secondaryImage, and technicalDrawing as Media Asset Links', () => {
  assert.equal(PRODUCT_CONTENT_TYPE.id, 'product');
  const primaryImageField = PRODUCT_CONTENT_TYPE.fields.find((f) => f.id === 'primaryImage');
  const secondaryImageField = PRODUCT_CONTENT_TYPE.fields.find((f) => f.id === 'secondaryImage');
  const technicalDrawingField = PRODUCT_CONTENT_TYPE.fields.find((f) => f.id === 'technicalDrawing');

  assert.ok(primaryImageField, 'Missing primaryImage field on product Contentful model');
  assert.equal(primaryImageField.type, 'Link');
  assert.equal(primaryImageField.linkType, 'Asset');
  assert.equal(primaryImageField.required, true);

  assert.ok(secondaryImageField, 'Missing secondaryImage field on product Contentful model');
  assert.equal(secondaryImageField.type, 'Link');
  assert.equal(secondaryImageField.linkType, 'Asset');
  assert.equal(secondaryImageField.required, false);

  assert.ok(technicalDrawingField, 'Missing technicalDrawing field on product Contentful model');
  assert.equal(technicalDrawingField.type, 'Link');
  assert.equal(technicalDrawingField.linkType, 'Asset');
  assert.equal(technicalDrawingField.required, false);

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

  const cantRack = SEED_PRODUCT_ENTRIES.find((p) => p.sku === 'SSS-CANT-3B8A');
  const meshCage = SEED_PRODUCT_ENTRIES.find((p) => p.sku === 'SSS-MSH-1210HD');
  const bulkHopper = SEED_PRODUCT_ENTRIES.find((p) => p.sku === 'BBFH2-1');
  assert.equal(cantRack.technicalDrawing.sys.id, 'asset-sss-cant-3b8a-blueprint');
  assert.equal(meshCage.technicalDrawing.sys.id, 'asset-sss-msh-1210hd-blueprint');
  assert.equal(bulkHopper.technicalDrawing.sys.id, 'asset-bbfh2-1-blueprint');
});

test('Multi-layer editable SVG blueprints exist in public/images/blueprints with named CAD layers', () => {
  const expectedFiles = [
    'bbfh2-1-editable.svg',
    'sss-cant-3b8a-editable.svg',
    'sss-msh-1210hd-editable.svg',
  ];

  for (const fileName of expectedFiles) {
    const svgPath = path.resolve(process.cwd(), 'public/images/blueprints', fileName);
    assert.ok(fs.existsSync(svgPath), `Expected editable SVG blueprint at ${svgPath}`);
    const content = fs.readFileSync(svgPath, 'utf8');
    assert.ok(content.includes('id="layer-sheet-grid"'), `Missing layer-sheet-grid in ${fileName}`);
    assert.ok(content.includes('id="layer-3d-cad-subject"'), `Missing layer-3d-cad-subject in ${fileName}`);
    assert.ok(content.includes('id="layer-dimension-lines"'), `Missing layer-dimension-lines in ${fileName}`);
    assert.ok(content.includes('id="layer-callouts"'), `Missing layer-callouts in ${fileName}`);
    assert.ok(content.includes('id="layer-iso-title-block"'), `Missing layer-iso-title-block in ${fileName}`);
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

test('Interactive Workshop Configurator module defines stackable stillage families and PUWER calculations', () => {
  const workshopModulesPath = path.resolve(process.cwd(), 'src/data/workshopModules.ts');
  assert.ok(fs.existsSync(workshopModulesPath), 'workshopModules.ts must exist');
  const src = fs.readFileSync(workshopModulesPath, 'utf8');

  // Verify core modular stillages are cataloged
  assert.ok(src.includes('mod-msh-1210hd'), 'Must include SSS-MSH-1210HD module');
  assert.ok(src.includes('mod-sht-1210'), 'Must include SSS-SHT-1210 module');
  assert.ok(src.includes('mod-bbfh-stand'), 'Must include BBFH2-1 stand module');
  assert.ok(src.includes('mod-bbfh-hopper'), 'Must include BBFH2-1 hopper module');
  assert.ok(src.includes('mod-hop-tower-bin'), 'Must include SSS-HOP-4T1000 bin tier');
  assert.ok(src.includes('mod-hop-tower-top'), 'Must include SSS-HOP-4T1000 conical feed hopper');
  assert.ok(src.includes('mod-pst-1111d'), 'Must include SSS-PST-1111D post pallet');
  assert.ok(src.includes('mod-cant-3b8a'), 'Must include SSS-CANT-3B8A cantilever');

  // Verify footprint families
  assert.ok(src.includes('euro-uk-1210'));
  assert.ok(src.includes('bulk-hopper-1111'));
  assert.ok(src.includes('modular-tower-1212'));
  assert.ok(src.includes('post-pallet-1111'));

  // Verify engineering validation function
  assert.ok(src.includes('export function validateStackConfiguration'));
  assert.ok(src.includes('bottomUnitCompressionLoadKg'));
  assert.ok(src.includes('isClearanceCompliant'));
  assert.ok(src.includes('isStackHeightCompliant'));
  assert.ok(src.includes('PUWER 1998 Regulation 6'));

  // Verify 4 curated presets exist
  assert.ok(src.includes('preset-mesh-picking-4high'));
  assert.ok(src.includes('preset-bbfh2-1-bulk-bag'));
  assert.ok(src.includes('preset-hopper-tower-4tier'));
  assert.ok(src.includes('preset-post-pallet-5high'));

  // Verify /workshop page and component exist
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/app/workshop/page.tsx')),
    '/workshop/page.tsx route must exist'
  );
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/WorkshopConfigurator.tsx')),
    'WorkshopConfigurator.tsx component must exist'
  );

  const configuratorSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/WorkshopConfigurator.tsx'),
    'utf8'
  );
  assert.ok(configuratorSrc.includes('handleExportSvg'), 'Must support .SVG assembly export');
  assert.ok(configuratorSrc.includes('handleExportPng'), 'Must support high-res CAD .PNG export');
  assert.ok(configuratorSrc.includes('handleAddConfigurationToBasket'), 'Must support 1-click basket quote adding');
  assert.ok(configuratorSrc.includes('layer-iso-title-block'), 'Must include BS 8888 title block');
});
