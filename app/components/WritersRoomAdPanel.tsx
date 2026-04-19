'use client'
import { useState, useEffect } from 'react'

const ADS = [
  {
    eyebrow: 'FEATURED SPONSOR',
    headline: 'Scrivener',
    body: 'The writing app built for long-form fiction. Used by novelists, screenwriters and academics worldwide.',
    cta: 'Try Free →',
    href: 'https://www.literatureandlatte.com/scrivener',
    accent: '#C9A84C',
  },
  {
    eyebrow: 'FEATURED SPONSOR',
    headline: 'Your Brand Here',
    body: 'Reach hundreds of independent writers. Premium placement on The Writer\'s Room at The Tiniest Library.',
    cta: 'Advertise With Us →',
    href: 'mailto:hello@the-tiniest-library.com?subject=Writers Room Sponsorship',
    accent: '#C9A84C',
  },
  {
    eyebrow: 'THE READING ROOM',
    headline: 'Your Readers\nAre Waiting',
    body: 'Once approved your stories go live in The Reading Room instantly. 24 genres. Real readers.',
    cta: 'Visit The Reading Room →',
    href: 'https://read.the-tiniest-library.com/reading-room',
    accent: '#6495ED',
  },
  {
    eyebrow: 'INK ECONOMY',
    headline: 'You Earn\nDirectly',
    body: 'Readers spend Ink to unlock your chapters. 100% of tips go straight to you. No middleman.',
    cta: 'Learn About Ink →',
    href: 'https://read.the-tiniest-library.com/reading-room/buy-ink',
    accent: '#6495ED',
  },
  {
    eyebrow: 'THE RED ROOM',
    headline: 'Write Adult\nFiction?',
    body: 'The Red Room has a shelf for you. Dark romance, erotica, taboo — all genres welcome. 18+ only.',
    cta: 'Enter The Red Room →',
    href: 'https://redroom.the-tiniest-library.com',
    accent: '#9B2335',
  },
]

const SHELF_LINES = [0, 1, 2, 3]

export default function WritersRoomAdPanel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ADS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const ad = ADS[idx]

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(167,139,250,0.03)',
      border: `1px solid ${ad.accent}33`,
      borderRadius: 16,
      padding: '36px 28px 28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: 20,
      overflow: 'hidden',
      height: '100%',
      minHeight: 480,
      transition: 'border-color 0.6s ease',
    }}>

      {/* Bookshelf horizontal lines */}
      {SHELF_LINES.map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60 + (i * 100),
          height: 1,
          background: `linear-gradient(90deg, transparent, ${ad.accent}18, rgba(100,149,237,0.08), transparent)`,
          pointerEvents: 'none',
          transition: 'background 0.6s ease',
        }} />
      ))}

      {/* Corner glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${ad.accent}14 0%, transparent 70%)`,
        pointerEvents: 'none',
        transition: 'background 0.6s ease',
      }} />

      {/* Eyebrow */}
      <span style={{
        display: 'inline-block',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.22em',
        color: ad.accent,
        border: `1px solid ${ad.accent}44`,
        borderRadius: 20,
        padding: '3px 10px',
        fontFamily: 'var(--font-inter, sans-serif)',
        alignSelf: 'flex-start',
        transition: 'all 0.6s ease',
      }}>{ad.eyebrow}</span>

      {/* Headline */}
      <div style={{
        fontSize: 28,
        fontWeight: 300,
        lineHeight: 1.15,
        color: '#f0ece2',
        fontFamily: 'var(--font-playfair, serif)',
        whiteSpace: 'pre-line',
        transition: 'all 0.3s ease',
      }}>{ad.headline}</div>

      {/* Body */}
      <p style={{
        fontSize: 13,
        lineHeight: 1.75,
        color: 'rgba(240,236,226,0.55)',
        fontFamily: 'var(--font-inter, sans-serif)',
        margin: 0,
        flex: 1,
      }}>{ad.body}</p>

      {/* Shelf line above CTA */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, ${ad.accent}44, transparent)`,
        transition: 'background 0.6s ease',
      }} />

      {/* CTA */}
      <a href={ad.href}
        target={ad.href.startsWith('http') ? '_blank' : '_self'}
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '9px 20px',
          borderRadius: 999,
          background: 'transparent',
          border: `1px solid ${ad.accent}66`,
          color: ad.accent,
          fontSize: 11,
          fontWeight: 700,
          textDecoration: 'none',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-inter, sans-serif)',
          alignSelf: 'flex-start',
          transition: 'all 0.3s ease',
        }}>{ad.cta}</a>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 5 }}>
        {ADS.map((a, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 18 : 5,
            height: 5,
            borderRadius: 3,
            background: i === idx ? ad.accent : `${ad.accent}33`,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}