"use client";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChaptersTabProps {
  stories: any[];
  chapters: any[];
  selectedStory: string;
  chapterTitle: string;
  chapterContent: string;
  chapterFree: boolean;
  chapterCost: number;
  saving: boolean;
  bulkText: string;
  onSetSelectedStory: (v: string) => void;
  onSetChapterTitle: (v: string) => void;
  onSetChapterContent: (v: string) => void;
  onSetChapterFree: (v: boolean) => void;
  onSetChapterCost: (v: number) => void;
  onSetBulkText: (v: string) => void;
  onSetChapters: (chapters: any[]) => void;
  onSaveChapter: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function ChaptersTab({
  stories, chapters, selectedStory, chapterTitle, chapterContent,
  chapterFree, chapterCost, saving, bulkText,
  onSetSelectedStory, onSetChapterTitle, onSetChapterContent,
  onSetChapterFree, onSetChapterCost, onSetBulkText,
  onSetChapters, onSaveChapter, onToast,
}: ChaptersTabProps) {

  const storyChapters = chapters.filter(c => c.story_id === selectedStory)
    .sort((a, b) => a.chapter_number - b.chapter_number);

  const handleBulkImport = async () => {
    if (!selectedStory || !bulkText.trim()) return;
    const sections = bulkText.split(/\n#{1,3}\s+/).filter(Boolean);
    let added = 0;
    const nextNum = storyChapters.length + 1;
    for (let i = 0; i < sections.length; i++) {
      const lines = sections[i].split('\n');
      const title = lines[0].trim() || `Chapter ${nextNum + i}`;
      const content = lines.slice(1).join('\n').trim();
      if (!content) continue;
      const { data } = await supabase.from('chapters').insert({
        story_id: selectedStory,
        chapter_number: nextNum + i,
        title,
        content,
        is_free: i === 0,
        ink_cost: i === 0 ? 0 : 25,
      }).select().single();
      if (data) { onSetChapters([...chapters, data]); added++; }
    }
    onSetBulkText('');
    onToast(`${added} chapter${added !== 1 ? 's' : ''} imported!`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    await supabase.from('chapters').delete().eq('id', id);
    onSetChapters(chapters.filter(c => c.id !== id));
    onToast('Chapter deleted.');
  };

  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Content</span>
        <h1 className="hq-page-title">My Chapters</h1>
        <p className="hq-page-sub">Add, edit, and manage chapters for your stories.</p>
      </div>

      {stories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📖</span>
          <div className="empty-title">No stories yet</div>
          <p className="empty-sub">Submit a story first before adding chapters.</p>
        </div>
      ) : (
        <>
          <div className="editor-field" style={{ marginBottom: 24 }}>
            <label className="editor-label">Select Story</label>
            <select className="editor-input" value={selectedStory} onChange={e => onSetSelectedStory(e.target.value)}>
              <option value="">— Choose a story —</option>
              {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          {selectedStory && (
            <>
              {/* Chapter list */}
              {storyChapters.length > 0 && (
                <div className="hq-section" style={{ marginBottom: 32 }}>
                  <div className="hq-section-header"><h2 className="hq-section-title">Published Chapters</h2></div>
                  <div className="hq-table-wrap">
                    <table className="hq-table">
                      <thead><tr><th>#</th><th>Title</th><th>Access</th><th>Cost</th><th></th></tr></thead>
                      <tbody>
                        {storyChapters.map(ch => (
                          <tr key={ch.id}>
                            <td className="dim">{ch.chapter_number}</td>
                            <td className="primary">{ch.title}</td>
                            <td><span className={`badge ${ch.is_free ? 'badge-free' : 'badge-locked'}`}>{ch.is_free ? 'Free' : 'Ink'}</span></td>
                            <td>{ch.is_free ? '—' : `${ch.ink_cost} Ink`}</td>
                            <td><button onClick={() => handleDelete(ch.id)} style={{ fontSize: 10, color: 'var(--red)', background: 'none', border: '1px solid var(--red-dim)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add chapter */}
              <div style={{ background: 'var(--ink2)', border: '1px solid var(--border-gold)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>Add New Chapter</div>
                <div className="editor-field">
                  <label className="editor-label">Chapter Title</label>
                  <input className="editor-input" placeholder="e.g. The Beginning" value={chapterTitle} onChange={e => onSetChapterTitle(e.target.value)} />
                </div>
                <div className="editor-field">
                  <label className="editor-label">Content</label>
                  <textarea className="editor-textarea" style={{ minHeight: 300 }} placeholder="Paste your chapter content here…" value={chapterContent} onChange={e => onSetChapterContent(e.target.value)} />
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>{chapterContent.length.toLocaleString()} characters</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div className="editor-field">
                    <label className="editor-label">Access</label>
                    <select className="editor-input" value={chapterFree ? 'free' : 'ink'} onChange={e => onSetChapterFree(e.target.value === 'free')}>
                      <option value="free">Free — anyone can read</option>
                      <option value="ink">Ink — readers pay to unlock</option>
                    </select>
                  </div>
                  {!chapterFree && (
                    <div className="editor-field">
                      <label className="editor-label">Ink Cost</label>
                      <input className="editor-input" type="number" min={1} max={500} value={chapterCost} onChange={e => onSetChapterCost(Number(e.target.value))} />
                    </div>
                  )}
                </div>
                <button className="btn-primary" disabled={saving || !chapterTitle || !chapterContent} onClick={onSaveChapter}>
                  {saving ? 'Saving…' : `Add Chapter ${storyChapters.length + 1} →`}
                </button>
              </div>

              {/* Bulk import */}
              <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 8 }}>Bulk Import</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Paste your full manuscript. Chapters are split by headings (# Chapter 1, ## Part Two, etc).</p>
                <textarea className="editor-textarea" style={{ minHeight: 200 }} placeholder="Paste your full manuscript here…" value={bulkText} onChange={e => onSetBulkText(e.target.value)} />
                <button className="btn-ghost" style={{ marginTop: 12 }} disabled={!bulkText.trim()} onClick={handleBulkImport}>
                  Import Chapters →
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
