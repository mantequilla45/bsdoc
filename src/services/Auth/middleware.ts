// src\services\Auth\middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPages = ['/account', '/booking', '/appointments'];
const adminPages = [{
  path: '/admin', roles: ['admin']
}];
const doctorPages = [
  { path: '/doctors/doctor-schedule', roles: ['doctor'] },
  { path: '/doctors/profile', roles: ['doctor'] }
];

const protectedPaths = ['/account', '/booking', '/appointments'];
const adminPaths = ['/admin']; // Just the base path needed due to startsWith
const doctorPaths = ['/doctors/doctor-schedule', '/doctors/profile'];

// Combine all paths that require authentication
const allAuthRequiredPaths = [
  ...protectedPaths,
  ...adminPaths,
  ...doctorPaths
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          //console.log("Middleware - getAll cookies:", request.cookies.getAll());
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            //console.log("Middleware - Setting cookie:", name, value, options); // Log each cookie being set
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  //console.log("Middleware - User after supabase.auth.getUser():", user);

  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/'
  //   return NextResponse.redirect(url)
  // }

  // Get the current path
  const path = request.nextUrl.pathname

  const requiresAuth = allAuthRequiredPaths.some(p => path.startsWith(p));
  if (!user && requiresAuth) {
    // If user is not logged in AND the path requires authentication, redirect to home
    console.log(`Middleware: No user, redirecting from protected path: ${path}`);
    const url = request.nextUrl.clone();
    url.pathname = '/'; // Redirect to home page (or login page)
    return NextResponse.redirect(url);
  }

  // Check if the path is a protected route and the user is not authenticated
  const isProtectedRoute = protectedPages.some(route => path.startsWith(route))
  //const adminOnly = adminPages.some(route => path.startsWith(route));

  // Allow public routes
  //const isPublicRoute = path === '/' || path.startsWith('/auth')

  if (user) {
    // Find if this route has role restrictions
    const adminOnly = adminPages.find(route => path.startsWith(route.path))

    if (adminOnly) {
      console.log("Middleware - Checking admin route:", adminOnly.path);
      // Get user role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // If we have a profile and the role isn't in the allowed roles, redirect
      if (!profile || !adminOnly.roles.includes(profile.role)) {
        // Redirect to unauthorized page or homepage
        const url = request.nextUrl.clone()
        url.pathname = '/' // Create this page or redirect elsewhere
        return NextResponse.redirect(url)
      }
    }

    const doctorOnly = doctorPages.find(route => request.nextUrl.pathname.startsWith(route.path))

    if (doctorOnly) {
      console.log("Middleware - Checking doctor route:", doctorOnly.path);
      // Get user role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // If we have a profile and the role isn't in the allowed roles, redirect
      if (!profile || !doctorOnly.roles.includes(profile.role)) {
        // Redirect to unauthorized page or homepage
        const url = request.nextUrl.clone()
        url.pathname = '/' // Create this page or redirect elsewhere
        return NextResponse.redirect(url)
      }
    }
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}