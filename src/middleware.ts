// File: src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check if the request is for the cart page and has the 'cart_link_id' parameter
  if (pathname === '/cart' && searchParams.has('cart_link_id')) {
    // Create a new URL object based on the incoming request
    const url = request.nextUrl.clone();
    
    // Change the pathname to our dedicated reorder page
    url.pathname = '/reorder';
    
    // The search params from the original URL (like cart_link_id) are preserved by default when cloning.
    // We are simply rewriting the request to be handled by the /reorder page component.
    // The user's browser URL will remain .../cart?cart_link_id=...
    return NextResponse.rewrite(url);
  }

  // Allow all other requests to proceed as normal
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: '/cart',
};
