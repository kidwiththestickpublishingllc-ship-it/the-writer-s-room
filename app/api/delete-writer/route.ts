import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Server-side admin client — service-role key bypasses RLS.
// Must stay server-only. Never import into a "use client" file.
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

    // Look up email for the record (best-effort).
    const { data: writerRow } = await admin
      .from('writers')
      .select('email')
      .eq('id', id)
      .single()

    // Find this writer's stories (author_id = writer.id).
    const { data: stories } = await admin
      .from('stories')
      .select('id')
      .eq('author_id', id)
    const storyIds = (stories ?? []).map((s: any) => s.id)

    // Delete chapters of those stories, then the stories.
    let chapterCount = 0
    if (storyIds.length > 0) {
      const { data: chs } = await admin
        .from('chapters')
        .select('id')
        .in('story_id', storyIds)
      chapterCount = (chs ?? []).length
      await admin.from('chapters').delete().in('story_id', storyIds)
      await admin.from('stories').delete().in('id', storyIds)
    }

    // Delete the writer row.
    const { error: writerError } = await admin.from('writers').delete().eq('id', id)
    if (writerError) {
      return NextResponse.json({ error: `Writer delete failed: ${writerError.message}` }, { status: 500 })
    }

    // Email a record (best-effort, non-critical).
    try {
      await fetch(new URL('/api/email', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-message',
          to: 'kidwiththestickpublishingllc@gmail.com',
          name: 'TTL Admin',
          data: { message: `🗑️ Writer deleted: "${name}" (${writerRow?.email ?? 'no email'}). Removed ${storyIds.length} story(ies) and ${chapterCount} chapter(s).` },
        }),
      })
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, stories: storyIds.length, chapters: chapterCount })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 500 })
  }
}