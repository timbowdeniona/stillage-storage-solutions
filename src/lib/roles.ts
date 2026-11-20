export type UserRole = 'admin' | 'customer';

export const DEFAULT_ADMIN_EMAILS = [
  'timdbowden@gmail.com',
  'admin@plantandrobinson.com',
] as const;

export const SEEDED_TEST_CUSTOMER_EMAIL = 'tim@valleychapel.co.uk';

export function normalizeEmail(email?: string | null): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function getAdminEmails(envValue?: string): string[] {
  const source =
    envValue !== undefined
      ? envValue
      : typeof process !== 'undefined'
        ? process.env?.ADMIN_EMAILS
        : undefined;

  const parsed = (source ?? '')
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : [...DEFAULT_ADMIN_EMAILS];
}

export function resolveUserRole(email?: string | null, envValue?: string): UserRole {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return 'customer';
  }
  return getAdminEmails(envValue).includes(normalized) ? 'admin' : 'customer';
}

export function isAdminEmail(email?: string | null, envValue?: string): boolean {
  return resolveUserRole(email, envValue) === 'admin';
}

export interface ConfiguredOAuthProviders {
  google: boolean;
  microsoft: boolean;
  facebook: boolean;
  devAuthEnabled: boolean;
}

export function getConfiguredOAuthProviders(): ConfiguredOAuthProviders {
  const env = typeof process !== 'undefined' ? process.env : undefined;
  return {
    google: Boolean(env?.AUTH_GOOGLE_ID?.trim() && env?.AUTH_GOOGLE_SECRET?.trim()),
    microsoft: Boolean(
      env?.AUTH_MICROSOFT_ENTRA_ID_ID?.trim() && env?.AUTH_MICROSOFT_ENTRA_ID_SECRET?.trim()
    ),
    facebook: Boolean(env?.AUTH_FACEBOOK_ID?.trim() && env?.AUTH_FACEBOOK_SECRET?.trim()),
    devAuthEnabled: env?.NODE_ENV !== 'production',
  };
}
