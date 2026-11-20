import { NextResponse, type NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const NOINDEX_HEADER_VALUE = 'noindex, nofollow, noarchive';

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isProtectedPath(pathname: string): boolean {
  return (
    matchesPrefix(pathname, '/account') ||
    matchesPrefix(pathname, '/admin') ||
    matchesPrefix(pathname, '/analytics-report') ||
    matchesPrefix(pathname, '/api/account') ||
    matchesPrefix(pathname, '/api/admin')
  );
}

function isNetlifyOrStagingHost(req: NextRequest): boolean {
  if (process.env.SITE_NOINDEX === 'true') {
    return true;
  }
  const rawHost =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.hostname ||
    '';
  const hostname = rawHost.split(',')[0].trim().split(':')[0].toLowerCase();
  return hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.live');
}

const protectedAuthMiddleware = auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;
  const callbackPath = `${pathname}${search}`;

  if (matchesPrefix(pathname, '/api/admin')) {
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, '/api/account')) {
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, '/admin') || matchesPrefix(pathname, '/analytics-report')) {
    if (!session?.user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      loginUrl.searchParams.set('callbackUrl', callbackPath);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== 'admin') {
      const accountUrl = req.nextUrl.clone();
      accountUrl.pathname = '/account';
      accountUrl.search = '';
      accountUrl.searchParams.set('notice', 'admin_required');
      return NextResponse.redirect(accountUrl);
    }
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, '/account')) {
    if (!session?.user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      loginUrl.searchParams.set('callbackUrl', callbackPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest, event: any) {
  const { pathname } = req.nextUrl;
  const shield = isNetlifyOrStagingHost(req);

  if (isProtectedPath(pathname)) {
    const response = (await (protectedAuthMiddleware as any)(req, event)) || NextResponse.next();
    response.headers.set('X-Robots-Tag', NOINDEX_HEADER_VALUE);
    return response;
  }

  const response = NextResponse.next();
  if (shield) {
    response.headers.set('X-Robots-Tag', NOINDEX_HEADER_VALUE);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.svg|images/).*)'],
};
