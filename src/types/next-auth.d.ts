import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/lib/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      provider?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: UserRole;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userId?: string;
    role?: UserRole;
    provider?: string;
  }
}
