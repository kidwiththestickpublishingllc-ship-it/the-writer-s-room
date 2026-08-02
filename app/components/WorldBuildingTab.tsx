"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WorldBuildingTab({ writer }: { writer: any }) {
  const [activeSection, setActiveSection] = useState<'glossary' | 'characters' | 'locations'>('glossary');
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [glossaryItems, setGlossaryItems] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Glossary form
  const [gTerm, setGTerm] = useState('');
  const [gDef, setGDef] = useState('');
  const [gChapter, setGChapter] = useState('1');

  // Character form
  const [cName, setCName] = useState('');
  const [cBackstory, setCBackstory] = useState('');
  const [cChapter, setCChapter] = useState('1');
  const [cImage, setCImage] = useState('');

  // Location form
  const [lName, setLName] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lType, setLType] = useState('landmark');
  const [lChapter, setLChapter] = useState('1');
  const [lX, setLX] = useState('50');
  const [lY, setLY] = useState('50');
  const [lColor, setLColor] = useState('#C9A84C');

  useEffect(() => {
    if (!writer) return;
    supabase.from('stories').select('id, title').eq('author_id', writer.id).eq('is_published', true)
      .then(({ data }) => { setStories(data ?? []); if (data?.[0]) setSelectedStory(data[0].id); });
  }, [writer]);

  useEffect(() => {
    if (!selectedStory) return;
    setLoading(true);
    Promise.all([
      supabase.from('glossary').select('*').eq('story_id', selectedStory).order('chapter_first_appears'),
      supabase.from('characters').select('*').eq('story_id', selectedStory).order('chapter_introduced'),
      supabase.from('story_locations').select('*').eq('story_id', selectedStory).order('chapter_unlocks_at'),
    ]).then(([g, c, l]) => {
      setGlossaryItems(g.data ?? []);
      setCharacters(c.data ?? []);
      setLocations(l.data ?? []);
      setLoading(false);
    });
  }, [selectedStory]);

  async function addGlossary() {
    if (!gTerm || !gDef || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('glossary').insert({
      story_id: selectedStory, writer_id: writer.id,
      term: gTerm, definition: gDef,
      chapter_first_appears: parseInt(gChapter), is_approved: false
    }).select().single();
    if (data) setGlossaryItems(prev => [...prev, data]);
    setGTerm(''); setGDef(''); setGChapter('1');
    setSaving(false);
  }

  async function addCharacter() {
    if (!cName || !cBackstory || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('characters').insert({
      story_id: selectedStory, writer_id: writer.id,
      name: cName, backstory: cBackstory,
      chapter_introduced: parseInt(cChapter),
      image_url: cImage || null, is_approved: false
    }).select().single();
    if (data) setCharacters(prev => [...prev, data]);
    setCName(''); setCBackstory(''); setCChapter('1'); setCImage('');
    setSaving(false);
  }

  async function addLocation() {
    if (!lName || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('story_locations').insert({
      story_id: selectedStory, writer_id: writer.id,
      name: lName, description: lDesc,
      location_type: lType,
      chapter_unlocks_at: parseInt(lChapter),
      x_position: parseFloat(lX), y_position: parseFloat(lY),
      accent_color: lColor, is_approved: false
    }).select().single();
    if (data) setLocations(prev => [...prev, data]);
    setLName(''); setLDesc(''); setLType('landmark'); setLChapter('1');
    setLX('50'); setLY('50'); setLColor('#C9A84C');
    setSaving(false);
  }

  async function deleteItem(table: string, id: string, setter: Function, items: any[]) {
    await supabase.from(table).delete().eq('id', id);
    setter(items.filter((i: any) => i.id !== id));
  }

  const sectionStyle = (s: string) => ({
    padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${activeSection === s ? 'var(--gold)' : 'var(--border)'}`,
    background: activeSection === s ? 'var(--gold-glow)' : 'transparent',
    color: activeSection === s ? 'var(--gold-light)' : 'var(--text-muted)',
    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  });

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Story selector */}
      {stories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌍</span>
          <div className="empty-title">No published stories yet</div>
          <p className="empty-sub">Submit and get a story approved first — then come back to build its world.</p>
        </div>
      ) : (
        <>
          <div className="editor-field">
            <label className="editor-label">Which story?</label>
            <select className="editor-input" value={selectedStory} onChange={e => setSelectedStory(e.target.value)}>
              {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button style={sectionStyle('glossary')} onClick={() => setActiveSection('glossary')}>
              📖 Glossary ({glossaryItems.length})
            </button>
            <button style={sectionStyle('characters')} onClick={() => setActiveSection('characters')}>
              👤 Characters ({characters.length})
            </button>
            <button style={sectionStyle('locations')} onClick={() => setActiveSection('locations')}>
              🗺️ Locations ({locations.length})
            </button>
          </div>

          {loading ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div> : (
            <>
              {/* GLOSSARY */}
              {activeSection === 'glossary' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Term</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Term</label>
                        <input className="editor-input" placeholder="e.g. The Glitch" value={gTerm} onChange={e => setGTerm(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">First appears in chapter</label>
                        <input className="editor-input" type="number" min="0" value={gChapter} onChange={e => setGChapter(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Definition</label>
                      <textarea className="editor-textarea" style={{ minHeight: 80 }} placeholder="What does this term mean in your world?" value={gDef} onChange={e => setGDef(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !gTerm || !gDef} onClick={addGlossary}>
                      {saving ? 'Saving…' : '+ Add Term'}
                    </button>
                  </div>
                  {glossaryItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No glossary terms yet. Add as many or as few as your world needs.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {glossaryItems.map(item => (
                        <div key={item.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-light)' }}>{item.term}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Ch. {item.chapter_first_appears}</span>
                              <span style={{ fontSize: 9, color: item.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${item.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{item.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.definition}</div>
                          </div>
                          <button onClick={() => deleteItem('glossary', item.id, setGlossaryItems, glossaryItems)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, marginLeft: 12, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CHARACTERS */}
              {activeSection === 'characters' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Character</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Character Name</label>
                        <input className="editor-input" placeholder="e.g. Fox" value={cName} onChange={e => setCName(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Introduced in chapter</label>
                        <input className="editor-input" type="number" min="0" value={cChapter} onChange={e => setCChapter(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Backstory / Description</label>
                      <textarea className="editor-textarea" style={{ minHeight: 100 }} placeholder="Who is this character? What should readers know after meeting them?" value={cBackstory} onChange={e => setCBackstory(e.target.value)} />
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Character Image URL <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>(optional)</span></label>
                      <input className="editor-input" placeholder="https://your-character-art.jpg" value={cImage} onChange={e => setCImage(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !cName || !cBackstory} onClick={addCharacter}>
                      {saving ? 'Saving…' : '+ Add Character'}
                    </button>
                  </div>
                  {characters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No characters yet. Add character cards that unlock for readers when they reach the chapter a character appears in.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {characters.map(char => (
                        <div key={char.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#84b0f5' }}>{char.name}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Ch. {char.chapter_introduced}</span>
                              <span style={{ fontSize: 9, color: char.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${char.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{char.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{char.backstory}</div>
                          </div>
                          <button onClick={() => deleteItem('characters', char.id, setCharacters, characters)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LOCATIONS */}
              {activeSection === 'locations' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Location</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Location Name</label>
                        <input className="editor-input" placeholder="e.g. Town Square" value={lName} onChange={e => setLName(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Unlocks at chapter</label>
                        <input className="editor-input" type="number" min="0" value={lChapter} onChange={e => setLChapter(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Type</label>
                        <select className="editor-input" value={lType} onChange={e => setLType(e.target.value)}>
                          <option value="landmark">Landmark</option>
                          <option value="building">Building</option>
                          <option value="residential">Residential</option>
                          <option value="secret">Secret</option>
                          <option value="natural">Natural</option>
                          <option value="institution">Institution</option>
                        </select>
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Accent Color</label>
                        <input type="color" value={lColor} onChange={e => setLColor(e.target.value)} style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--ink2)' }} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Map X position (0-100)</label>
                        <input className="editor-input" type="number" min="0" max="100" value={lX} onChange={e => setLX(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Map Y position (0-100)</label>
                        <input className="editor-input" type="number" min="0" max="100" value={lY} onChange={e => setLY(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Description</label>
                      <textarea className="editor-textarea" style={{ minHeight: 80 }} placeholder="What is this place? What happened here?" value={lDesc} onChange={e => setLDesc(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !lName} onClick={addLocation}>
                      {saving ? 'Saving…' : '+ Add Location'}
                    </button>
                  </div>
                  {locations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No locations yet. Add places from your story that appear on the world map and unlock as readers progress.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {locations.map(loc => (
                        <div key={loc.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: loc.accent_color, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{loc.name}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase' }}>{loc.location_type}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Unlocks Ch. {loc.chapter_unlocks_at}</span>
                              <span style={{ fontSize: 9, color: loc.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${loc.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{loc.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            {loc.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{loc.description}</div>}
                          </div>
                          <button onClick={() => deleteItem('story_locations', loc.id, setLocations, locations)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, marginLeft: 12, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
