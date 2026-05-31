import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Server-side admin client — uses the service-role key.
// This key bypasses Row Level Security, so it MUST stay server-only.
// Never import this into a "use client" component.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { id, email } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing member id' }, { status: 400 })
    }

    // 1. Delete the profile row.
    const { error: profileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      return NextResponse.json({ error: `Profile delete failed: ${profileError.message}` }, { status: 500 })
    }

    // 2. Delete the auth login account (requires service-role key).
    const { error: authError } = await admin.auth.admin.deleteUser(id)

    // If the auth user doesn't exist, that's fine — profile is already gone.
    if (authError && !authError.message.toLowerCase().includes('not found')) {
      return NextResponse.json({
        error: `Profile deleted, but login removal failed: ${authError.message}`,
        partial: true,
      }, { status: 500 })
    }

    // 3. Notify admin by email (best-effort, ignore failures).
    try {
      await fetch(new URL('/api/email', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-message',
          to: 'kidwiththestickpublishingllc@gmail.com',
          name: 'TTL Admin',
          data: { message: `🗑️ Member fully deleted: ${email ?? id} (profile + login removed).` },
        }),
      })
    } catch { /* email is non-critical */ }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 500 })
  }
}