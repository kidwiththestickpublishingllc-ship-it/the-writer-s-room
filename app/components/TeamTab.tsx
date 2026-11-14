"use client";

/**
 * TeamTab.tsx
 * ─────────────────────────────────────────────────────────────────
 * Creators Room dashboard tab — teams and splits for every story and
 * comic you're on. Every work is a team, even a team of one.
 *
 * Place at: app/components/TeamTab.tsx (the-writers-room)
 *
 * Reads and writes ONLY through Supabase functions, which check who is
 * signed in: get_my_teams, invite_member, respond_invite, propose_split,
 * accept_split. The browser never touches the split tables directly.
 *
 * Wired into app/dashboard/page.tsx:
 * 1. import TeamTab from "@/app/components/TeamTab";
 * 2. 'team' added to Tab type
 * 3. nav button under Publish
 * 4. {tab === 'team' && <TeamTab />}
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Share = { creator_id: string; name: string; share_bps: number; accepted: boolean };
type Split = { id: string; status: string; proposed_by: string; created_at: string; shares: Share[] | null };
type Member = {
  member_id: string;
  creator_id: string;
  name: string;
  role: string;
  status: "invited" | "active";
  founding: boolean;
};
type Work = {
  kind: "story" | "comic";
  work_id: string;
  title: string | null;
  my_member_id: string;
  my_status: "invited" | "active";
  my_role: string;
  can_publish: boolean;
  members: Member[] | null;
  active_split: Split | null;
  proposed_split: Split | null;
};

const ROLES = ["writer", "artist", "colorist", "letterer", "editor", "translator"];

const ERRORS: Record<string, string> = {
  not_signed_in: "Sign in again to manage your team.",
  not_allowed: "Only a team member who can publish this work can do that.",
  bad_role: "Pick a role from the list.",
  creator_not_found: "No approved creator goes by that pen name. Check the spelling, or send them the link to apply.",
  name_ambiguous: "More than one creator matches that name. Use their profile slug instead.",
  already_on_team: "They're already on this team or already invited.",
  team_full: "Teams top out at 8 people.",
  invite_not_found: "That invite is no longer open.",
  duplicate_member: "Each person can appear only once in a split.",
  bad_share: "Every share must be between 0.01% and 100%.",
  shares_must_total_100: "Shares must add up to exactly 100%.",
  shares_must_cover_every_member: "Every active member needs a share. Someone may have just joined, so refresh and try again.",
  proposal_not_found: "That proposal is no longer open. Someone may have replaced it.",
};

function friendly(msg: string) {
  const key = Object.keys(ERRORS).find((k) => msg.includes(k));
  return key ? ERRORS[key] : "Something went wrong. Try again in a moment.";
}

const round2 = (n: number) => String(Math.round(n * 100) / 100);
const pct = (bps: number) => `${round2(bps / 100)}%`;
const takeHome = (bps: number, founding: boolean) => `${round2((bps / 100) * (founding ? 0.8 : 0.7))}%`;
const toBps = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const STYLES = `
  .tm-root { font-family: var(--font-ui, system-ui, sans-serif); color: inherit; max-width: 920px; }
  .tm-h { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; font-weight: 600; margin: 0 0 6px; }
  .tm-intro { font-size: 14px; line-height: 1.6; opacity: 0.8; margin: 0 0 22px; max-width: 680px; }

  .tm-notice { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 18px; border: 1px solid; }
  .tm-notice.ok  { border-color: rgba(63,163,107,0.45); background: rgba(63,163,107,0.08); color: #3FA36B; }
  .tm-notice.err { border-color: rgba(217,83,79,0.45);  background: rgba(217,83,79,0.08);  color: #D9534F; }

  .tm-group { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold, #C9A84C); margin: 26px 0 10px; }

  .tm-card {
    border: 1px solid color-mix(in srgb, var(--gold, #C9A84C) 28%, transparent);
    background: color-mix(in srgb, currentColor 3%, transparent);
    border-radius: 12px; padding: 20px 22px; margin-bottom: 16px;
  }
  .tm-card.invite {
    border-color: color-mix(in srgb, var(--gold, #C9A84C) 60%, transparent);
    background: color-mix(in srgb, var(--gold, #C9A84C) 7%, transparent);
  }
  .tm-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .tm-kind { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
  .tm-kind.story { background: color-mix(in srgb, var(--gold, #C9A84C) 18%, transparent); color: var(--gold, #C9A84C); }
  .tm-kind.comic { background: rgba(20,241,217,0.12); color: #0FB8A6; }
  .tm-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; margin: 0; flex: 1; min-width: 160px; }
  .tm-myrole { font-size: 12px; opacity: 0.65; text-transform: capitalize; }

  .tm-label { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.55; margin: 18px 0 8px; }
  .tm-members { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .tm-member {
    display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 13px;
    border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  }
  .tm-role { opacity: 0.6; text-transform: capitalize; }
  .tm-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold, #C9A84C); }
  .tm-invited { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #D08A3A; }

  .tm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .tm-table th {
    text-align: left; font-weight: 600; font-size: 11px; opacity: 0.6; padding: 6px 8px;
    border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  }
  .tm-table td { padding: 8px; border-bottom: 1px solid color-mix(in srgb, currentColor 6%, transparent); }
  .tm-num { text-align: right !important; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .tm-signed { color: #3FA36B; font-weight: 600; }
  .tm-waiting { color: #D08A3A; font-weight: 600; }

  .tm-proposal {
    margin-top: 16px; padding: 14px 16px; border-radius: 10px;
    border: 1px dashed color-mix(in srgb, var(--gold, #C9A84C) 50%, transparent);
  }
  .tm-proposal-head { font-size: 13px; line-height: 1.5; margin-bottom: 10px; }

  .tm-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; align-items: center; }
  .tm-btn {
    font-family: inherit; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    padding: 10px 16px; border-radius: 8px; cursor: pointer; background: transparent;
    border: 1px solid color-mix(in srgb, var(--gold, #C9A84C) 55%, transparent); color: var(--gold, #C9A84C);
  }
  .tm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .tm-btn.primary { background: linear-gradient(135deg, var(--gold, #C9A84C), #8a6510); color: #000; border: none; }
  .tm-btn.ghost { border-color: color-mix(in srgb, currentColor 20%, transparent); color: inherit; opacity: 0.85; }

  .tm-input, .tm-select {
    font-family: inherit; font-size: 14px; padding: 9px 12px; border-radius: 8px; color: inherit;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent); background: transparent;
  }
  .tm-select option { color: #111; }
  .tm-input { flex: 1; min-width: 180px; }
  .tm-input.pct { flex: none; min-width: 0; width: 88px; text-align: right; margin-right: 4px; }
  .tm-total { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .tm-total.good { color: #3FA36B; }
  .tm-total.bad  { color: #D9534F; }

  .tm-muted { font-size: 13px; opacity: 0.6; margin: 0; }
  .tm-fine { font-size: 12px; opacity: 0.6; margin: 10px 0 0; line-height: 1.5; }
  .tm-empty {
    padding: 28px; text-align: center; border-radius: 12px; font-size: 14px; line-height: 1.6; opacity: 0.8;
    border: 1px dashed color-mix(in srgb, currentColor 18%, transparent);
  }

  @media (max-width: 640px) {
    .tm-card { padding: 16px; }
    .tm-title { font-size: 19px; }
    .tm-h { font-size: 25px; }
  }
`;

function SplitTable({ split, members, showSigned }: { split: Split; members: Member[]; showSigned: boolean }) {
  const founding = (id: string) => members.find((m) => m.creator_id === id)?.founding ?? false;
  return (
    <table className="tm-table">
      <thead>
        <tr>
          <th>Member</th>
          <th className="tm-num">Share</th>
          <th className="tm-num">Takes home per unlock</th>
          {showSigned && <th className="tm-num">Signed</th>}
        </tr>
      </thead>
      <tbody>
        {(split.shares ?? []).map((s) => (
          <tr key={s.creator_id}>
            <td>{s.name}</td>
            <td className="tm-num">{pct(s.share_bps)}</td>
            <td className="tm-num">{takeHome(s.share_bps, founding(s.creator_id))}</td>
            {showSigned && (
              <td className="tm-num">
                {s.accepted ? <span className="tm-signed">Signed</span> : <span className="tm-waiting">Waiting</span>}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TeamTab() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [inviteName, setInviteName] = useState<Record<string, string>>({});
  const [inviteRole, setInviteRole] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>({});
  const [openDraft, setOpenDraft] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_my_teams");
    if (error) setNotice({ text: friendly(error.message), ok: false });
    else setWorks((data as Work[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(
    key: string,
    call: () => PromiseLike<{ error: { message: string } | null }>,
    okText: string
  ) {
    setBusy(key);
    setNotice(null);
    const { error } = await call();
    setBusy(null);
    if (error) {
      setNotice({ text: friendly(error.message), ok: false });
      return false;
    }
    setNotice({ text: okText, ok: true });
    await load();
    return true;
  }

  function respond(w: Work, accept: boolean) {
    return run(
      `respond-${w.work_id}`,
      () => supabase.rpc("respond_invite", { p_member_id: w.my_member_id, p_accept: accept }),
      accept
        ? `You're on the team for ${w.title ?? "this work"}. Next, the team agrees a split.`
        : "Invite declined."
    );
  }

  async function invite(w: Work) {
    const name = (inviteName[w.work_id] ?? "").trim();
    if (!name) {
      setNotice({ text: "Enter their pen name.", ok: false });
      return;
    }
    const role = inviteRole[w.work_id] ?? (w.kind === "comic" ? "artist" : "writer");
    const ok = await run(
      `invite-${w.work_id}`,
      () => supabase.rpc("invite_member", { p_kind: w.kind, p_work_id: w.work_id, p_name: name, p_role: role }),
      `Invite sent to ${name}. They'll see it in their Team tab.`
    );
    if (ok) setInviteName((prev) => ({ ...prev, [w.work_id]: "" }));
  }

  function startDraft(w: Work) {
    const active = (w.members ?? []).filter((m) => m.status === "active");
    if (!active.length) return;
    const current = new Map((w.active_split?.shares ?? []).map((s) => [s.creator_id, s.share_bps]));
    const covered = active.every((m) => current.has(m.creator_id));
    const even = Math.floor(10000 / active.length);
    const d: Record<string, string> = {};
    active.forEach((m, i) => {
      const bps = covered
        ? (current.get(m.creator_id) as number)
        : i === 0
          ? 10000 - even * (active.length - 1)
          : even;
      d[m.creator_id] = round2(bps / 100);
    });
    setDraft((prev) => ({ ...prev, [w.work_id]: d }));
    setOpenDraft(w.work_id);
    setNotice(null);
  }

  async function propose(w: Work) {
    const shares = Object.entries(draft[w.work_id] ?? {}).map(([creator_id, v]) => ({ creator_id, bps: toBps(v) }));
    const ok = await run(
      `propose-${w.work_id}`,
      () => supabase.rpc("propose_split", { p_kind: w.kind, p_work_id: w.work_id, p_shares: shares }),
      shares.length === 1 ? "Split saved." : "Proposal sent. It goes live when everyone on the team signs."
    );
    if (ok) setOpenDraft(null);
  }

  async function sign(w: Work, accept: boolean) {
    if (!w.proposed_split) return;
    setBusy(`sign-${w.work_id}`);
    setNotice(null);
    const { data, error } = await supabase.rpc("accept_split", {
      p_split_id: w.proposed_split.id,
      p_accept: accept,
    });
    setBusy(null);
    if (error) {
      setNotice({ text: friendly(error.message), ok: false });
      return;
    }
    setNotice({
      ok: true,
      text: !accept
        ? "Proposal rejected. Anyone on the team can propose a new one."
        : data
          ? "Everyone has signed. The new split is live from the next chapter."
          : "Signed. Waiting on the rest of the team.",
    });
    load();
  }

  const invites = works.filter((w) => w.my_status === "invited");
  const teams = works.filter((w) => w.my_status === "active");

  return (
    <div className="tm-root">
      <style>{STYLES}</style>

      <h2 className="tm-h">Team &amp; Splits</h2>
      <p className="tm-intro">
        Every story and comic is a team, even a team of one. The team decides how the creator share is split, and
        every member signs before a split goes live. Founding 100 members keep 80% of each unlock, everyone else 70%.
        Tips always go 100% to creators.
      </p>

      {notice && <div className={`tm-notice ${notice.ok ? "ok" : "err"}`}>{notice.text}</div>}

      {loading && <p className="tm-muted">Loading your teams…</p>}

      {!loading && works.length === 0 && (
        <div className="tm-empty">
          You&apos;re not on a team yet. Submit a story or comic and it starts as your team of one. When another
          creator invites you, the invite shows up here.
        </div>
      )}

      {/* ── Invites waiting on me ── */}
      {invites.length > 0 && <div className="tm-group">Invites</div>}
      {invites.map((w) => {
        const members = (w.members ?? []).filter((m) => m.status === "active");
        return (
          <div key={w.work_id} className="tm-card invite">
            <div className="tm-head">
              <span className={`tm-kind ${w.kind}`}>{w.kind === "story" ? "Story" : "Comic"}</span>
              <h3 className="tm-title">{w.title ?? "Untitled"}</h3>
              <span className="tm-myrole">Invited as {w.my_role}</span>
            </div>
            <div className="tm-label">Already on the team</div>
            <ul className="tm-members">
              {members.map((m) => (
                <li key={m.member_id} className="tm-member">
                  <span>{m.name}</span>
                  <span className="tm-role">{m.role}</span>
                </li>
              ))}
            </ul>
            <p className="tm-fine">
              Joining doesn&apos;t change anyone&apos;s pay on its own. Once you&apos;re in, the team proposes a new
              split that includes you, and it goes live when everyone signs.
            </p>
            <div className="tm-actions">
              <button className="tm-btn primary" disabled={!!busy} onClick={() => respond(w, true)}>
                Join the team
              </button>
              <button className="tm-btn ghost" disabled={!!busy} onClick={() => respond(w, false)}>
                Decline
              </button>
            </div>
          </div>
        );
      })}

      {/* ── My teams ── */}
      {teams.length > 0 && <div className="tm-group">Your teams</div>}
      {teams.map((w) => {
        const members = w.members ?? [];
        const active = members.filter((m) => m.status === "active");
        const me = members.find((m) => m.member_id === w.my_member_id);
        const myShare = w.proposed_split?.shares?.find((s) => s.creator_id === me?.creator_id);
        const waitingOn = (w.proposed_split?.shares ?? []).filter((s) => !s.accepted).length;
        const d = draft[w.work_id] ?? {};
        const total = Object.values(d).reduce((sum, v) => sum + toBps(v), 0);
        const roleValue = inviteRole[w.work_id] ?? (w.kind === "comic" ? "artist" : "writer");

        return (
          <div key={w.work_id} className="tm-card">
            <div className="tm-head">
              <span className={`tm-kind ${w.kind}`}>{w.kind === "story" ? "Story" : "Comic"}</span>
              <h3 className="tm-title">{w.title ?? "Untitled"}</h3>
              <span className="tm-myrole">You: {w.my_role}</span>
            </div>

            <div className="tm-label">Team</div>
            <ul className="tm-members">
              {members.map((m) => (
                <li key={m.member_id} className="tm-member">
                  <span>{m.name}</span>
                  <span className="tm-role">{m.role}</span>
                  {m.founding && <span className="tm-badge">Founding</span>}
                  {m.status === "invited" && <span className="tm-invited">Invited</span>}
                </li>
              ))}
            </ul>

            <div className="tm-label">Current split</div>
            {w.active_split ? (
              <SplitTable split={w.active_split} members={members} showSigned={false} />
            ) : (
              <p className="tm-muted">No split yet.</p>
            )}

            {/* ── Open proposal ── */}
            {w.proposed_split && (
              <div className="tm-proposal">
                <div className="tm-proposal-head">
                  <strong>{w.proposed_split.proposed_by}</strong> proposed a new split.{" "}
                  {waitingOn > 0
                    ? `Waiting on ${waitingOn} ${waitingOn === 1 ? "signature" : "signatures"}.`
                    : "Everyone has signed."}
                </div>
                <SplitTable split={w.proposed_split} members={members} showSigned />
                {myShare && !myShare.accepted && (
                  <div className="tm-actions">
                    <button className="tm-btn primary" disabled={!!busy} onClick={() => sign(w, true)}>
                      Sign this split
                    </button>
                    <button className="tm-btn ghost" disabled={!!busy} onClick={() => sign(w, false)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Draft a new split ── */}
            {openDraft === w.work_id ? (
              <div className="tm-proposal">
                <div className="tm-proposal-head">
                  New split. Everyone on the team signs before it goes live. Chapters already published keep the split
                  they went out under.
                </div>
                <table className="tm-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th className="tm-num">Share</th>
                      <th className="tm-num">Takes home per unlock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((m) => {
                      const v = d[m.creator_id] ?? "";
                      return (
                        <tr key={m.creator_id}>
                          <td>{m.name}</td>
                          <td className="tm-num">
                            <input
                              className="tm-input pct"
                              type="number"
                              min="0.01"
                              max="100"
                              step="0.01"
                              value={v}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [w.work_id]: { ...prev[w.work_id], [m.creator_id]: e.target.value },
                                }))
                              }
                            />
                            %
                          </td>
                          <td className="tm-num">{takeHome(toBps(v), m.founding)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="tm-actions">
                  <span className={`tm-total ${total === 10000 ? "good" : "bad"}`}>
                    Total {pct(total)}
                    {total !== 10000 && " (must be 100%)"}
                  </span>
                  <button
                    className="tm-btn primary"
                    disabled={total !== 10000 || !!busy}
                    onClick={() => propose(w)}
                  >
                    {active.length === 1 ? "Save split" : "Send proposal"}
                  </button>
                  <button className="tm-btn ghost" onClick={() => setOpenDraft(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              active.length > 1 && (
                <div className="tm-actions">
                  <button className="tm-btn" disabled={!!busy} onClick={() => startDraft(w)}>
                    Propose a new split
                  </button>
                </div>
              )
            )}

            {/* ── Invite ── */}
            {w.can_publish && (
              <>
                <div className="tm-label">Invite a creator</div>
                <div className="tm-actions" style={{ marginTop: 0 }}>
                  <input
                    className="tm-input"
                    placeholder="Their pen name or profile slug"
                    value={inviteName[w.work_id] ?? ""}
                    onChange={(e) => setInviteName((prev) => ({ ...prev, [w.work_id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") invite(w);
                    }}
                  />
                  <select
                    className="tm-select"
                    value={roleValue}
                    onChange={(e) => setInviteRole((prev) => ({ ...prev, [w.work_id]: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r[0].toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button className="tm-btn" disabled={!!busy} onClick={() => invite(w)}>
                    Send invite
                  </button>
                </div>
                <p className="tm-fine">
                  They need their own Creators Room account first. Once they join, propose a split that includes them.
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}