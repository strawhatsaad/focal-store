// File: src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check if the request is for the cart page and has the 'cart_link_id' parameter
  if (pathname === '/cart' && searchParams.has('cart_link_id')) {
    // Clone the URL to preserve the search parameters
    const url = request.nextUrl.clone();
    
    // Rewrite the path to our dedicated reorder page.
    // The user's URL in the browser will not change, but Next.js will serve the /reorder page component.
    url.pathname = '/reorder';
    
    return NextResponse.rewrite(url);
  }

  // Allow all other requests to proceed as normal
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: '/cart',
};