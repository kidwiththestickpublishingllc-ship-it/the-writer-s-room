import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service-role client — bypasses RLS. Server-only.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { id, name } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing writer id' }, { status: 400 })
    }

    const { data: writerRow } = await admin
      .from('writers').select('email').eq('id', id).single()

    // Find this writer's stories.
    const { data: stories } = await admin
      .from('stories').select('id').eq('author_id', id)
    const storyIds = (stories ?? []).map((s: any) => s.id)

    let chapterCount = 0

    // 1. Chapters of those stories.
    if (storyIds.length > 0) {
      const { data: chs } = await admin
        .from('chapters').select('id').in('story_id', storyIds)
      chapterCount = (chs ?? []).length
      const { error: chErr } = await admin.from('chapters').delete().in('story_id', storyIds)
      if (chErr) return NextResponse.json({ error: `chapters: ${chErr.message}` }, { status: 500 })
    }

    // 2. Stories.
    const { error: stErr } = await admin.from('stories').delete().eq('author_id', id)
    if (stErr) return NextResponse.json({ error: `stories: ${stErr.message}` }, { status: 500 })

    // 3. Story media.
    const { error: smErr } = await admin.from('story_media').delete().eq('author_id', id)
    if (smErr) return NextResponse.json({ error: `story_media: ${smErr.message}` }, { status: 500 })

    // 4. Writer earnings.
    const { error: weErr } = await admin.from('writer_earnings').delete().eq('writer_id', id)
    if (weErr) return NextResponse.json({ error: `writer_earnings: ${weErr.message}` }, { status: 500 })

    // 5. Payouts.
    const { error: poErr } = await admin.from('payouts').delete().eq('writer_id', id)
    if (poErr) return NextResponse.json({ error: `payouts: ${poErr.message}` }, { status: 500 })

    // 6. Writer badges.
    const { error: wbErr } = await admin.from('writer_badges').delete().eq('writer_id', id)
    if (wbErr) return NextResponse.json({ error: `writer_badges: ${wbErr.message}` }, { status: 500 })

    // 7. The writer row itself — last.
    const { error: wErr } = await admin.from('writers').delete().eq('id', id)
    if (wErr) return NextResponse.json({ error: `writers: ${wErr.message}` }, { status: 500 })

    // Email a record (best-effort).
    try {
      await fetch(new URL('/api/email', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-message',
          to: 'kidwiththestickpublishingllc@gmail.com',
          name: 'TTL Admin',
          data: { message: `🗑️ Writer fully deleted: "${name}" (${writerRow?.email ?? 'no email'}). Removed ${storyIds.length} stories, ${chapterCount} chapters, plus media/earnings/payouts/badges.` },
        }),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, stories: storyIds.length, chapters: chapterCount })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 500 })
  }
}