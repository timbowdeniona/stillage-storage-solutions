// Safely updates ONLY the 'product' Content Type definition in Contentful CMA.
// ZERO entry data or client edits are touched or overwritten.

import fs from 'node:fs';
import path from 'node:path';

function resolveManagementToken() {
  if (process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
    return process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  }
  for (const envFile of ['.env.local', '.env']) {
    try {
      const envPath = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^\s*CONTENTFUL_MANAGEMENT_TOKEN\s*=\s*(.+)\s*$/m);
        if (match && match[1]) {
          const val = match[1].trim().replace(/^['"]|['"]$/g, '');
          if (val && val !== 'your_contentful_cma_pat_token_here') {
            return val;
          }
        }
      }
    } catch {
      // Ignore
    }
  }
  return undefined;
}

const CMA_TOKEN = resolveManagementToken();
const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'q9ktabz6dqby';
const ENVIRONMENT_ID = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
const BASE_URL = 'https://api.contentful.com';

if (!CMA_TOKEN) {
  console.error('ERROR: No CONTENTFUL_MANAGEMENT_TOKEN found in environment or .env.local');
  process.exit(1);
}

async function cmaFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${CMA_TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`CMA ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${text}`);
  }
  return data;
}

async function run() {
  console.log(`Connecting to Contentful Space ${SPACE_ID} (${ENVIRONMENT_ID})...`);
  const ctPath = `/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/content_types/product`;
  
  const existingContentType = await cmaFetch(ctPath);
  console.log(`Loaded content type: "${existingContentType.name}" (Version ${existingContentType.sys.version})`);

  const fields = [...existingContentType.fields];
  const galleryIndex = fields.findIndex((f) => f.id === 'gallery');

  const galleryFieldDefinition = {
    id: 'gallery',
    name: 'Extra Gallery Images (Up to 5)',
    type: 'Array',
    required: false,
    localized: false,
    items: {
      type: 'Link',
      linkType: 'Asset',
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
    validations: [{ size: { max: 5 } }],
  };

  if (galleryIndex >= 0) {
    console.log('The "gallery" field already exists on product content type. Updating definition...');
    fields[galleryIndex] = { ...fields[galleryIndex], ...galleryFieldDefinition };
  } else {
    // Insert gallery right after technicalDrawing (or secondaryImage)
    const techIndex = fields.findIndex((f) => f.id === 'technicalDrawing');
    const insertAt = techIndex >= 0 ? techIndex + 1 : fields.length;
    console.log(`Inserting "gallery" field at position ${insertAt + 1}...`);
    fields.splice(insertAt, 0, galleryFieldDefinition);
  }

  // Save updated content type
  const updatedContentType = await cmaFetch(ctPath, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(existingContentType.sys.version) },
    body: JSON.stringify({
      name: existingContentType.name,
      description: existingContentType.description,
      displayField: existingContentType.displayField,
      fields,
    }),
  });

  console.log(`Saved product content type (Version ${updatedContentType.sys.version}). Publishing...`);

  // Publish content type
  const publishedContentType = await cmaFetch(`${ctPath}/published`, {
    method: 'PUT',
    headers: { 'X-Contentful-Version': String(updatedContentType.sys.version) },
  });

  console.log(`\nSUCCESS: Successfully updated and published "product" content type (Version ${publishedContentType.sys.version})!`);
  console.log(`The "gallery" field (Array of Media Asset Links, max 5 items) is now live in Contentful.`);
  console.log(`NOTE: Zero entries were touched. All client content edits remain 100% untouched and preserved.`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
