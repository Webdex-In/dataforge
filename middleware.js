import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define CORS options
const corsOptions = {
  'Access-Control-Allow-Origin': '*', // Allow all origins
  'Access-Control-Allow-Methods': 'GET, POST', // Only allow GET and POST
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allow specific headers
};

// Define public routes for Clerk
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/va(.*)',
  '/api/v1/va(.*)',
  '/api/v3/(.*)',
]);

// Middleware function
export default clerkMiddleware(async (auth, request) => {
  const method = request.method;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsOptions });
  }

  // Reject disallowed methods
  if (!['GET', 'POST'].includes(method)) {
    return new NextResponse('Method Not Allowed', { status: 405, headers: corsOptions });
  }

  // For valid requests
  const response = NextResponse.next();

  // Set CORS headers for all responses
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check if route is public; if not, protect using Clerk
  if (!isPublicRoute(request)) {
    auth().protect();
  }

  return response;
});

// Middleware Config
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always apply for API routes
    '/(api|trpc)(.*)',
  ],
};
