// Contentful Space Cleaner & Stillage Storage Solutions Seeder
// Run with: CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-... npm run contentful:sync

const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const BASE_URL = 'https://api.contentful.com';

if (!CMA_TOKEN) {
  console.error('Error: Please set CONTENTFUL_MANAGEMENT_TOKEN in your environment.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cmaFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${CMA_TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    ...(options.headers || {}),
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 429) {
      const waitSec = Number(res.headers.get('x-contentful-ratelimit-reset')) || 2;
      await sleep(waitSec * 1000 + 300);
      continue;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error(`CMA ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${text}`);
    }
    return data;
  }
}

async function main() {
  const spacesRes = await cmaFetch('/spaces');
  const space = (spacesRes.items || [])[0];
  if (!space) throw new Error('No Contentful spaces found.');
  console.log(`Connected to Contentful space: ${space.name} (${space.sys.id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
