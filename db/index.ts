import { drizzle as drizzleNetlify } from 'drizzle-orm/netlify-db';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type AppDatabase = NodePgDatabase<typeof schema>;
export { schema };

const globalForDb = globalThis as unknown as {
  __sssDb?: AppDatabase;
  __sssPgPool?: Pool;
  __sssDbUrl?: string;
  __sssDbInitWarned?: boolean;
};

function warnDbInitOnce(message: string, err: unknown): void {
  if (globalForDb.__sssDbInitWarned) return;
  globalForDb.__sssDbInitWarned = true;
  console.warn(`[db] ${message}:`, err instanceof Error ? err.message : err);
}

/**
 * Returns a typed Drizzle Postgres database instance when NETLIFY_DB_URL or
 * DATABASE_URL is configured, or null when running offline / during build / tests.
 */
export function getDb(): AppDatabase | null {
  const netlifyDbUrl = process.env.NETLIFY_DB_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (netlifyDbUrl) {
    if (globalForDb.__sssDb && globalForDb.__sssDbUrl === netlifyDbUrl) {
      return globalForDb.__sssDb;
    }

    try {
      // drizzle-orm/netlify-db returns a union (NetlifyDbDatabase | NodePgDatabase) in beta.22;
      // normalize to a single NodePgDatabase<typeof schema> type for clean downstream queries.
      const db = drizzleNetlify({ schema }) as unknown as AppDatabase;
      globalForDb.__sssDb = db;
      globalForDb.__sssDbUrl = netlifyDbUrl;
      return db;
    } catch (err) {
      warnDbInitOnce('Failed to initialize Netlify Database client; using in-memory fallback', err);
      return null;
    }
  }

  if (databaseUrl) {
    if (globalForDb.__sssDb && globalForDb.__sssDbUrl === databaseUrl) {
      return globalForDb.__sssDb;
    }

    try {
      const pool =
        globalForDb.__sssPgPool && globalForDb.__sssDbUrl === databaseUrl
          ? globalForDb.__sssPgPool
          : new Pool({ connectionString: databaseUrl });
      const db = drizzlePg({ client: pool, schema });
      globalForDb.__sssPgPool = pool;
      globalForDb.__sssDb = db;
      globalForDb.__sssDbUrl = databaseUrl;
      return db;
    } catch (err) {
      warnDbInitOnce('Failed to initialize node-postgres client; using in-memory fallback', err);
      return null;
    }
  }

  return null;
}
