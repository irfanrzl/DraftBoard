# Draftboard

Turn an ERD or a wireframe — text or screenshot — into a working dashboard or website draft. One input panel, one model call, one HTML file out.

## How it works

There's no diagram parser, no schema, no component library. Everything goes through a single call to **Gemini 3.5 Flash**:

```
your input (text and/or image) + a system prompt that:
  1. classifies it — ERD -> dashboard, wireframe -> website, free text -> website
  2. tells Gemini to write one complete, self-contained HTML file
     -> Gemini's raw output IS the draft
```

That's the whole engine (`server/gemini.ts` + `server/prompt.ts`). The dashboard gets working search/sort/CRUD against placeholder in-memory data; the website gets working nav and placeholder copy/images. Everything is a draft for you to review and wire up to a real backend afterwards.

## Setup (VS Code)

1. Open this folder in VS Code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey), then:
   ```bash
   cp .env.example .env
   ```
   and paste your key into `.env` as `GEMINI_API_KEY=...`.
4. Run it:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173

## Pages

- `/` — home / landing page
- `/how` — how it works
- `/examples` — sample DBML / Mermaid inputs
- `/about` — about the project
- `/tool` — the actual tool

## Using the tool

- Paste DBML or Mermaid ERD text, **or** just describe what you want in plain English, **or** drop in a screenshot (ERD export or wireframe) — any combination works. The Dashboard/Website toggle only changes the panel's labels and the downloaded filename; the engine still classifies your input itself, same as before. There are two ready-made examples you can load with one click.
- Click **Generate**. The result renders live in the paper panel on the right, with a brief reveal animation.
- **Download** saves the single-file draft as `dashboard.html` / `website.html`.

## Project layout

```
draftboard/
  server/
    index.ts    — Express app: serves public/ (clean URLs via extensions
                  fallback, e.g. /how -> how.html) + POST /api/generate
    gemini.ts   — the single Gemini 3.5 Flash call
    prompt.ts   — the system prompt (classification rules + fidelity criteria)
  public/
    index.html  — home page
    how.html, examples.html, about.html — marketing pages
    tool.html   — the working tool UI
    styles.css  — shared stylesheet for every page
    app.js      — tool page logic (mode toggle, dropzone, generate, preview)
```

## Notes

- Every request sends the full prompt + optional image to Gemini and gets back one HTML document — there's no caching or persistence yet, each draft is generated fresh.
- Image uploads are capped by the 25MB JSON body limit set in `server/index.ts`; resize screenshots if you hit that.
- If Gemini ever wraps its output in ```html fences despite being told not to, `gemini.ts` strips them automatically.
- The site copy is intentionally accurate about what's actually happening: generation calls Google's Gemini API with whatever key you provide (not a local/offline model), and the output is a single HTML file rather than a downloadable multi-file project.
