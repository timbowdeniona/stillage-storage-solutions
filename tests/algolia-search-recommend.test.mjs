import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALGOLIA_ARTICLES_QUERY_RULES,
  ALGOLIA_ARTICLES_SETTINGS,
  ALGOLIA_INDEX_SETTINGS,
  ALGOLIA_QUERY_RULES,
  ALGOLIA_SYNONYMS,
  SEED_ALGOLIA_PRODUCTS,
  buildAlgoliaArticleRecord,
  buildAlgoliaProductRecord,
  getReplicaIndexNames,
} from '../scripts/algolia-sync.mjs';
import { SEED_BLOG_ENTRIES } from '../scripts/contentful-sync.mjs';

test('Algolia index settings configure searchableAttributes, attributesForFaceting, highlighting, and customRanking', () => {
  assert.ok(Array.isArray(ALGOLIA_INDEX_SETTINGS.searchableAttributes));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(sku)'));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(footprintMm)'));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(useCases)'));
  assert.ok(
    ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(availableFinishes)')
  );

  assert.equal(ALGOLIA_INDEX_SETTINGS.highlightPreTag, '<mark>');
  assert.equal(ALGOLIA_INDEX_SETTINGS.highlightPostTag, '</mark>');

  assert.ok(Array.isArray(ALGOLIA_INDEX_SETTINGS.attributesForFaceting));
  assert.ok(
    ALGOLIA_INDEX_SETTINGS.attributesForFaceting.includes('searchable(categorySlug)')
  );
  assert.ok(
    ALGOLIA_INDEX_SETTINGS.attributesForFaceting.includes('searchable(footprintMm)')
  );
  assert.ok(
    ALGOLIA_INDEX_SETTINGS.attributesForFaceting.includes('filterOnly(inStock)')
  );
  assert.ok(
    ALGOLIA_INDEX_SETTINGS.attributesForFaceting.includes('filterOnly(swlKg)')
  );

  const replicas = getReplicaIndexNames('stillage_products');
  assert.equal(replicas.priceAsc, 'stillage_products_price_asc');
  assert.equal(replicas.priceDesc, 'stillage_products_price_desc');
  assert.equal(replicas.swlDesc, 'stillage_products_swl_desc');
});

test('Algolia synonyms and programmable Query Rules cover key industrial workflows', () => {
  assert.ok(ALGOLIA_SYNONYMS.length >= 6);
  const synIds = ALGOLIA_SYNONYMS.map((s) => s.objectID);
  assert.ok(synIds.includes('syn-stillage-cage-bin'));
  assert.ok(synIds.includes('syn-galvanised-outdoor'));
  assert.ok(synIds.includes('syn-telehandler-pockets'));

  assert.equal(ALGOLIA_QUERY_RULES.length, 3);
  assert.equal(ALGOLIA_ARTICLES_QUERY_RULES.length, 1);
  const ruleIds = [
    ...ALGOLIA_QUERY_RULES.map((r) => r.objectID),
    ...ALGOLIA_ARTICLES_QUERY_RULES.map((r) => r.objectID),
  ];
  assert.ok(ruleIds.includes('rule-outdoor-galvanised'));
  assert.ok(ruleIds.includes('rule-crane-loler-bespoke'));
  assert.ok(ruleIds.includes('rule-bulk-pallet-fleet'));
  assert.ok(ruleIds.includes('rule-saw-station-cantilever'));
});

test('buildAlgoliaProductRecord enriches all seeded products with bulk price tiers and variant facets', () => {
  assert.equal(SEED_ALGOLIA_PRODUCTS.length, 6);

  for (const raw of SEED_ALGOLIA_PRODUCTS) {
    const record = buildAlgoliaProductRecord(raw);
    assert.equal(record.objectID, raw.id);
    assert.equal(record.footprintMm, `${raw.externalLengthMm}x${raw.externalWidthMm}`);
    assert.equal(
      record.dimensionsText,
      `${raw.externalLengthMm}x${raw.externalWidthMm}x${raw.externalHeightMm}mm`
    );
    assert.equal(
      record.bulkPrice5PlusExVatPence,
      Math.round(raw.basePriceExVatPence * 0.95)
    );
    assert.equal(
      record.bulkPrice10PlusExVatPence,
      Math.round(raw.basePriceExVatPence * 0.9)
    );
    assert.equal(record.availableFinishes.length, 4);
    assert.equal(record.availableMobility.length, 4);
    assert.ok(Array.isArray(record.compatibleSkus) && record.compatibleSkus.length >= 2);
  }
});

test('Federated stillage_articles index builder formats all technical compliance guides', () => {
  assert.ok(Array.isArray(ALGOLIA_ARTICLES_SETTINGS.searchableAttributes));
  assert.ok(ALGOLIA_ARTICLES_SETTINGS.searchableAttributes.includes('unordered(tags)'));

  const articleRecords = SEED_BLOG_ENTRIES.map((post) => buildAlgoliaArticleRecord(post));
  assert.ok(articleRecords.length >= 5);
  for (const rec of articleRecords) {
    assert.ok(rec.objectID.startsWith('blog-'));
    assert.ok(rec.slug.length > 5);
    assert.ok(Array.isArray(rec.relatedProductSkus));
  }
});

test('Quota cache, federated multi-query, safe AlgoliaHighlight, and gemini-3.8-flash agent are wired', () => {
  const advisorSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/lib/aiSpecAdvisor.ts'),
    'utf8'
  );
  assert.ok(
    advisorSource.includes("'gemini-3.8-flash'"),
    'Expected aiSpecAdvisor.ts to use gemini-3.8-flash model'
  );

  const algoliaSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/lib/algolia.ts'),
    'utf8'
  );
  assert.ok(algoliaSource.includes('getCachedAlgoliaResult'));
  assert.ok(algoliaSource.includes('skipNetworkOnDefault'));
  assert.ok(algoliaSource.includes('/1/indexes/*/queries'));

  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/AlgoliaHighlight.tsx'))
  );
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/AlgoliaRecommendations.tsx'))
  );
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/AiSpecAdvisor.tsx'))
  );
});
