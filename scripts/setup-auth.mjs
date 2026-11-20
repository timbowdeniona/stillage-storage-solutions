#!/usr/bin/env node
/**
 * Interactive setup script for Auth.js v5 social login (Google & Microsoft Entra ID)
 * and Netlify environment variable syncing.
 *
 * Usage:
 *   node scripts/setup-auth.mjs
 *   node scripts/setup-auth.mjs --local-only
 *   node scripts/setup-auth.mjs --skip-google
 *   node scripts/setup-auth.mjs --skip-microsoft
 *   node scripts/setup-auth.mjs --facebook
 *   node scripts/setup-auth.mjs --domain https://stillagestoragesolutions.co.uk
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT_DIR = process.cwd();
const ENV_LOCAL_PATH = path.join(ROOT_DIR, '.env.local');
const DEFAULT_PROD_ORIGIN = 'https://stillagestoragesolutions.co.uk';
const DEFAULT_NETLIFY_ORIGIN = 'https://stillage-storage-uk.netlify.app';
const DEFAULT_LOCAL_ORIGIN = 'http://localhost:3000';
const DEFAULT_ADMIN_EMAILS = 'timdbowden@gmail.com,admin@plantandrobinson.com';
const MICROSOFT_DEFAULT_ISSUER = 'https://login.microsoftonline.com/common/v2.0';
const APP_DISPLAY_NAME = 'Stillage Storage Solutions';

const SECRET_KEYS = new Set([
  'AUTH_SECRET',
  'AUTH_GOOGLE_SECRET',
  'AUTH_MICROSOFT_ENTRA_ID_SECRET',
  'AUTH_FACEBOOK_SECRET',
]);

function parseArgs(argv) {
  const opts = {
    localOnly: false,
    google: true,
    microsoft: true,
    facebook: false,
    prodOrigin: DEFAULT_PROD_ORIGIN,
    netlifyOrigin: DEFAULT_NETLIFY_ORIGIN,
    localOrigin: DEFAULT_LOCAL_ORIGIN,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--local-only') opts.localOnly = true;
    else if (arg === '--skip-google') opts.google = false;
    else if (arg === '--skip-microsoft') opts.microsoft = false;
    else if (arg === '--facebook') opts.facebook = true;
    else if (arg === '--domain' && argv[i + 1]) {
      opts.prodOrigin = argv[i + 1].replace(/\/+$/, '');
      i += 1;
    } else if (arg === '--netlify-url' && argv[i + 1]) {
      opts.netlifyOrigin = argv[i + 1].replace(/\/+$/, '');
      i += 1;
    } else if (arg === '--local-url' && argv[i + 1]) {
      opts.localOrigin = argv[i + 1].replace(/\/+$/, '');
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      opts.help = true;
    }
  }
  return opts;
}

function getOrigins(opts) {
  return Array.from(new Set([opts.localOrigin, opts.netlifyOrigin, opts.prodOrigin].filter(Boolean)));
}

function commandExists(cmd) {
  const res = spawnSync('which', [cmd], { stdio: 'ignore' });
  return res.status === 0;
}

function runCapture(cmd, args) {
  try {
    return {
      ok: true,
      stdout: execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(),
    };
  } catch (err) {
    return {
      ok: false,
      stdout: err.stdout ? String(err.stdout).trim() : '',
      stderr: err.stderr ? String(err.stderr).trim() : err.message,
    };
  }
}

function runInteractive(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  return res.status === 0;
}

function openBrowser(url) {
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    spawnSync(opener, [url], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function maskValue(key, value) {
  if (!value) return '(not set)';
  if (!SECRET_KEYS.has(key)) return value;
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function parseEnvFile(content) {
  const map = new Map();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    let val = line.slice(eqIndex + 1).trim();
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

function formatEnvValue(value) {
  if (/[\s#"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

function upsertEnvFile(filePath, updates) {
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const lines = existingContent ? existingContent.split(/\r?\n/) : [];
  const remaining = new Map(Object.entries(updates).filter(([, v]) => Boolean(v)));

  const updatedLines = lines.map((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return line;
    const key = match[1];
    if (!remaining.has(key)) return line;
    const value = remaining.get(key);
    remaining.delete(key);
    return `${key}=${formatEnvValue(value)}`;
  });

  if (remaining.size > 0) {
    if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1].trim() !== '') {
      updatedLines.push('');
    }
    const hasAuthHeader = updatedLines.some((l) => l.includes('Authentication & RBAC'));
    if (!hasAuthHeader) {
      updatedLines.push('# Authentication & RBAC (Auth.js v5)');
    }
    for (const [key, value] of remaining.entries()) {
      updatedLines.push(`${key}=${formatEnvValue(value)}`);
    }
  }

  const finalContent = `${updatedLines.join('\n').replace(/\n*$/, '')}\n`;
  fs.writeFileSync(filePath, finalContent, { encoding: 'utf8', mode: 0o600 });
}

async function promptText(rl, question, defaultValue = '') {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultValue;
}

async function promptYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === 'y' || answer === 'yes';
}

async function setupCoreAuth(rl, existingEnv, updates) {
  console.log('\n── 1. Core Auth (AUTH_SECRET & ADMIN_EMAILS) ───────────────────────────');

  const existingSecret = existingEnv.get('AUTH_SECRET');
  if (existingSecret) {
    console.log(`Found existing AUTH_SECRET (${maskValue('AUTH_SECRET', existingSecret)}).`);
    const rotate = await promptYesNo(rl, 'Rotate AUTH_SECRET with a newly generated value?', false);
    updates.AUTH_SECRET = rotate ? crypto.randomBytes(32).toString('base64') : existingSecret;
  } else {
    updates.AUTH_SECRET = crypto.randomBytes(32).toString('base64');
    console.log('Generated new AUTH_SECRET (32-byte base64).');
  }

  const defaultAdmins = existingEnv.get('ADMIN_EMAILS') || DEFAULT_ADMIN_EMAILS;
  updates.ADMIN_EMAILS = await promptText(rl, 'Admin emails (comma-separated)', defaultAdmins);
}

async function setupMicrosoftEntra(rl, existingEnv, updates, opts) {
  console.log('\n── 2. Microsoft Entra ID (Automated via Azure CLI) ─────────────────────');
  const redirectUris = getOrigins(opts).map(
    (origin) => `${origin}/api/auth/callback/microsoft-entra-id`
  );

  const existingId = existingEnv.get('AUTH_MICROSOFT_ENTRA_ID_ID');
  const existingSecret = existingEnv.get('AUTH_MICROSOFT_ENTRA_ID_SECRET');
  if (existingId && existingSecret) {
    console.log(`Found existing Microsoft credentials (${existingId}).`);
    const reconfigure = await promptYesNo(rl, 'Reconfigure Microsoft Entra ID?', false);
    if (!reconfigure) {
      updates.AUTH_MICROSOFT_ENTRA_ID_ID = existingId;
      updates.AUTH_MICROSOFT_ENTRA_ID_SECRET = existingSecret;
      updates.AUTH_MICROSOFT_ENTRA_ID_ISSUER =
        existingEnv.get('AUTH_MICROSOFT_ENTRA_ID_ISSUER') || MICROSOFT_DEFAULT_ISSUER;
      return;
    }
  }

  let automatedOk = false;

  if (commandExists('az')) {
    const useAz = await promptYesNo(
      rl,
      'Automatically create/configure the Microsoft Entra app using `az` CLI?',
      true
    );

    if (useAz) {
      let signedIn = runCapture('az', ['ad', 'signed-in-user', 'show', '--query', 'userPrincipalName', '-o', 'tsv']);
      if (!signedIn.ok) {
        console.log('Not signed in to Azure CLI. Launching `az login --allow-no-subscriptions`...');
        if (runInteractive('az', ['login', '--allow-no-subscriptions'])) {
          signedIn = runCapture('az', ['ad', 'signed-in-user', 'show', '--query', 'userPrincipalName', '-o', 'tsv']);
        }
      }

      if (signedIn.ok) {
        console.log(`Signed in to Entra ID as: ${signedIn.stdout}`);

        const existingAppsRes = runCapture('az', [
          'ad',
          'app',
          'list',
          '--display-name',
          APP_DISPLAY_NAME,
          '--query',
          '[].{appId:appId,id:id,displayName:displayName,redirectUris:web.redirectUris}',
          '-o',
          'json',
        ]);

        let appId = null;
        if (existingAppsRes.ok && existingAppsRes.stdout) {
          const apps = JSON.parse(existingAppsRes.stdout);
          if (Array.isArray(apps) && apps.length > 0) {
            const found = apps[0];
            console.log(`Found existing Entra app "${found.displayName}" (appId: ${found.appId}).`);
            const reuse = await promptYesNo(rl, 'Reuse this app and ensure both redirect URIs are set?', true);
            if (reuse) {
              appId = found.appId;
              const mergedUris = Array.from(new Set([...(found.redirectUris || []), ...redirectUris]));
              const updateRes = runCapture('az', [
                'ad',
                'app',
                'update',
                '--id',
                appId,
                '--sign-in-audience',
                'AzureADandPersonalMicrosoftAccount',
                '--web-redirect-uris',
                ...mergedUris,
              ]);
              if (!updateRes.ok) {
                console.warn(`Warning: could not update redirect URIs automatically: ${updateRes.stderr}`);
              } else {
                console.log('Updated redirect URIs on existing Entra app.');
              }
            }
          }
        }

        if (!appId) {
          console.log(`Creating Entra ID app registration "${APP_DISPLAY_NAME}"...`);
          const createRes = runCapture('az', [
            'ad',
            'app',
            'create',
            '--display-name',
            APP_DISPLAY_NAME,
            '--sign-in-audience',
            'AzureADandPersonalMicrosoftAccount',
            '--web-redirect-uris',
            ...redirectUris,
            '--query',
            'appId',
            '-o',
            'tsv',
          ]);

          if (createRes.ok && createRes.stdout) {
            appId = createRes.stdout;
            console.log(`Created Entra app (Application Client ID: ${appId}).`);
          } else {
            console.error(`Failed to create Entra app via az CLI: ${createRes.stderr}`);
          }
        }

        if (appId) {
          console.log('Generating 2-year client secret (appended without deleting existing secrets)...');
          const secretRes = runCapture('az', [
            'ad',
            'app',
            'credential',
            'reset',
            '--id',
            appId,
            '--append',
            '--display-name',
            `stillage-authjs-${new Date().toISOString().slice(0, 10)}`,
            '--years',
            '2',
            '--query',
            'password',
            '-o',
            'tsv',
          ]);

          if (secretRes.ok && secretRes.stdout) {
            updates.AUTH_MICROSOFT_ENTRA_ID_ID = appId;
            updates.AUTH_MICROSOFT_ENTRA_ID_SECRET = secretRes.stdout;
            updates.AUTH_MICROSOFT_ENTRA_ID_ISSUER = MICROSOFT_DEFAULT_ISSUER;
            console.log('Microsoft Entra ID credentials created successfully.');
            automatedOk = true;
          } else {
            console.error(`Failed to generate client secret via az CLI: ${secretRes.stderr}`);
          }
        }
      } else {
        console.warn('Skipping automated Azure CLI setup (not signed in).');
      }
    }
  } else {
    console.log('Azure CLI (`az`) not found; falling back to guided manual entry.');
  }

  if (!automatedOk) {
    console.log('\nManual Microsoft Entra setup:');
    console.log('  URL: https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade');
    console.log('  Supported account types: Any org directory + personal Microsoft accounts');
    console.log('  Web Redirect URIs:');
    for (const uri of redirectUris) console.log(`    - ${uri}`);

    const clientId = await promptText(rl, 'Paste AUTH_MICROSOFT_ENTRA_ID_ID (or press Enter to skip)', '');
    if (clientId) {
      const clientSecret = await promptText(rl, 'Paste AUTH_MICROSOFT_ENTRA_ID_SECRET (Value, not Secret ID)', '');
      if (clientSecret) {
        updates.AUTH_MICROSOFT_ENTRA_ID_ID = clientId;
        updates.AUTH_MICROSOFT_ENTRA_ID_SECRET = clientSecret;
        updates.AUTH_MICROSOFT_ENTRA_ID_ISSUER = MICROSOFT_DEFAULT_ISSUER;
      }
    }
  }
}

async function setupGoogleOAuth(rl, existingEnv, updates, opts) {
  console.log('\n── 3. Google OAuth (Guided Console Step) ───────────────────────────────');
  console.log('Note: Google does not provide a CLI API for External Web OAuth 2.0 clients.');

  const existingId = existingEnv.get('AUTH_GOOGLE_ID');
  const existingSecret = existingEnv.get('AUTH_GOOGLE_SECRET');
  if (existingId && existingSecret) {
    console.log(`Found existing Google credentials (${existingId}).`);
    const reconfigure = await promptYesNo(rl, 'Replace existing Google credentials?', false);
    if (!reconfigure) {
      updates.AUTH_GOOGLE_ID = existingId;
      updates.AUTH_GOOGLE_SECRET = existingSecret;
      return;
    }
  }

  let gcpProject = '';
  if (commandExists('gcloud')) {
    const projRes = runCapture('gcloud', ['config', 'get-value', 'project']);
    if (projRes.ok && projRes.stdout && projRes.stdout !== '(unset)') {
      gcpProject = projRes.stdout;
    }
  }

  const consoleUrl = gcpProject
    ? `https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(gcpProject)}`
    : 'https://console.cloud.google.com/apis/credentials';

  const origins = getOrigins(opts);
  console.log('\nIn Google Cloud Console → Create Credentials → OAuth client ID → Web application:');
  if (gcpProject) console.log(`  Active gcloud project: ${gcpProject}`);
  console.log(`  Name: ${APP_DISPLAY_NAME}`);
  console.log('  Authorized JavaScript origins:');
  for (const origin of origins) console.log(`    - ${origin}`);
  console.log('  Authorized redirect URIs:');
  for (const origin of origins) console.log(`    - ${origin}/api/auth/callback/google`);

  const shouldOpen = await promptYesNo(rl, `\nOpen ${consoleUrl} in your browser now?`, true);
  if (shouldOpen) {
    openBrowser(consoleUrl);
  }

  const clientId = await promptText(rl, 'Paste Google Client ID (AUTH_GOOGLE_ID, or Enter to skip)', '');
  if (!clientId) {
    console.log('Skipped Google OAuth for now.');
    return;
  }
  const clientSecret = await promptText(rl, 'Paste Google Client Secret (AUTH_GOOGLE_SECRET)', '');
  if (clientSecret) {
    updates.AUTH_GOOGLE_ID = clientId;
    updates.AUTH_GOOGLE_SECRET = clientSecret;
  } else {
    console.log('Client Secret was blank; skipped saving Google credentials.');
  }
}

async function setupFacebookOAuth(rl, existingEnv, updates, opts) {
  console.log('\n── 4. Facebook Login (Guided Console Step) ─────────────────────────────');
  const consoleUrl = 'https://developers.facebook.com/apps/';
  console.log('In Meta for Developers → Create App → Facebook Login → Settings:');
  console.log('  Valid OAuth Redirect URIs:');
  for (const origin of getOrigins(opts)) {
    console.log(`    - ${origin}/api/auth/callback/facebook`);
  }

  const shouldOpen = await promptYesNo(rl, `\nOpen ${consoleUrl} in your browser now?`, true);
  if (shouldOpen) {
    openBrowser(consoleUrl);
  }

  const appId = await promptText(rl, 'Paste Facebook App ID (AUTH_FACEBOOK_ID, or Enter to skip)', '');
  if (!appId) {
    console.log('Skipped Facebook Login.');
    return;
  }
  const appSecret = await promptText(rl, 'Paste Facebook App Secret (AUTH_FACEBOOK_SECRET)', '');
  if (appSecret) {
    updates.AUTH_FACEBOOK_ID = appId;
    updates.AUTH_FACEBOOK_SECRET = appSecret;
  }
}

async function syncNetlifyEnv(rl, updates) {
  console.log('\n── Syncing Environment Variables to Netlify ────────────────────────────');
  if (!commandExists('netlify')) {
    console.warn('Netlify CLI (`netlify`) is not installed. Skipping Netlify sync.');
    return false;
  }

  const statusRes = runCapture('netlify', ['status']);
  if (!statusRes.ok) {
    console.log('Netlify site is not linked or you are not logged in.');
    const doLogin = await promptYesNo(rl, 'Run `netlify login` / `netlify link` now?', true);
    if (!doLogin) {
      console.log('Skipped Netlify sync. Re-run this script after linking your Netlify site.');
      return false;
    }
    runInteractive('netlify', ['login']);
    const linked = runCapture('netlify', ['status']);
    if (!linked.ok) {
      runInteractive('netlify', ['link']);
    }
  }

  const entries = Object.entries(updates).filter(([, value]) => Boolean(value));
  let syncedCount = 0;
  for (const [key, value] of entries) {
    const args = ['env:set', key, value];
    if (SECRET_KEYS.has(key)) {
      args.push('--secret');
    }
    const res = runCapture('netlify', args);
    if (res.ok) {
      console.log(`  ✓ Set ${key}${SECRET_KEYS.has(key) ? ' (secret)' : ''}`);
      syncedCount += 1;
    } else {
      console.error(`  ✗ Failed to set ${key}: ${res.stderr}`);
    }
  }

  return syncedCount === entries.length;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(`Usage: node scripts/setup-auth.mjs [options]

Options:
  --local-only       Only update .env.local (do not push to Netlify)
  --skip-google      Skip Google OAuth setup
  --skip-microsoft   Skip Microsoft Entra ID setup
  --facebook         Also prompt for Facebook Login credentials
  --domain <url>       Production origin (default: ${DEFAULT_PROD_ORIGIN})
  --netlify-url <url>  Netlify URL origin (default: ${DEFAULT_NETLIFY_ORIGIN})
  --local-url <url>    Local dev origin (default: ${DEFAULT_LOCAL_ORIGIN})
  -h, --help           Show this help message`);
    return;
  }

  const existingContent = fs.existsSync(ENV_LOCAL_PATH) ? fs.readFileSync(ENV_LOCAL_PATH, 'utf8') : '';
  const existingEnv = parseEnvFile(existingContent);
  const updates = {};

  console.log('========================================================================');
  console.log(' Stillage Storage Solutions — Auth.js v5 Social Login Setup');
  console.log('========================================================================');
  console.log(`Local origin:      ${opts.localOrigin}`);
  console.log(`Netlify origin:    ${opts.netlifyOrigin}`);
  console.log(`Production origin: ${opts.prodOrigin}`);
  console.log(`Target:            .env.local${opts.localOnly ? '' : ' + Netlify env vars'}`);

  const rl = createInterface({ input, output });
  try {
    await setupCoreAuth(rl, existingEnv, updates);
    if (opts.microsoft) {
      await setupMicrosoftEntra(rl, existingEnv, updates, opts);
    }
    if (opts.google) {
      await setupGoogleOAuth(rl, existingEnv, updates, opts);
    }
    if (opts.facebook) {
      await setupFacebookOAuth(rl, existingEnv, updates, opts);
    }

    console.log('\n── Writing .env.local ──────────────────────────────────────────────────');
    upsertEnvFile(ENV_LOCAL_PATH, updates);
    console.log(`Updated ${ENV_LOCAL_PATH}:`);
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        console.log(`  ${key}=${maskValue(key, value)}`);
      }
    }

    if (!opts.localOnly) {
      const pushNow = await promptYesNo(
        rl,
        '\nPush these environment variables to Netlify now?',
        true
      );
      if (pushNow) {
        await syncNetlifyEnv(rl, updates);
      }
    }

    console.log('\n── Next Steps ──────────────────────────────────────────────────────────');
    console.log('1. Restart your local dev server (`npm run dev`) and visit /login.');
    if (!opts.localOnly) {
      console.log('2. Trigger a new Netlify deploy so production picks up the updated env vars.');
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('\nSetup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
