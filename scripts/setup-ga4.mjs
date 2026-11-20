#!/usr/bin/env node
/**
 * Interactive & CLI setup + live verification script for Google Analytics 4 (GA4):
 *  - Client-side gtag.js tracking (NEXT_PUBLIC_GA_MEASUREMENT_ID)
 *  - Server-side GA4 Data API v1beta (GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY)
 *  - Writes .env.local and syncs Netlify production environment variables
 *
 * Usage:
 *   npm run ga4:setup
 *   node scripts/setup-ga4.mjs --local-only
 *   node scripts/setup-ga4.mjs --measurement-id G-XXXXXXXXXX --property-id 123456789 --key-file ./ga4-sa.json
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT_DIR = process.cwd();
const ENV_LOCAL_PATH = path.join(ROOT_DIR, '.env.local');
const GA4_ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta/properties';
const SECRET_KEYS = new Set(['GA4_PRIVATE_KEY']);

function parseArgs(argv) {
  const opts = {
    localOnly: false,
    skipVerify: false,
    measurementId: '',
    propertyId: '',
    keyFile: '',
    clientEmail: '',
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--local-only') opts.localOnly = true;
    else if (arg === '--skip-verify') opts.skipVerify = true;
    else if (arg === '--measurement-id' && argv[i + 1]) {
      opts.measurementId = argv[i + 1].trim();
      i += 1;
    } else if (arg === '--property-id' && argv[i + 1]) {
      opts.propertyId = argv[i + 1].trim();
      i += 1;
    } else if (arg === '--key-file' && argv[i + 1]) {
      opts.keyFile = argv[i + 1].trim();
      i += 1;
    } else if (arg === '--client-email' && argv[i + 1]) {
      opts.clientEmail = argv[i + 1].trim();
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      opts.help = true;
    }
  }
  return opts;
}

function readEnvFile(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    map.set(key, val);
  }
  return map;
}

function formatEnvValue(key, value) {
  if (key === 'GA4_PRIVATE_KEY') {
    const singleLine = value
      .replace(/\r\n/g, '\n')
      .trim()
      .replace(/\n/g, '\\n');
    return `"${singleLine}\\n"`;
  }
  if (/[\s#"']/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function upsertEnvLocal(filePath, updates) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const lines = content ? content.split(/\r?\n/) : [];
  const remaining = new Map(Object.entries(updates).filter(([, v]) => Boolean(v)));

  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) return line;
    const key = trimmed.slice(0, eq).trim();
    if (remaining.has(key)) {
      const nextVal = remaining.get(key);
      remaining.delete(key);
      return `${key}=${formatEnvValue(key, nextVal)}`;
    }
    return line;
  });

  if (remaining.size > 0) {
    if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1].trim() !== '') {
      updatedLines.push('');
    }
    updatedLines.push('# Google Analytics 4 (GA4 Site Tracking + Server-Side Data API v1beta)');
    for (const [key, val] of remaining.entries()) {
      updatedLines.push(`${key}=${formatEnvValue(key, val)}`);
    }
  }

  fs.writeFileSync(filePath, `${updatedLines.join('\n').replace(/\n+$/, '')}\n`, 'utf8');
}

function normalizePropertyId(raw) {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^properties\//i, '')
    .trim();
  return /^\d+$/.test(cleaned) ? cleaned : '';
}

function normalizePrivateKey(raw) {
  let cleaned = String(raw || '').trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  if (!cleaned.includes('-----BEGIN') || !cleaned.includes('PRIVATE KEY-----')) {
    return '';
  }
  return cleaned.endsWith('\n') ? cleaned : `${cleaned}\n`;
}

function createServiceAccountJwt(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' }), 'utf8').toString(
    'base64url'
  );
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: GA4_ANALYTICS_SCOPE,
      aud: GOOGLE_OAUTH_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
    'utf8'
  ).toString('base64url');
  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput, 'utf8');
  signer.end();
  const signature = signer.sign(privateKeyPem, 'base64url');
  return `${signingInput}.${signature}`;
}

async function verifyGa4DataApi(propertyId, clientEmail, privateKeyPem) {
  const assertion = createServiceAccountJwt(clientEmail, privateKeyPem);
  const tokenRes = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    return {
      ok: false,
      error: tokenJson.error_description || tokenJson.error || `OAuth error (${tokenRes.status})`,
    };
  }

  const reportRes = await fetch(`${GA4_DATA_API_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    }),
  });
  const reportJson = await reportRes.json();
  if (!reportRes.ok) {
    return {
      ok: false,
      status: reportRes.status,
      error: reportJson?.error?.message || `GA4 Data API error (${reportRes.status})`,
    };
  }

  const row = reportJson?.rows?.[0];
  const activeUsers = Number(row?.metricValues?.[0]?.value || 0);
  const pageViews = Number(row?.metricValues?.[1]?.value || 0);
  return { ok: true, activeUsers, pageViews };
}

function commandExists(cmd) {
  const res = spawnSync('which', [cmd], { stdio: 'ignore' });
  return res.status === 0;
}

function syncToNetlify(updates) {
  if (!commandExists('netlify')) {
    console.log('\n[Netlify] netlify CLI not found — skipping remote env sync.');
    return;
  }

  console.log('\n[Netlify] Syncing GA4 environment variables to linked Netlify site...');
  for (const [key, rawValue] of Object.entries(updates)) {
    if (!rawValue) continue;
    const value =
      key === 'GA4_PRIVATE_KEY'
        ? `${rawValue.replace(/\r\n/g, '\n').trim().replace(/\n/g, '\\n')}\\n`
        : rawValue;

    const args = ['env:set', key, value];
    if (SECRET_KEYS.has(key)) {
      args.push('--secret');
    }
    const res = spawnSync('netlify', args, { encoding: 'utf8' });
    if (res.status === 0) {
      console.log(`  ✔ Set ${key}${SECRET_KEYS.has(key) ? ' (secret)' : ''}`);
    } else {
      console.log(`  ✖ Failed to set ${key}: ${(res.stderr || res.stdout || '').trim()}`);
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(`
Google Analytics 4 (GA4) Setup & Verification — Stillage Storage Solutions

Usage:
  npm run ga4:setup
  node scripts/setup-ga4.mjs --local-only
  node scripts/setup-ga4.mjs --measurement-id G-XXXXXXXXXX --property-id 123456789 --key-file ./sa-key.json

Options:
  --measurement-id <id>   GA4 Web Stream Measurement ID (e.g. G-ABC123DEF4)
  --property-id <id>      Numeric GA4 Property ID (e.g. 412345678)
  --key-file <path>       Path to GCP Service Account JSON key file
  --client-email <email>  GCP Service Account email (if not using --key-file)
  --local-only            Only update .env.local (skip Netlify env sync)
  --skip-verify           Skip live GA4 Data API test call
`);
    process.exit(0);
  }

  const existing = readEnvFile(ENV_LOCAL_PATH);
  let measurementId = opts.measurementId || existing.get('NEXT_PUBLIC_GA_MEASUREMENT_ID') || '';
  let propertyId = normalizePropertyId(opts.propertyId || existing.get('GA4_PROPERTY_ID') || '');
  let clientEmail = opts.clientEmail || existing.get('GA4_CLIENT_EMAIL') || '';
  let privateKey = normalizePrivateKey(existing.get('GA4_PRIVATE_KEY') || '');

  if (opts.keyFile) {
    const resolved = path.resolve(opts.keyFile);
    const keyJson = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    if (keyJson.client_email) clientEmail = String(keyJson.client_email).trim();
    if (keyJson.private_key) privateKey = normalizePrivateKey(keyJson.private_key);
  }

  const needsPrompt = !measurementId || !propertyId || !clientEmail || !privateKey;
  if (needsPrompt && process.stdin.isTTY) {
    const rl = createInterface({ input, output });
    try {
      console.log('\n==============================================================');
      console.log(' Google Analytics 4 (GA4) Setup — Stillage Storage Solutions');
      console.log('==============================================================');
      console.log('1) In Google Analytics (https://analytics.google.com):');
      console.log('   - Admin → Data Streams → Web → copy Measurement ID (G-...)');
      console.log('   - Admin → Property Details → copy numeric Property ID');
      console.log('2) In Google Cloud Console (https://console.cloud.google.com):');
      console.log('   - Enable "Google Analytics Data API"');
      console.log('   - IAM & Admin → Service Accounts → Create & download JSON key');
      console.log('   - Grant that Service Account email "Viewer" role in GA4 Admin → Property Access Management\n');

      const mAnswer = await rl.question(
        `GA4 Measurement ID (G-...) [${measurementId || 'none'}]: `
      );
      if (mAnswer.trim()) measurementId = mAnswer.trim();

      const pAnswer = await rl.question(
        `GA4 Numeric Property ID [${propertyId || 'none'}]: `
      );
      if (pAnswer.trim()) propertyId = normalizePropertyId(pAnswer.trim());

      const keyPathAnswer = await rl.question(
        'Path to GCP Service Account JSON key file (leave blank to keep/skip): '
      );
      if (keyPathAnswer.trim()) {
        const resolved = path.resolve(keyPathAnswer.trim().replace(/^~/, process.env.HOME || ''));
        const keyJson = JSON.parse(fs.readFileSync(resolved, 'utf8'));
        if (keyJson.client_email) clientEmail = String(keyJson.client_email).trim();
        if (keyJson.private_key) privateKey = normalizePrivateKey(keyJson.private_key);
        console.log(`  ✔ Loaded service account: ${clientEmail}`);
      }
    } finally {
      rl.close();
    }
  }

  if (measurementId && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
    console.error(`✖ Invalid GA4 Measurement ID "${measurementId}" (expected G-XXXXXXXXXX).`);
    process.exit(1);
  }

  const updates = {};
  if (measurementId) updates.NEXT_PUBLIC_GA_MEASUREMENT_ID = measurementId;
  if (propertyId) updates.GA4_PROPERTY_ID = propertyId;
  if (clientEmail) updates.GA4_CLIENT_EMAIL = clientEmail;
  if (privateKey) updates.GA4_PRIVATE_KEY = privateKey;

  if (Object.keys(updates).length === 0) {
    console.log('No GA4 credentials provided. Nothing changed.');
    process.exit(0);
  }

  if (!opts.skipVerify && propertyId && clientEmail && privateKey) {
    console.log(`\nVerifying live GA4 Data API access for property ${propertyId}...`);
    const check = await verifyGa4DataApi(propertyId, clientEmail, privateKey);
    if (check.ok) {
      console.log(
        `  ✔ Connected to GA4 Data API! Last 7 days: ${check.activeUsers} active users, ${check.pageViews} page views.`
      );
    } else {
      console.log(`  ⚠ GA4 Data API check returned an error: ${check.error}`);
      if (check.status === 403) {
        console.log(
          `    → Make sure ${clientEmail} has the "Viewer" role in GA4 Admin → Property Access Management.`
        );
      }
    }
  }

  upsertEnvLocal(ENV_LOCAL_PATH, updates);
  console.log(`\n✔ Saved ${Object.keys(updates).join(', ')} to .env.local`);

  if (!opts.localOnly) {
    syncToNetlify(updates);
  }

  console.log('\nDone! Restart your dev server (npm run dev) and visit /admin/analytics to see live GA4 data.');
}

main().catch((err) => {
  console.error('GA4 setup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
