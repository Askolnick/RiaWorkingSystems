import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

    if (isAuthPage) {
      if (isAuth) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL('/', req.url));
      }
      return null;
    }

    if (!isAuth) {
      // Redirect unauthenticated users to sign in
      const from = req.nextUrl.pathname + req.nextUrl.search;
      return NextResponse.redirect(
        new URL(`/auth/sign-in?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Check role-based access
    const userRoles = token.roles || [];
    
    // Admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!userRoles.includes('admin')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Add more role-based route protection as needed
    
    return null;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // This callback runs for every request
        // Return true to allow access, false to redirect to sign-in
        
        // Allow access to auth pages and API routes without authentication
        if (
          req.nextUrl.pathname.startsWith('/auth') ||
          req.nextUrl.pathname.startsWith('/api/auth') ||
          req.nextUrl.pathname === '/_next' ||
          req.nextUrl.pathname.startsWith('/_next/') ||
          req.nextUrl.pathname.startsWith('/favicon')
        ) {
          return true;
        }

        // For all other pages, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, robots.txt, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
};