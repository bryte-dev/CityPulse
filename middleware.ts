import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const password = process.env.PRESENTATION_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Allowlist paths that shouldn't be protected
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/presentation-login') ||
    pathname.startsWith('/api/presentation') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // For Edge runtime we avoid Node-only modules. Auth cookie is a simple flag set by the auth route.
  const cookie = request.cookies.get('presentation_token')?.value || '';
  if (cookie === 'presentation_ok') return NextResponse.next();

  // redirect to login page
  const url = request.nextUrl.clone();
  url.pathname = '/presentation-login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/((?!_next|api|favicon|presentation-login|api/presentation).*)',
};
