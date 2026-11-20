import NextAuth, { type Session } from 'next-auth';
import { authConfig } from '@/auth.config';
import { upsertUserOnSignIn } from '@/lib/repository';
import { normalizeEmail, resolveUserRole } from '@/lib/roles';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const baseToken = authConfig.callbacks?.jwt
        ? await authConfig.callbacks.jwt(params)
        : params.token;
      if (!baseToken) {
        return null;
      }

      const { user, account } = params;
      if (user?.email) {
        const normalizedEmail = normalizeEmail(user.email);
        const role = resolveUserRole(normalizedEmail);
        const provider =
          account?.provider ??
          (typeof baseToken.provider === 'string' ? baseToken.provider : null);

        try {
          const dbUser = await upsertUserOnSignIn({
            email: normalizedEmail,
            name: user.name ?? null,
            image: user.image ?? null,
            role,
            provider,
          });
          baseToken.userId = String(dbUser.id);
          baseToken.role = resolveUserRole(dbUser.email);
        } catch (err) {
          console.warn(
            '[auth] Failed to upsert user on sign-in; continuing with JWT session:',
            err
          );
          baseToken.role = role;
        }
      }

      return baseToken;
    },
  },
});

export async function getServerSession(): Promise<Session | null> {
  return auth();
}

export async function requireSession(): Promise<Session | null> {
  const session = await auth();
  return session?.user ? session : null;
}

export async function requireAdminSession(): Promise<Session | null> {
  const session = await auth();
  return session?.user?.role === 'admin' ? session : null;
}
