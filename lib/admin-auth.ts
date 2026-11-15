/**
 * lib/admin-auth.ts — the-writers-room
 * ─────────────────────────────────────────────────────────────────
 * Gate for every admin-only API route.
 *
 * The admin panel sends the signed-in user's access token as
 *   Authorization: Bearer <token>
 * This checks the token is real, then asks the database's own
 * is_admin() function (the same one the storage policies use)
 * whether that user is an admin. Anything else is turned away
 * before the service-role key is touched.
 *
 * Usage at the top of a route:
 *   const gate = await requireAdmin(req)
 *   if (gate instanceof NextResponse) return gate
 *   // gate.userId is the admin making the request
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function requireAdmin(req: Request): Promise<{ userId: string } | NextResponse> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  // A client that acts as the caller, not as the service role.
  const asCaller = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: { user }, error: userError } = await asCaller.auth.getUser(token)
  if (userError || !user) {
    return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 })
  }

  const { data: isAdmin, error: adminError } = await asCaller.rpc('is_admin')
  if (adminError || isAdmin !== true) {
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  }

  return { userId: user.id }
}