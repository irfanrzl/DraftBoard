# Draftboard

Turn a database diagram into a working dashboard.

Write your data model as DBML, and this tool generates an interactive
React admin dashboard — tables, forms, detail views, and linked relations.

## Run it

```bash
npm install

# see the parsed structure
npm run parse examples/blog.dbml

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
