"use client";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MediaTabProps {
  writer: any;
  mediaItems: any[];
  mediaTitle: string;
  mediaType: string;
  mediaCaption: string;
  mediaChapterTag: string;
  mediaFile: File | null;
  mediaPreview: string;
  mediaUploading: boolean;
  onSetMediaTitle: (v: string) => void;
  onSetMediaType: (v: string) => void;
  onSetMediaCaption: (v: string) => void;
  onSetMediaChapterTag: (v: string) => void;
  onSetMediaFile: (f: File | null) => void;
  onSetMediaPreview: (v: string) => void;
  onSetMediaItems: (items: any[]) => void;
  onSetMediaUploading: (v: boolean) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function MediaTab({
  writer, mediaItems, mediaTitle, mediaType, mediaCaption,
  mediaChapterTag, mediaFile, mediaPreview, mediaUploading,
  onSetMediaTitle, onSetMediaType, onSetMediaCaption, onSetMediaChapterTag,
  onSetMediaFile, onSetMediaPreview, onSetMediaItems, onSetMediaUploading, onToast,
}: MediaTabProps) {

  const handleUpload = async () => {
    if (!mediaFile || !writer) return;
    onSetMediaUploading(true);
    try {
      const ext = mediaFile.name.split('.').pop();
      const path = `${writer.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('story-media').upload(path, mediaFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('story-media').getPublicUrl(path);
      const { data: inserted, error: dbError } = await supabase.from('story_media').insert({
        author_id: writer.id, url: publicUrl,
        title: mediaTitle || 'Untitled',
        caption: mediaCaption || null,
        media_type: mediaType,
        chapter_tag: mediaChapterTag ? parseInt(mediaChapterTag) : null,
        sort_order: mediaItems.length,
      }).select().single();
      if (dbError) throw dbError;
      onSetMediaItems([...mediaItems, inserted]);
      onSetMediaTitle(''); onSetMediaCaption(''); onSetMediaChapterTag('');
      onSetMediaFile(null); onSetMediaPreview('');
      onToast('Media uploaded successfully!');
    } catch {
      onToast('Upload failed. Please try again.', 'error');
    } finally {
      onSetMediaUploading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Story Media</span>
        <h1 className="hq-page-title">Gallery & Artwork</h1>
        <p className="hq-page-sub">Upload maps, character portraits, mood boards and illustrations for your readers.</p>
      </div>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border-gold)', borderRadius: 12, padding: 28, marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>Upload New Media</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="editor-field">
            <label className="editor-label">Title</label>
            <input className="editor-input" placeholder="e.g. Map of Veloria" value={mediaTitle} onChange={e => onSetMediaTitle(e.target.value)} />
          </div>
          <div className="editor-field">
            <label className="editor-label">Media Type</label>
            <select className="editor-input" value={mediaType} onChange={e => onSetMediaType(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="map">🗺️ Map</option>
              <option value="character">👤 Character Portrait</option>
              <option value="rogues_gallery">👥 Rogues Gallery</option>
              <option value="mood_board">🎨 Mood Board</option>
              <option value="illustration">🖼️ Illustration</option>
              <option value="other">📎 Other</option>
            </select>
          </div>
        </div>
        <div className="editor-field" style={{ marginBottom: 16 }}>
          <label className="editor-label">Caption (optional)</label>
          <input className="editor-input" placeholder="Add context for your readers…" value={mediaCaption} onChange={e => onSetMediaCaption(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="editor-field">
            <label className="editor-label">Link to Chapter (optional)</label>
            <input className="editor-input" type="number" placeholder="Chapter number" value={mediaChapterTag} onChange={e => onSetMediaChapterTag(e.target.value)} />
          </div>
          <div className="editor-field">
            <label className="editor-label">Image File</label>
            <input type="file" accept="image/*" style={{ color: 'var(--text-muted)', fontSize: 13 }} onChange={e => {
              const file = e.target.files?.[0];
              if (file) { onSetMediaFile(file); onSetMediaPreview(URL.createObjectURL(file)); }
            }} />
          </div>
        </div>
        {mediaPreview && <img src={mediaPreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }} />}
        <button className="btn-primary" disabled={mediaUploading || !mediaFile} onClick={handleUpload}>
          {mediaUploading ? 'Uploading…' : 'Upload Media →'}
        </button>
      </div>
      {mediaItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎨</span>
          <div className="empty-title">No media yet</div>
          <p className="empty-sub">Upload maps, character art, and illustrations to bring your world to life.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {mediaItems.map(item => (
            <div key={item.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <img src={item.url} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{item.media_type.replace('_', ' ')}</div>
                {item.caption && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.caption}</div>}
                {item.chapter_tag && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>Chapter {item.chapter_tag}</div>}
                <button onClick={async () => {
                  await supabase.from('story_media').delete().eq('id', item.id);
                  onSetMediaItems(mediaItems.filter(m => m.id !== item.id));
                  onToast('Media removed.');
                }} style={{ marginTop: 8, fontSize: 10, color: 'var(--red)', background: 'none', border: '1px solid var(--red-dim)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
