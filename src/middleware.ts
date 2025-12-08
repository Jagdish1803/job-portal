import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /api/jobs)
  const path = request.nextUrl.pathname

  // Define protected paths
  const protectedPaths = [
    '/dashboard',
    '/job-poster-dashboard', 
    '/job-seeker-dashboard',
    '/post-job',
    '/applications',
    '/analytics',
    '/company-profile',
    '/settings',
    '/edit-job'
  ]

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  // If it's a protected path, check for authentication
  if (isProtectedPath) {
    // Check for user token in cookies
    const token = request.cookies.get('token')?.value
    const user = request.cookies.get('user')?.value

    // If no token or user data, redirect to sign-in
    if (!token || !user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    try {
      // Parse user data to check if it's valid
      const userData = JSON.parse(user)
      
      // Basic validation - user should have id and role
      if (!userData.id || !userData.role) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }

      // Role-based path protection
      if (userData.role === 'JOB_SEEKER') {
        // Job seekers can't access job poster specific pages
        const jobPosterOnlyPaths = ['/post-job', '/company-profile', '/job-poster-dashboard']
        if (jobPosterOnlyPaths.some(jobPosterPath => path.startsWith(jobPosterPath))) {
          return NextResponse.redirect(new URL('/job-seeker-dashboard', request.url))
        }
      } else if (userData.role === 'JOB_POSTER' || userData.role === 'EMPLOYER') {
        // Job posters/employers can't access job seeker specific pages
        if (path.startsWith('/job-seeker-dashboard')) {
          return NextResponse.redirect(new URL('/job-poster-dashboard', request.url))
        }
      }

    } catch (error) {
      // If user data is corrupted, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sign-in, sign-up (auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|$).*)',
  ],
}