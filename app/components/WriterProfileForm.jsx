// writers-room/app/components/WriterProfileForm.jsx
// Clean neutral form for writers to fill out their profile

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const INITIAL_STATE = {
  name: '',
  bio: '',
  greeting: '',
  twitter_url: '',
  instagram_url: '',
  website_url: '',
  published_works: [{ title: '', link: '' }],
}

export default function WriterProfileForm({ userId }) {
  const [form, setForm] = useState(INITIAL_STATE)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleField(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleWork(index, field, value) {
    setForm(prev => {
      const works = [...prev.published_works]
      works[index] = { ...works[index], [field]: value }
      return { ...prev, published_works: works }
    })
  }

  function addWork() {
    setForm(prev => ({
      ...prev,
      published_works: [...prev.published_works, { title: '', link: '' }],
    }))
  }

  function removeWork(index) {
    setForm(prev => ({
      ...prev,
      published_works: prev.published_works.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let photo_url = null

      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const filePath = `${userId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('writer-photos')
          .upload(filePath, photoFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('writer-photos')
          .getPublicUrl(filePath)

        photo_url = urlData.publicUrl
      }

      const cleanWorks = form.published_works.filter(w => w.title.trim())

      const { error: dbError } = await supabase
        .from('writers')
        .upsert(
          {
            user_id: userId,
            name: form.name,
            bio: form.bio,
            greeting: form.greeting,
            twitter_url: form.twitter_url || null,
            instagram_url: form.instagram_url || null,
            website_url: form.website_url || null,
            published_works: cleanWorks,
            ...(photo_url ? { photo_url } : {}),
          },
          { onConflict: 'user_id' }
        )

      if (dbError) throw dbError
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={s.successBanner}>
        <div style={s.successIcon}>✦</div>
        <h2 style={s.successTitle}>Your profile is live</h2>
        <p style={s.successText}>Your author profile is now visible to readers in The Reading Room.</p>
        <button style={s.editBtn} onClick={() => setSuccess(false)}>Edit profile</button>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <p style={s.headerEyebrow}>Writer's Room</p>
          <h1 style={s.headerTitle}>Your Author Profile</h1>
          <p style={s.headerSub}>
            This information will appear on your public profile in The Reading Room.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>

          {/* Photo */}
          <div style={s.photoSection}>
            <div style={s.photoPreviewWrap}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={s.photoPreview} />
              ) : (
                <div style={s.photoPlaceholder}>
                  <span style={s.photoPlaceholderIcon}>+</span>
                  <span style={s.photoPlaceholderText}>Add photo</span>
                </div>
              )}
            </div>
            <div style={s.photoInfo}>
              <p style={s.photoLabel}>Profile photo</p>
              <p style={s.photoHint}>JPG, PNG or WebP · Max 5MB · Will appear as a square</p>
              <label style={s.photoUploadBtn}>
                Choose photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div style={s.divider} />

          {/* Name */}
          <div style={s.field}>
            <label style={s.label} htmlFor="name">Full name <span style={s.required}>*</span></label>
            <input
              style={s.input}
              id="name" name="name" type="text" required
              value={form.name} onChange={handleField}
              placeholder="e.g. Amara Osei"
            />
          </div>

          {/* Greeting */}
          <div style={s.field}>
            <label style={s.label} htmlFor="greeting">Greeting to your readers</label>
            <p style={s.fieldHint}>A short, warm welcome that appears at the top of your profile.</p>
            <input
              style={s.input}
              id="greeting" name="greeting" type="text"
              value={form.greeting} onChange={handleField}
              placeholder="e.g. Hello, fellow bookworms! Thanks for stopping by."
            />
          </div>

          {/* Bio */}
          <div style={s.field}>
            <label style={s.label} htmlFor="bio">Author bio</label>
            <p style={s.fieldHint}>Tell readers about yourself — your voice, your world, your craft.</p>
            <textarea
              style={{ ...s.input, ...s.textarea }}
              id="bio" name="bio" rows={5}
              value={form.bio} onChange={handleField}
              placeholder="Tell readers a little about yourself..."
            />
          </div>

          <div style={s.divider} />

          {/* Published works */}
          <div style={s.fieldGroup}>
            <div style={s.fieldGroupHeader}>
              <label style={s.label}>Published works & achievements</label>
              <p style={s.fieldHint}>Add your books, articles, awards, or milestones.</p>
            </div>
            {form.published_works.map((work, i) => (
              <div key={i} style={s.workRow}>
                <input
                  style={{ ...s.input, flex: 2 }}
                  type="text" placeholder="Title or achievement"
                  value={work.title}
                  onChange={e => handleWork(i, 'title', e.target.value)}
                />
                <input
                  style={{ ...s.input, flex: 2 }}
                  type="url" placeholder="Link (optional)"
                  value={work.link}
                  onChange={e => handleWork(i, 'link', e.target.value)}
                />
                {form.published_works.length > 1 && (
                  <button type="button" onClick={() => removeWork(i)} style={s.removeBtn}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addWork} style={s.addBtn}>
              + Add another
            </button>
          </div>

          <div style={s.divider} />

          {/* Social links */}
          <div style={s.fieldGroup}>
            <div style={s.fieldGroupHeader}>
              <label style={s.label}>Social links</label>
              <p style={s.fieldHint}>Connect your readers to your other channels.</p>
            </div>
            <div style={s.field}>
              <label style={s.subLabel} htmlFor="twitter_url">X / Twitter</label>
              <input style={s.input} id="twitter_url" name="twitter_url" type="url"
                value={form.twitter_url} onChange={handleField}
                placeholder="https://twitter.com/yourhandle" />
            </div>
            <div style={s.field}>
              <label style={s.subLabel} htmlFor="instagram_url">Instagram</label>
              <input style={s.input} id="instagram_url" name="instagram_url" type="url"
                value={form.instagram_url} onChange={handleField}
                placeholder="https://instagram.com/yourhandle" />
            </div>
            <div style={s.field}>
              <label style={s.subLabel} htmlFor="website_url">Personal website</label>
              <input style={s.input} id="website_url" name="website_url" type="url"
                value={form.website_url} onChange={handleField}
                placeholder="https://yoursite.com" />
            </div>
          </div>

          {error && <p style={s.errorMsg}>{error}</p>}

          <div style={s.submitRow}>
            <button type="submit" disabled={loading} style={loading ? { ...s.submitBtn, opacity: 0.6 } : s.submitBtn}>
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
const GOLD = '#c9a84c'
const NAVY = '#1a2744'

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8f7f4',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '0 24px 80px',
  },
  header: {
    padding: '60px 0 40px',
    borderBottom: '1px solid #e8e4dc',
    marginBottom: '40px',
  },
  headerEyebrow: {
    fontSize: '11px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: GOLD,
    fontWeight: '500',
    margin: '0 0 12px',
  },
  headerTitle: {
    fontSize: '36px',
    fontWeight: '300',
    color: NAVY,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    margin: '0 0 12px',
    letterSpacing: '-0.3px',
  },
  headerSub: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  photoSection: {
    display: 'flex',
    gap: '28px',
    alignItems: 'center',
    marginBottom: '32px',
  },
  photoPreviewWrap: {
    flexShrink: 0,
    width: '100px',
    height: '100px',
    background: '#eee',
    overflow: 'hidden',
    border: '1px solid #e0dbd0',
  },
  photoPreview: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: '100px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0ede6',
    cursor: 'pointer',
    gap: '4px',
  },
  photoPlaceholderIcon: {
    fontSize: '24px',
    color: '#b0a898',
    lineHeight: 1,
  },
  photoPlaceholderText: {
    fontSize: '11px',
    color: '#b0a898',
    letterSpacing: '0.5px',
  },
  photoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  photoLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: NAVY,
    margin: 0,
  },
  photoHint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  photoUploadBtn: {
    display: 'inline-block',
    padding: '7px 16px',
    fontSize: '12px',
    fontWeight: '500',
    color: NAVY,
    border: `1px solid ${NAVY}`,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    marginTop: '4px',
    width: 'fit-content',
  },
  divider: {
    height: '1px',
    background: '#e8e4dc',
    margin: '32px 0',
  },
  field: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldGroup: {
    marginBottom: '8px',
  },
  fieldGroupHeader: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: NAVY,
    letterSpacing: '0.2px',
  },
  subLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: '0.2px',
  },
  fieldHint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    lineHeight: 1.5,
  },
  required: {
    color: GOLD,
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1f2937',
    background: '#fff',
    border: '1px solid #e0dbd0',
    outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 0,
  },
  textarea: {
    resize: 'vertical',
    lineHeight: '1.7',
    minHeight: '120px',
  },
  workRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  removeBtn: {
    background: 'none',
    border: '1px solid #e0dbd0',
    color: '#9ca3af',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '12px',
  },
  addBtn: {
    background: 'none',
    border: 'none',
    color: GOLD,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 0',
    letterSpacing: '0.3px',
  },
  errorMsg: {
    color: '#dc2626',
    fontSize: '13px',
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    margin: '16px 0 0',
  },
  submitRow: {
    marginTop: '40px',
  },
  submitBtn: {
    padding: '14px 40px',
    background: NAVY,
    color: '#fff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  successBanner: {
    minHeight: '100vh',
    background: '#f8f7f4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    padding: '40px',
  },
  successIcon: {
    fontSize: '32px',
    color: GOLD,
  },
  successTitle: {
    fontSize: '32px',
    fontWeight: '300',
    color: NAVY,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    margin: 0,
  },
  successText: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    maxWidth: '360px',
    lineHeight: 1.6,
  },
  editBtn: {
    marginTop: '8px',
    padding: '10px 28px',
    background: 'none',
    border: `1px solid ${NAVY}`,
    color: NAVY,
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
}
