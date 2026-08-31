# Notes to self

Casual map of this project so future-me remembers how it works.

## The whole thing in one sentence

You give it a database diagram (DBML text), it spits out a working dashboard.

## How data flows

```
blog.dbml  →  parser.ts  →  a "Spec" (plain JSON)  →  generate-app.ts  →  React app
```

Read it left to right. The **Spec** in the middle is just a tidy JSON
description of your tables and fields. Everything reads or writes that Spec.

## Where do I change X?

- **"I want to support a new field type / make a status show as a badge"**
  → `src/parser.ts`, look at the `inferUi` and `inferType` functions.
  These are the rules that decide how each column looks. This is the brain.

- **"I want the dashboard to look different (colors, layout)"**
  → `app-template/src/styles.css` for colors/spacing.
  → `app-template/src/components/` for the actual screens.
  Note: this is a whole little React app on its own. It doesn't run inside
  Draftboard — it gets copied out when you run `scaffold`, then runs on its own.

- **"I want to change the sample data"**
  → `src/mock.ts`.

- **"I want a new input format (Mermaid, screenshots)"**
  → make a new file like `src/parse-mermaid.ts` that returns a Spec, then
  wire it into `src/cli.ts`. As long as it produces a valid Spec, the rest
  of the pipeline just works.

- **"I want to connect a real database instead of fake data"**
  → in the *generated* app, edit `src/store.jsx`. Right now it holds rows in
  memory. Replace those functions (list/get/create/update/remove) with calls
  to your API. The UI never needs to change.

## Two different package.json files (don't get confused)

