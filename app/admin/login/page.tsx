// writers-room/app/admin/login/page.tsx
// Admin login page — signs in with Supabase magic link

'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const GOLD = '#c9a84c'
const NAVY = '#1a2744'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/writers`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.icon}>✦</div>
          <h1 style={s.title}>Check your email</h1>
          <p style={s.body}>
            We sent a magic link to <strong style={{ color: GOLD }}>{email}</strong>.
            Click it to access the admin panel.
          </p>
          <button style={s.resetBtn} onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>✦</div>
        <p style={s.eyebrow}>The Tiniest Library</p>
        <h1 style={s.title}>Admin Access</h1>
        <p style={s.body}>
          Enter your admin email to receive a magic link.
        </p>

        <form onSubmit={handleLogin} style={s.form}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={s.input}
          />
          {error && <p style={s.error}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...s.btn, opacity: 0.6 } : s.btn}
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0a1628',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    padding: '56px 40px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(212,175,55,0.2)',
  },
  icon: {
    fontSize: '28px',
    color: GOLD,
    marginBottom: '20px',
    display: 'block',
  },
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: GOLD,
    margin: '0 0 12px',
    fontWeight: '500',
  },
  title: {
    fontSize: '28px',
    fontWeight: 300,
    color: '#f0ece0',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    margin: '0 0 16px',
  },
  body: {
    fontSize: '14px',
    color: 'rgba(232,228,217,0.6)',
    lineHeight: 1.6,
    margin: '0 0 32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0ece0',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  btn: {
    padding: '12px 24px',
    background: GOLD,
    border: 'none',
    color: NAVY,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  error: {
    fontSize: '13px',
    color: '#f87171',
    margin: 0,
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(232,228,217,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '16px',
    fontFamily: "'Inter', sans-serif",
  },
}
