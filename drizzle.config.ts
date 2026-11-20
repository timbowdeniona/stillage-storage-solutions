import { defineConfig } from 'drizzle-kit';

const connectionUrl = process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: 'db/migrations',
  ...(connectionUrl ? { dbCredentials: { url: connectionUrl } } : {}),
});
