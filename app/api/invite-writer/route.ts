import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { email, name } = await req.json()

    // Generate secure temp password
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase() +
                        Math.random().toString(36).slice(-8) +
                        Math.floor(Math.random() * 90 + 10)

    // Find existing auth user
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = users.find(u => u.email === email)

    let uid: string

    if (!authUser) {
      const { data: created, error: ce } = await supabaseAdmin.auth.admin.createUser({
        email, password: tempPassword, email_confirm: true
      })
      if (ce) return NextResponse.json({ error: ce.message }, { status: 500 })
      uid = created.user.id
    } else {
      uid = authUser.id
      await supabaseAdmin.auth.admin.updateUserById(uid, {
        email_confirm: true, password: tempPassword
      })
    }

    // Check if writer record already exists
    const { data: existing } = await supabaseAdmin
      .from('writers')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle()

    if (!existing) {
      const { error: insertError } = await supabaseAdmin.from('writers').insert({
        name,
        email,
        user_id: uid,
        is_approved: true,
        is_founding_author: false,
        tier: 'tier1',
        first_login: true,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        tagline: 'A writer at The Tiniest Library.',
        bio: 'This author is setting up their profile. Check back soon.',
        genres: [],
      })
      if (insertError) {
        console.error('Writer insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      await supabaseAdmin.from('profiles').upsert({
        id: uid,
        email,
        full_name: name,
        is_writer: true,
        membership_tier: 'free',
        ink_balance: 50,
        role: 'writer',
      }, { onConflict: 'id' })
    } else {
      await supabaseAdmin.from('writers')
        .update({ is_approved: true, tier: 'tier1', first_login: true })
        .eq('id', existing.id)
    }

    return NextResponse.json({ success: true, tempPassword })
  } catch (err: any) {
    console.error('invite-writer error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}