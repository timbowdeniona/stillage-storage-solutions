import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALGOLIA_INDEX_SETTINGS,
  ALGOLIA_SYNONYMS,
  SEED_ALGOLIA_PRODUCTS,
  buildAlgoliaProductRecord,
} from '../scripts/algolia-sync.mjs';

test('Algolia index settings configure searchableAttributes, attributesForFaceting, and customRanking', () => {
  assert.ok(Array.isArray(ALGOLIA_INDEX_SETTINGS.searchableAttributes));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(sku)'));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(footprintMm)'));
  assert.ok(ALGOLIA_INDEX_SETTINGS.searchableAttributes.includes('unordered(useCases)'));

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

  assert.deepEqual(ALGOLIA_INDEX_SETTINGS.customRanking, [
    'desc(featured)',
    'desc(inStock)',
    'desc(swlKg)',
  ]);
});

test('Algolia synonyms cover key industrial stillage and finish terminology', () => {
  assert.ok(ALGOLIA_SYNONYMS.length >= 6);
  const synIds = ALGOLIA_SYNONYMS.map((s) => s.objectID);
  assert.ok(synIds.includes('syn-stillage-cage-bin'));
  assert.ok(synIds.includes('syn-galvanised-outdoor'));
  assert.ok(synIds.includes('syn-telehandler-pockets'));
});

test('buildAlgoliaProductRecord enriches all seeded products with objectID, footprintMm, and compatibility metadata', () => {
  assert.equal(SEED_ALGOLIA_PRODUCTS.length, 6);

  for (const raw of SEED_ALGOLIA_PRODUCTS) {
    const record = buildAlgoliaProductRecord(raw);
    assert.equal(record.objectID, raw.id);
    assert.equal(record.footprintMm, `${raw.externalLengthMm}x${raw.externalWidthMm}`);
    assert.equal(
      record.dimensionsText,
      `${raw.externalLengthMm}x${raw.externalWidthMm}x${raw.externalHeightMm}mm`
    );
    assert.ok(Array.isArray(record.compatibleSkus) && record.compatibleSkus.length >= 2);
    assert.ok(Array.isArray(record.useCases) && record.useCases.length >= 3);
    assert.ok(Array.isArray(record.environmentTags) && record.environmentTags.length >= 2);
  }
});

test('AI Spec Advisor agent and Algolia Recommendation modules are wired with gemini-3.8-flash', () => {
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
  assert.ok(
    algoliaSource.includes('getProductRecommendations'),
    'Expected algolia.ts to export getProductRecommendations'
  );
  assert.ok(
    algoliaSource.includes('parseNaturalLanguageSearchIntent'),
    'Expected algolia.ts to export parseNaturalLanguageSearchIntent'
  );

  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/AlgoliaRecommendations.tsx'))
  );
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/components/AiSpecAdvisor.tsx'))
  );
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'src/app/api/ai/spec-advisor/route.ts'))
  );
});
