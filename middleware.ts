// writers-room/middleware.ts
// Protects /admin/* routes — redirects to login if not authenticated
// Place this file in the ROOT of the project (same level as package.json)

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow /admin/login through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Logged in but not an admin → redirect to home
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
