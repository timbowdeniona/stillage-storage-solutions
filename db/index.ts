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
 * Returns a typed Drizzle Postgres database instance when DATABASE_URL or
 * NETLIFY_DB_URL is configured, or null when running offline / during build / tests.
 */
export function getDb(): AppDatabase | null {
  const connectionUrl = (process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || '').trim();

  if (!connectionUrl) {
    return null;
  }

  if (globalForDb.__sssDb && globalForDb.__sssDbUrl === connectionUrl) {
    return globalForDb.__sssDb;
  }

  try {
    const pool =
      globalForDb.__sssPgPool && globalForDb.__sssDbUrl === connectionUrl
        ? globalForDb.__sssPgPool
        : new Pool({ connectionString: connectionUrl });
    const db = drizzlePg({ client: pool, schema });
    globalForDb.__sssPgPool = pool;
    globalForDb.__sssDb = db;
    globalForDb.__sssDbUrl = connectionUrl;
    return db;
  } catch (err) {
    warnDbInitOnce('Failed to initialize Postgres client; using in-memory fallback', err);
    return null;
  }
}
