# The Writer's Room — The Tiniest Library

The writer-side platform for The Tiniest Library. A home for independent writers to publish stories, earn through Ink, and build their readership.

## Features

- **Beautiful landing page** — dark editorial design matching TTL brand
- **Founding 100 program** — live spot counter, urgency banner
- **Why TTL** — copyright, Ink revenue, fanbase building
- **How It Works** — step-by-step submission process
- **Formats & Genres** — all 24 TTL genres
- **Ink Economy explainer** — how writers earn
- **Submission Guidelines** — rules and content policy
- **Quill AI** — writer-focused chat guide (rule-based, upgradeable to Claude)

## Tech Stack

- Next.js 15, TypeScript, Tailwind CSS
- Deployed on Vercel
- Quill chat widget (upgradeable to Claude API)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Upgrade Quill to Claude AI

1. Create `/app/api/quill-chat/route.ts`
2. Set `USE_AI = true` in `QuillChatWidget.tsx`
3. Add `ANTHROPIC_API_KEY` to `.env.local` and Vercel environment variables

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Deploy — no environment variables needed for rule-based mode
