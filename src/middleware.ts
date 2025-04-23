import { type NextRequest } from 'next/server'
import { updateSession } from './services/Auth/middleware'
// import { supabase } from './lib/supabaseClient';

export async function middleware(request: NextRequest) {
  // console.log('Middleware - Path:', request.nextUrl.pathname);
  // const supabaseResponse = await updateSession(request); //eslint-disable-line
  // const { data: { user } } = await supabase.auth.getUser();
  // console.log('Middleware - User:', user);
  console.log("Middleware - Path:", request.nextUrl.pathname);
  console.log("Middleware - Method:", request.method);
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/',
    '/account',
    '/admin',
    '/doctors/doctor-schedule',
    '/doctors/profile',
    '/appointments',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}