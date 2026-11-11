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

test('ProductCard.tsx renders technicalDrawing hover flick image and CAD Drawing badge', () => {
  const cardPath = path.resolve(process.cwd(), 'src/components/ProductCard.tsx');
  const cardSrc = fs.readFileSync(cardPath, 'utf8');

  assert.ok(cardSrc.includes('product.technicalDrawing'), 'ProductCard must reference product.technicalDrawing');
  assert.ok(cardSrc.includes('group-hover:opacity-100'), 'ProductCard must use group-hover:opacity-100 for hover flick');
  assert.ok(cardSrc.includes('CAD Drawing'), 'ProductCard must display CAD Drawing badge on hover');
});

test('ProductConfigurator.tsx manages media items (Primary, CAD Drawing, Gallery) with badges and thumbnails', () => {
  const confPath = path.resolve(process.cwd(), 'src/components/ProductConfigurator.tsx');
  const confSrc = fs.readFileSync(confPath, 'utf8');

  assert.ok(confSrc.includes('mediaItems'), 'ProductConfigurator must define mediaItems array');
  assert.ok(confSrc.includes('product.technicalDrawing'), 'ProductConfigurator must check product.technicalDrawing');
  assert.ok(confSrc.includes('product.gallery'), 'ProductConfigurator must inspect product.gallery');
  assert.ok(confSrc.includes('CAD Dimensional Blueprint'), 'ProductConfigurator must display CAD Blueprint badge on active drawing view');
});
