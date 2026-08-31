# Draftboard

Turn a database diagram into a working dashboard.

Write your data model as DBML, and this tool generates an interactive
React admin dashboard — tables, forms, detail views, and linked relations.

Draftboard also has a **website engine**: turn a page/navigation description
into a multi-page React site, optionally themed from a mockup image. See
`docs/WEBSITE-ENGINE.md`.

## Easiest way: the web interface

```bash
npm install
npm run web
```

Open http://localhost:3000. Paste DBML or Mermaid, or upload an ERD screenshot,
click Generate, see the live preview, and download the full React project.
(Screenshot input needs Ollama running — see `docs-screenshot.md`.)

## Run it (command line)

```bash
npm install

# see the parsed structure
npm run parse examples/blog.dbml

# also works with Mermaid ERD text
npm run parse examples/shop.mmd

# quick single-file HTML preview
npm run generate examples/blog.dbml -- --out preview

# the real thing: a full React app you can click around
npm run scaffold examples/blog.dbml -- --out my-dashboard
cd my-dashboard
npm install
npm run dev
```

## From a screenshot (AI feature)

Turn a picture of an ERD into a dashboard. Needs a vision model — free with a
local Ollama install (see `docs-screenshot.md`):

```bash
npm run scaffold-image path/to/your-erd.png -- --out my-dashboard
```

Then open the URL it prints (usually http://localhost:5173).

## What's where

Everything lives in `src/` — six small files, in the order data flows:

| File | Job |
|------|-----|
| `src/cli.ts` | the command you run (parse / generate / scaffold) |
| `src/spec.ts` | the data shape everything agrees on (the "contract") |
| `src/parser.ts` | reads DBML → Spec, and decides each field's UI |
| `src/mock.ts` | makes sample data |
| `src/generate-html.ts` | Spec → one static HTML preview |
| `src/generate-app.ts` | Spec → a full React project |
| `app-template/` | the dashboard app that gets copied out and filled in |

See `NOTES.md` for a plain-language tour and "where do I change X" tips.

## The idea

The generated app is a generic dashboard that reads an injected `schema.js`.
So the same app code works for any database — the tool just writes the schema
and sample data into it. To use real data later, swap `app-template/src/store.jsx`
for API calls; nothing else changes.

## Docs

- `NOTES.md` — casual "where do I change X" guide for future-me
- `docs/ARCHITECTURE.md` — how the pipeline fits together
- `docs/HEURISTICS.md` — the field → UI rules (the brain)
- `docs/ROADMAP.md` — what's done and what's next
- `docs/WEBSITE-PIPELINE.md` — the phase-2 plan (UI-flow → website)
- `docs/WEBSITE-ENGINE.md` — the website engine + design-token theming
- `docs-screenshot.md` — screenshot feature setup (Ollama / Gemini)
