import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  COMPONENT_MICROTEXTS_CONTENT_TYPE,
  HOME_PAGE_CONTENT_TYPE,
  NAVIGATION_MENU_CONTENT_TYPE,
  SEED_COMPONENT_MICROTEXT_ENTRIES,
  SEED_HOME_PAGE_ENTRY,
  SEED_NAVIGATION_ENTRIES,
} from '../scripts/contentful-sync.mjs';

test('Brand icon, favicon.ico, apple-icon.png, and manifest.ts exist and are non-empty', () => {
  const requiredFiles = [
    'src/app/icon.svg',
    'src/app/favicon.ico',
    'src/app/apple-icon.png',
    'src/app/manifest.ts',
    'src/components/BrandIcon.tsx',
  ];

  for (const relPath of requiredFiles) {
    const absPath = path.resolve(process.cwd(), relPath);
    assert.ok(fs.existsSync(absPath), `Expected ${relPath} to exist`);
    const stat = fs.statSync(absPath);
    assert.ok(stat.size > 0, `Expected ${relPath} to be non-empty`);
  }

  const iconSvg = fs.readFileSync(path.resolve(process.cwd(), 'src/app/icon.svg'), 'utf8');
  assert.ok(iconSvg.includes('#0F2342'), 'icon.svg should use Brand Navy #0F2342');
  assert.ok(iconSvg.includes('#145DA0'), 'icon.svg should use Stillage Blue #145DA0');
});

test('Contentful homePage content type and seed entry define editable hero, filters, guides, and SEO', () => {
  assert.equal(HOME_PAGE_CONTENT_TYPE.id, 'homePage');
  const fieldIds = HOME_PAGE_CONTENT_TYPE.fields.map((f) => f.id);
  for (const expected of [
    'heroHeadlineLine1',
    'heroHeadlineLine2',
    'heroSubtitleTemplate',
    'heroCtaLabel',
    'heroCtaHref',
    'heroImage',
    'filterAllLabel',
    'filterCantileverLabel',
    'filterHopperLabel',
    'filterSheetMeshLabel',
    'filterPostPalletsLabel',
    'guidesTitle',
    'seoTitle',
    'seoDescription',
  ]) {
    assert.ok(fieldIds.includes(expected), `Missing homePage field: ${expected}`);
  }

  assert.equal(SEED_HOME_PAGE_ENTRY.id, 'home-page-main');
  assert.ok(SEED_HOME_PAGE_ENTRY.heroSubtitleTemplate.includes('{count}'));
  assert.equal(SEED_HOME_PAGE_ENTRY.heroImage.sys.linkType, 'Asset');
});

test('Contentful navigationMenu content type and seed entries cover header and footer menus', () => {
  assert.equal(NAVIGATION_MENU_CONTENT_TYPE.id, 'navigationMenu');
  const menuKeys = SEED_NAVIGATION_ENTRIES.map((m) => m.menuKey);
  assert.deepEqual(menuKeys, ['header-main', 'footer-products', 'footer-engineering']);

  const headerMenu = SEED_NAVIGATION_ENTRIES.find((m) => m.menuKey === 'header-main');
  assert.ok(headerMenu.items.length >= 4);
  const productsItem = headerMenu.items.find((i) => i.label === 'Products');
  assert.ok(Array.isArray(productsItem.children) && productsItem.children.length >= 4);
});

test('Contentful componentMicrotexts content type and seed entries cover separate components', () => {
  assert.equal(COMPONENT_MICROTEXTS_CONTENT_TYPE.id, 'componentMicrotexts');
  const keys = SEED_COMPONENT_MICROTEXT_ENTRIES.map((e) => e.componentKey);
  for (const expectedKey of [
    'header',
    'footer',
    'product-card',
    'blog-card',
    'product-configurator',
    'checkout',
  ]) {
    assert.ok(keys.includes(expectedKey), `Missing componentMicrotexts entry for ${expectedKey}`);
  }
});
