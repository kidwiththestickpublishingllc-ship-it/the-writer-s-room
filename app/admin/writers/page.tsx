// writers-room/app/admin/writers/page.tsx
// Protected admin page — only accessible to whitelisted admin emails

import { createSupabaseServerClient } from '@/lib/supabaseServer'
import AdminWritersClient from './AdminWritersClient'

export const revalidate = 0

export default async function AdminWritersPage() {
  const supabase = await createSupabaseServerClient()

  const { data: writers, error } = await supabase
    .from('writers')
    .select('id, name, bio, photo_url, is_approved, is_founding_author, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return <p style={{ color: 'white', padding: '40px' }}>Could not load writers.</p>
  }

  return <AdminWritersClient writers={writers} />
}
