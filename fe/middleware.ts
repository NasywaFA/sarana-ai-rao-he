import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const projectName = process.env.PROJECT_NAME || 'app';
  
  // Get auth token from cookies
  const authToken = request.cookies.get(`${projectName}_auth_token`)?.value;
  const isAuthenticated = !!authToken;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  
  // Define auth routes that authenticated users shouldn't access
  const authRoutes = ['/login', '/register'];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthRoute) {
    console.log(`Redirecting authenticated user from ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 