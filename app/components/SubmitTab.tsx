"use client";

const GENRE_GROUPS = [
  { group: "Literary Fiction", subgenres: ["Contemporary Fiction", "Historical Fiction", "Magical Realism", "Experimental", "Satire"] },
  { group: "Genre Fiction", subgenres: ["Thriller", "Mystery", "Crime", "Horror", "Dark Fantasy"] },
  { group: "Speculative Fiction", subgenres: ["Sci-Fi", "Fantasy", "Dystopian", "Alternate History", "Solarpunk"] },
  { group: "Romance", subgenres: ["Contemporary Romance", "Historical Romance", "Paranormal Romance", "Romantic Suspense"] },
  { group: "Young Adult", subgenres: ["YA Fantasy", "YA Contemporary", "YA Sci-Fi", "YA Horror", "Coming of Age"] },
  { group: "Other", subgenres: ["Serialized Fiction", "Flash Fiction", "Poetry", "Memoir", "Essay", "LitRPG", "Webtoon Script"] },
];

const RED_ROOM_GENRES = [
  "Adult Romance", "Erotic Fiction", "Dark Romance", "BDSM Fiction",
  "Paranormal Erotica", "Historical Erotica", "Adult Horror", "Adult Thriller",
  "Adult Fantasy", "Taboo Fiction",
];

interface SubmitTabProps {
  storyTitle: string;
  storyRoom: 'reading-room' | 'red-room';
  storyGenre: string;
  storySubGenre: string;
  storyDescription: string;
  storyCover: string;
  storyFormat: 'serial' | 'standalone';
  showSubmitModal: boolean;
  submitting: boolean;
  onSetStoryTitle: (v: string) => void;
  onSetStoryRoom: (v: 'reading-room' | 'red-room') => void;
  onSetStoryGenre: (v: string) => void;
  onSetStorySubGenre: (v: string) => void;
  onSetStoryDescription: (v: string) => void;
  onSetStoryCover: (v: string) => void;
  onSetStoryFormat: (v: 'serial' | 'standalone') => void;
  onSetShowSubmitModal: (v: boolean) => void;
  onSubmitStory: () => void;
}