- The one in the **root** = this tool (the generator).
- The one in **app-template/** = the dashboard it generates. Separate app,
  separate dependencies. When you `scaffold`, that folder becomes a real
  standalone project.

## The three commands

- `parse`    — just prints the Spec JSON. Good for debugging the parser.
- `generate` — one HTML file, static preview, no install needed.
- `scaffold` — the real interactive React app. This is the main event.

## Tests

`npm test` — checks the parser and generators still work. Run it after changes.
```

## Screenshot input (the AI feature)

New files under `src/vision/` read an image and return a Spec. It's the only
part that uses AI (a screenshot is just pixels — needs a model to read it).

- `src/vision/types.ts`  — the interface every backend implements ("the plug")
- `src/vision/prompt.ts` — the instruction given to the model (shared)
- `src/vision/ollama.ts` — free local backend (needs Ollama installed)
- `src/vision/gemini.ts` — cloud backend, for when you commercialize
- `src/vision/index.ts`  — picks one based on VISION_PROVIDER env var
- `src/parse-image.ts`   — ties it together: image file -> Spec

**Swap backend:** set `VISION_PROVIDER=ollama` (default) or `=gemini`.
That's the whole switch. See docs/VISION.md.

**Why swappable:** free/local now for me; when I commercialize, flip to Gemini
so one business key serves all users (they don't each need an account). The
dashboard generator never changes — only the "image reader" plug does.

## Mermaid input

`src/parse-mermaid.ts` reads Mermaid `erDiagram` text and returns the same Spec
as the DBML parser. The CLI auto-detects it: files ending `.mmd`/`.mermaid`, or
text starting with `erDiagram`, use the Mermaid parser. It reuses the same
heuristics (`inferType`/`inferRole`/`inferUi` from `parser.ts`) so field
decisions stay identical across both formats. Example: `examples/shop.mmd`.

## Web interface

`src/server.ts` + `web/index.html` = a local control panel. Run `npm run web`,
open http://localhost:3000. It's a thin wrapper: the server reuses parseDbml /
parseMermaid / parseImage / generateHtml / generateProject — no engine changes.
- Paste text or upload a screenshot → POST /api/generate → preview HTML
- Download button → POST /api/download → project files → zipped in the browser
No web framework; just Node's built-in http. To change how the page looks, edit
web/index.html. To put it online later, switch screenshot input to Gemini
(VISION_PROVIDER=gemini) since a server won't have local Ollama.

## The second engine: website generation (src/site/)

The website engine is quarantined in src/site/ so it doesn't tangle with the
dashboard engine. Same 3-stage shape:

  .site text → SiteSpec (JSON) → site generator → multi-page React site

- `site/site-spec.ts`      — the SiteSpec schema (pages, types, links)
- `site/parse-sitetext.ts` — reads the ".site" text format → SiteSpec
- `site/generate-site.ts`  — SiteSpec → a real React + React Router site
- `site/site-template/`    — the generic site app (copied out on generate)
- `site/site-template/src/pages/` — the ARCHETYPES: Hero, List, Form, Generic

Run it:  npm run site examples/acme.site -- --out my-site
Then:    cd my-site && npm install && npm run dev

The ".site" format (see examples/acme.site):
  site "Name"
  page Home : hero
    -> Services       (a nav link)
  page Services : list
  page Contact : form

To add a new page type: add an archetype component in site-template/src/pages/,
register it in the ARCHETYPES map in site-template/src/App.jsx, and add the type
name to PageType in site-spec.ts. Text/vision inputs need no change.

Honest limit: this produces a SKELETON (right pages, working navigation,
placeholder layouts). Real content and logic are the user's to fill in — a
diagram can't specify those.

## Design tokens (theming from a mockup — Level 3, Depth 1)

Files in src/site/:
- design-tokens.ts   — the DesignTokens schema + tokensToCss() (token → CSS vars)
- design-prompt.ts   — the vision prompt for reading design from a mockup
- extract-tokens.ts  — mockup image → DesignTokens (via vision module + sanitize)

How it themes: generate-site.ts prepends tokensToCss(tokens) to the site's
styles.css, so the same templates get re-themed. The template's styles.css uses
var(--accent), var(--radius), var(--font), var(--density) etc. — themeable vars
come from tokens, non-themeable (--muted/--line/--soft) stay in the base file.

Commands:
  npm run parse-tokens mockup.png              → prints extracted tokens (the "confirm" step)
  npm run site x.site -- --out d --theme m.png → builds a themed site

Default model is now qwen3-vl (I deleted llava/llama3.2-vision locally). Change
in src/vision/ollama.ts or via OLLAMA_MODEL.

Reminder — this is DEPTH 1 (theme only). Depth 2 = component styles (button/input/
card design), Depth 3 = actual page layout. Both are next, not done. And feed the
extractor ONE clean design, not a sheet of many thumbnails, or the read is muddled.

The vision interface now takes optional custom prompts (VisionPrompts), so one
module serves ERD reading AND design reading. See src/vision/types.ts.

## The web app (web/) — now multi-page React

The control panel is now a full React + Vite + Router app in web/, not a single
html file. Pages in web/src/pages/: Home, Tool, HowItWorks, Examples, About.
Shell (nav + footer) is web/src/App.jsx. Styles in web/src/styles.css.

- The Tool page (web/src/pages/Tool.jsx) has all the generate/preview/download
  logic. It calls /api/generate and /api/download.
- server.ts serves the BUILT app (web/dist) + the API, on port 3001.
- `npm run web` = install web deps, build web, start server (serves everything).
- To edit the UI with hot reload: `npm run web:dev` (API) + `npm --prefix web run dev`
  (Vite, proxies /api to the server).

To change the landing/about/etc content, edit the page files in web/src/pages/.
To change the tool, edit web/src/pages/Tool.jsx.
Remember to update your real email in web/src/pages/About.jsx.

## Depth 3: layout composition (src/site/, in progress)

Reads a page's ARRANGEMENT (which blocks, what order, layout options), not just
style. Narrow v1: flat vertical stack, one page, fixed block vocabulary.

- layout-spec.ts        — the LayoutSpec (ordered blocks: nav/hero/grid/feature/cta/footer)
- parse-layouttext.ts   — the ".layout" text format → LayoutSpec (no AI)
- generate-layout.ts    — LayoutSpec (+ tokens) → single-page React site
- layout-template/       — the page shell; src/blocks/ has the 6 block components

Run:  npm run layout examples/home.layout -- --out my-page
      (add --theme mockup.png to also apply Depth 1+2 styling)

The ".layout" format (examples/home.layout):
  layout "Acme"
  nav
  hero split-right      (centered | split-right | split-left)
  grid 3                (2 | 3 | 4)
  feature left          (left | right)
  cta
  footer

To add a block type: add a component in layout-template/src/blocks/, register it
in the BLOCKS map in layout-template/src/Page.jsx, add the type to BlockType in
layout-spec.ts, and handle it in parse-layouttext.ts.

NEXT: the vision path (image → LayoutSpec) — the hard, unreliable part — plus a
confirm/edit step. Deterministic text path is built and proven first (on purpose).
