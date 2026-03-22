// writers-room/app/components/ApprovalGate.jsx
// Shows pending screen if writer is not yet approved
// Shows the profile form if they are approved

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WriterProfileForm from './WriterProfileForm'

const GOLD = '#c9a84c'
const NAVY = '#1a2744'

export default function ApprovalGate({ userId }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'approved' | 'pending' | 'not_found'

  useEffect(() => {
    async function checkApproval() {
      if (!userId) {
        setStatus('pending')
        return
      }

      const { data, error } = await supabase
        .from('writers')
        .select('is_approved')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        setStatus('not_found')
        return
      }

      setStatus(data.is_approved ? 'approved' : 'pending')
    }

    checkApproval()
  }, [userId])

  if (status === 'loading') {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
      </div>
    )
  }

  if (status === 'approved') {
    return <WriterProfileForm userId={userId} />
  }

  // pending or not_found
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>✦</div>
        <h1 style={s.title}>Application Under Review</h1>
        <p style={s.body}>
          Thank you for your interest in joining The Tiniest Library as an author.
          Your application is currently being reviewed by our team.
        </p>
        <p style={s.body}>
          Once approved, you'll be able to create your author profile and it will
          appear in The Reading Room for your readers and fans.
        </p>
        <div style={s.divider} />
        <p style={s.hint}>
          Questions? Reach out to us at{' '}
          <a href="mailto:hello@the-tiniest-library.com" style={s.link}>
            hello@the-tiniest-library.com
          </a>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8f7f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    padding: '56px 40px',
    background: '#fff',
    border: '1px solid #e8e4dc',
  },
  icon: {
    fontSize: '28px',
    color: GOLD,
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '300',
    color: NAVY,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    margin: '0 0 20px',
    letterSpacing: '-0.3px',
  },
  body: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.7',
    margin: '0 0 16px',
  },
  divider: {
    height: '1px',
    background: '#e8e4dc',
    margin: '28px 0',
  },
  hint: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  link: {
    color: GOLD,
    textDecoration: 'none',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '2px solid #e8e4dc',
    borderTop: `2px solid ${GOLD}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
