<!-- BEGIN:vidmate-agent-rules -->
# VidMate — Agent Memory & Workflow

This project is VidMate, a plain **Remotion 4** video project (no Next.js, no
Supabase, no API). Remotion version for this project is **4.0.490** — read the
installed docs in `node_modules/remotion` before writing Remotion code.

## SQLite Memory (the source of truth)

The `edu-video` agent keeps persistent state in a local SQLite DB
(`data/memory.sqlite`, gitignored) so it remembers which playlist it is working on,
how many videos have been made, and what is pending. **Run it at the start of every
session that touches video work.**

```
npm run memory -- status
```

Commands:
- `npm run memory -- status` — active playlist, video counts per status, recent videos
- `npm run memory -- playlist list`
- `npm run memory -- playlist create <name> [description]` — first one becomes active
- `npm run memory -- playlist set-active <name|id>`
- `npm run memory -- video add "<title>" [--topic x] [--status <planned|writing|building|rendering|rendered|published>]`
- `npm run memory -- video list [--playlist name] [--status s]`
- `npm run memory -- video get <id>`
- `npm run memory -- video update <id> [--status s] [--output out/<f>.mp4] [--composition <id>] [--duration n] [--notes x]`
- `npm run memory -- note add "<free text>"`
- `npm run memory -- meta set <key> <value>` / `meta get <key>`
- `npm run memory -- history` — recent agent activity

The full agent prompt (teaching canon, render steps, Urdu voiceover rules) lives in
`.opencode/agent/edu-video.md`. Use `@edu-video` or Tab-cycle to delegate educational
video work to it.

## Project layout

- `src/Root.tsx` — registers compositions. `LogisticsWebAbout` is an existing
  client/promo video; leave it unless the user asks.
- `src/components/` — scene components + `Shared.tsx` (colors, FadeIn/SlideUp).
- `src/components/SubtitleOverlay.tsx` — subtitle-on-video pattern (drive from `.vtt`).
- `public/` — `voiceover.mp3`, `voiceover.vtt`, images (refer via `staticFile()`).
- `out/` — rendered videos (gitignored).
- `scripts/memory.mjs` — the SQLite memory CLI (Node 24 built-in `node:sqlite`).

## Verify after changes

- `npm run lint` (eslint + tsc)
- `npx remotion compositions` — compositions registered?
- `npx remotion still <compId> out/<name>.png --frame=<n>` — quick visual check
- `npx remotion render <compId> out/<file>.mp4` — full render
<!-- END:vidmate-agent-rules -->