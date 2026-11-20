import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import {
  DEFAULT_ADMIN_EMAILS,
  SEEDED_TEST_CUSTOMER_EMAIL,
  normalizeEmail,
  resolveUserRole,
  type UserRole,
} from './lib/roles';

const providers: NextAuthConfig['providers'] = [];

if (process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID?.trim() &&
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET?.trim()
) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer:
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER?.trim() ||
        'https://login.microsoftonline.com/common/v2.0',
    })
  );
}

if (process.env.AUTH_FACEBOOK_ID?.trim() && process.env.AUTH_FACEBOOK_SECRET?.trim()) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  );
}

if (process.env.NODE_ENV !== 'production') {
  const allowedDevUsers: Record<string, string> = {
    [DEFAULT_ADMIN_EMAILS[0]]: 'Tim Bowden',
    [DEFAULT_ADMIN_EMAILS[1]]: 'Plant & Robinson Admin',
    [SEEDED_TEST_CUSTOMER_EMAIL]: 'Tim (Valley Chapel)',
  };

  providers.push(
    Credentials({
      id: 'dev-login',
      name: 'Local Dev Test Account',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'production') {
          return null;
        }
        const email = normalizeEmail(
          typeof credentials?.email === 'string' ? credentials.email : null
        );
        const name = allowedDevUsers[email];
        if (!name) {
          return null;
        }
        return {
          id: email,
          email,
          name,
          role: resolveUserRole(email),
        };
      },
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  secret:
    process.env.AUTH_SECRET?.trim() ||
    (process.env.NODE_ENV !== 'production'
      ? 'dev-only-stillage-local-auth-secret-change-in-prod'
      : undefined),
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.email) {
        const normalizedEmail = normalizeEmail(user.email);
        token.email = normalizedEmail;
        token.role = resolveUserRole(normalizedEmail);
        token.provider = account?.provider || token.provider;
        token.userId = token.userId || user.id || token.sub;
      }
      token.role = resolveUserRole(typeof token.email === 'string' ? token.email : null);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || token.sub || '');
        session.user.role =
          (token.role as UserRole | undefined) || resolveUserRole(session.user?.email);
        session.user.provider =
          typeof token.provider === 'string' ? token.provider : undefined;
      }
      return session;
    },
  },
};
