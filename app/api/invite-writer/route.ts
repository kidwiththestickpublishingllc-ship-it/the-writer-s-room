import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { email, name } = await req.json()
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://write.the-tiniest-library.com/dashboard',
      data: { full_name: name }
    })
    if (error && error.message !== 'User already registered') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get the user's auth ID
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = users.find(u => u.email === email)

    // Create writer record with service role (bypasses RLS)
    await supabaseAdmin.from('writers').upsert({
      name,
      email,
      user_id: authUser?.id ?? null,
      is_approved: true,
      is_founding_author: false,
      tier: 'tier1',
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      tagline: 'A writer at The Tiniest Library.',
      bio: 'This author is setting up their profile. Check back soon.',
      genres: [],
    }, { onConflict: 'email' })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}