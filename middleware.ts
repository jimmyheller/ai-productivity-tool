import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
 
// Define the public routes that don't require authentication
const publicRoutes = ['/','privacy'];

// Use middleware with a custom handler function
export default clerkMiddleware(async (auth, req) => {
  // If the request is for a public route, don't enforce authentication
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // For non-public routes, check if the user is signed in
  const authObject = await auth();
  const userId = authObject.userId;
  
  // If user is not signed in, redirect to sign-in page
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If user is signed in, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/'],
};