export default function SubmitTab({
  storyTitle, storyRoom, storyGenre, storySubGenre, storyDescription,
  storyCover, storyFormat, showSubmitModal, submitting,
  onSetStoryTitle, onSetStoryRoom, onSetStoryGenre, onSetStorySubGenre,
  onSetStoryDescription, onSetStoryCover, onSetStoryFormat,
  onSetShowSubmitModal, onSubmitStory,
}: SubmitTabProps) {

  const READING_ROOM_GENRES = GENRE_GROUPS.flatMap(g => g.subgenres);

  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Publish</span>
        <h1 className="hq-page-title">Submit Your Story</h1>
        <p className="hq-page-sub">Fill in all details below. You have full editorial control before submission.</p>
      </div>
      <button className="btn-primary" onClick={() => { onSetShowSubmitModal(true); setTimeout(() => { document.getElementById('submit-modal-overlay')?.scrollTo({ top: 0 }); }, 50); }} style={{ marginBottom: 24 }}>
        Open Full Submission Form →
      </button>
      {showSubmitModal && (
        <div id="submit-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720, padding: '48px 48px 40px', position: 'relative', fontFamily: 'var(--font-ui)', color: '#111' }}>
            <button onClick={() => onSetShowSubmitModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: 8 }}>The Tiniest Library</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: '#111', marginBottom: 6 }}>Submit Your Story</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>You keep your copyright. You keep 70–80% of every unlock. We handle the rest.</p>

            {/* Room selector */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 12 }}>Which Room?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <button onClick={() => { onSetStoryRoom('reading-room'); onSetStoryGenre(''); }} style={{ padding: '20px', borderRadius: 0, cursor: 'pointer', border: storyRoom === 'reading-room' ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: storyRoom === 'reading-room' ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: storyRoom === 'reading-room' ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 14, textAlign: 'left' as const }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>📚 The Reading Room</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>All ages. Literary fiction, sci-fi, romance, horror and more.</div>
                </button>
                <button onClick={() => { onSetStoryRoom('red-room'); onSetStoryGenre(''); }} style={{ padding: '20px', borderRadius: 0, cursor: 'pointer', border: storyRoom === 'red-room' ? '2px solid #e05555' : '1px solid #e5e7eb', background: storyRoom === 'red-room' ? 'rgba(200,68,68,0.06)' : '#f9fafb', color: storyRoom === 'red-room' ? '#e05555' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 14, textAlign: 'left' as const }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>🔴 The Red Room</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>18+ only. Adult fiction with verified age gate.</div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 8 }}>Story Title</label>
              <input style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 15, color: '#111', background: '#fafafa', outline: 'none' }}
                placeholder="Your story title" value={storyTitle} onChange={e => onSetStoryTitle(e.target.value)} />
            </div>

            {/* Genre */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 8 }}>Genre</label>
              {storyRoom === 'reading-room' ? (
                <div>
                  <select style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: '#111', background: '#fafafa', cursor: 'pointer', marginBottom: 10 }}
                    value={storyGenre} onChange={e => { onSetStoryGenre(e.target.value); onSetStorySubGenre(''); }}>
                    <option value="">Select a genre group…</option>
                    {GENRE_GROUPS.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                  </select>
                  {storyGenre && (
                    <select style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: '#111', background: '#fafafa', cursor: 'pointer' }}
                      value={storySubGenre} onChange={e => onSetStorySubGenre(e.target.value)}>
                      <option value="">Select a sub-genre…</option>
                      {GENRE_GROUPS.find(g => g.group === storyGenre)?.subgenres.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              ) : (
                <select style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: '#111', background: '#fafafa', cursor: 'pointer' }}
                  value={storyGenre} onChange={e => onSetStoryGenre(e.target.value)}>
                  <option value="">Select a genre…</option>
                  {RED_ROOM_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              )}
            </div>

            {/* Format */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 8 }}>Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['serial', 'standalone'] as const).map(f => (
                  <button key={f} onClick={() => onSetStoryFormat(f)}
                    style={{ padding: '14px', border: storyFormat === f ? '2px solid #C9A84C' : '1px solid #e5e7eb', borderRadius: 8, background: storyFormat === f ? 'rgba(201,168,76,0.06)' : '#f9fafb', cursor: 'pointer', textAlign: 'left' as const }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: storyFormat === f ? '#8a6510' : '#374151', marginBottom: 4 }}>{f === 'serial' ? '📖 Serial' : '📄 Standalone'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{f === 'serial' ? 'Multiple chapters, released over time' : 'One complete story, published all at once'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 8 }}>Description</label>
              <textarea style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: '#111', background: '#fafafa', resize: 'vertical' as const, minHeight: 120, outline: 'none' }}
                placeholder="A compelling description of your story (2-3 sentences)" value={storyDescription} onChange={e => onSetStoryDescription(e.target.value)} />
            </div>

            {/* Cover URL */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 8 }}>Cover Image URL <span style={{ fontWeight: 400, textTransform: 'none' as const }}>(optional)</span></label>
              <input style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 14, color: '#111', background: '#fafafa', outline: 'none' }}
                placeholder="https://your-image-url.com/cover.jpg" value={storyCover} onChange={e => onSetStoryCover(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => onSetShowSubmitModal(false)} style={{ padding: '12px 24px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', color: '#374151', fontFamily: 'var(--font-ui)', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={onSubmitStory} disabled={submitting || !storyTitle || !storyGenre || !storyDescription}
                style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: (!storyTitle || !storyGenre || !storyDescription) ? '#e5e7eb' : 'linear-gradient(135deg, #C9A84C, #8a6510)', color: (!storyTitle || !storyGenre || !storyDescription) ? '#9ca3af' : '#000', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, cursor: submitting || !storyTitle || !storyGenre || !storyDescription ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Submitting…' : 'Submit Story →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
