import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PRODUCT_CONTENT_TYPE,
  SEED_PRODUCT_ENTRIES,
} from '../scripts/contentful-sync.mjs';

test('Contentful product content type defines primaryImage, technicalDrawing, and gallery (max 5 items)', () => {
  const fields = PRODUCT_CONTENT_TYPE.fields;

  // 1. primaryImage
  const primaryField = fields.find((f) => f.id === 'primaryImage');
  assert.ok(primaryField, 'primaryImage field must exist on product content type');
  assert.equal(primaryField.type, 'Link');
  assert.equal(primaryField.linkType, 'Asset');
  assert.equal(primaryField.required, true);

  // 2. technicalDrawing
  const drawingField = fields.find((f) => f.id === 'technicalDrawing');
  assert.ok(drawingField, 'technicalDrawing field must exist on product content type');
  assert.equal(drawingField.type, 'Link');
  assert.equal(drawingField.linkType, 'Asset');

  // 3. gallery (max 5 items)
  const galleryField = fields.find((f) => f.id === 'gallery');
  assert.ok(galleryField, 'gallery field must exist on product content type');
  assert.equal(galleryField.type, 'Array');
  assert.equal(galleryField.items.type, 'Link');
  assert.equal(galleryField.items.linkType, 'Asset');
  assert.deepEqual(galleryField.validations, [{ size: { max: 5 } }]);
});

test('All seed products in contentful-sync.mjs have primaryImage, technicalDrawing, and gallery populated', () => {
  assert.ok(SEED_PRODUCT_ENTRIES.length >= 7, 'Must have at least 7 seeded products');

  for (const prod of SEED_PRODUCT_ENTRIES) {
    assert.ok(prod.primaryImage, `${prod.sku} must have primaryImage`);
    assert.ok(prod.technicalDrawing, `${prod.sku} must have technicalDrawing`);
    assert.ok(Array.isArray(prod.gallery), `${prod.sku} must have gallery array`);
    assert.ok(prod.gallery.length <= 5, `${prod.sku} gallery must not exceed 5 extra images`);
    assert.ok(prod.gallery.length > 0, `${prod.sku} gallery should have at least 1 extra image`);
  }
});

test('Next.js seedCatalog.ts has primaryImage, technicalDrawing, and gallery configured across all products', () => {
  const catalogPath = path.resolve(process.cwd(), 'src/data/seedCatalog.ts');
  const catalogSrc = fs.readFileSync(catalogPath, 'utf8');

  assert.ok(catalogSrc.includes('primaryImage:'), 'seedCatalog.ts must configure primaryImage');
  assert.ok(catalogSrc.includes('technicalDrawing:'), 'seedCatalog.ts must configure technicalDrawing');
  assert.ok(catalogSrc.includes('gallery: ['), 'seedCatalog.ts must configure gallery arrays');
});

test('ProductCard.tsx renders technicalDrawing hover flick image without CAD Drawing badge', () => {
  const cardPath = path.resolve(process.cwd(), 'src/components/ProductCard.tsx');
  const cardSrc = fs.readFileSync(cardPath, 'utf8');

  assert.ok(cardSrc.includes('product.technicalDrawing'), 'ProductCard must reference product.technicalDrawing');
  assert.ok(cardSrc.includes('group-hover:opacity-100'), 'ProductCard must use group-hover:opacity-100 for hover flick');
  assert.ok(!cardSrc.includes('cadBadgeLabel'), 'ProductCard must not display cadBadgeLabel on hover');
  assert.ok(!cardSrc.includes('CAD Drawing'), 'ProductCard must not display CAD Drawing badge on hover');
});

test('Product filters on home and listing pages are hidden behind FEATURES.enableProductFilters while keeping filtering logic intact', () => {
  const featuresSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/features.ts'), 'utf8');
  const homeSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/redesign/Approach1HomePage.tsx'),
    'utf8'
  );
  const listingSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ProductListingClient.tsx'),
    'utf8'
  );

  assert.ok(
    featuresSrc.includes("enableProductFilters: process.env.NEXT_PUBLIC_ENABLE_PRODUCT_FILTERS === 'true'"),
    'FEATURES.enableProductFilters must default to false unless NEXT_PUBLIC_ENABLE_PRODUCT_FILTERS=true'
  );
  assert.ok(
    homeSrc.includes('FEATURES.enableProductFilters'),
    'Approach1HomePage must gate category filter pills behind FEATURES.enableProductFilters'
  );
  assert.ok(
    homeSrc.includes('selectedCategory'),
    'Approach1HomePage must preserve category filtering state to restore later'
  );
  assert.ok(
    listingSrc.includes('FEATURES.enableProductFilters'),
    'ProductListingClient must gate filter controls behind FEATURES.enableProductFilters'
  );
  assert.ok(
    listingSrc.includes('searchProductsWithAlgolia'),
    'ProductListingClient must preserve filtering functionality to restore later'
  );
});

test('ProductConfigurator.tsx manages media items (Primary, CAD Drawing, Gallery) with badges and thumbnails', () => {
  const confPath = path.resolve(process.cwd(), 'src/components/ProductConfigurator.tsx');
  const confSrc = fs.readFileSync(confPath, 'utf8');

  assert.ok(confSrc.includes('mediaItems'), 'ProductConfigurator must define mediaItems array');
  assert.ok(confSrc.includes('product.technicalDrawing'), 'ProductConfigurator must check product.technicalDrawing');
  assert.ok(confSrc.includes('product.gallery'), 'ProductConfigurator must inspect product.gallery');
  assert.ok(confSrc.includes('<span>{product.title}</span>'), 'Top-left badge must persistently display product.title across all views');
  assert.ok(!confSrc.includes('Primary Product Elevation'), 'Primary badge must show product.title instead of Primary Product Elevation');
  assert.ok(!confSrc.includes('CAD Dimensional Blueprint'), 'Top-left badge must not switch to CAD Dimensional Blueprint');
  assert.ok(!confSrc.includes('(Supplemental Image)'), 'Top-left badge must not switch to Supplemental Image');
  assert.ok(!confSrc.includes('SKU: {product.sku}'), 'SKU header bar in ProductConfigurator must be removed');
  assert.ok(!confSrc.includes('Select Surface Finish / RAL Coating'), 'Surface finish / RAL coating selector must be removed');
  assert.ok(!confSrc.includes('Interactive CAD'), 'Interactive CAD buttons must be removed from ProductConfigurator');
  assert.ok(confSrc.includes('2. Order Quantity'), 'Step 2 must be titled 2. Order Quantity');
  assert.ok(!confSrc.includes('2. Order Quantity &amp; Bulk Tiers'), 'Bulk Tiers must be removed from Step 2 heading');
  assert.ok(!confSrc.includes('Bulk Tier Alert'), 'Bulk Tier Alert box must be removed');
  assert.ok(!confSrc.includes('Save 5%'), 'Bulk tier quick-select buttons must be removed');
});
