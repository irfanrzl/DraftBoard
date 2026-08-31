# Roadmap

Where Draftboard is and where it's going. Checked = done and working.

## Done

### Core pipeline (ERD → dashboard)
- [x] **Parse DBML** text into a validated Spec (`src/parser.ts`, `src/spec.ts`)
- [x] **Heuristics** decide each field's UI (badge, date, relation, etc.)
- [x] **HTML preview** — one static file (`src/generate-html.ts`)
- [x] **Full React app** — a real, runnable, interactive dashboard
      (`src/generate-app.ts` + `app-template/`)
- [x] CRUD: list, search, sort, detail view, create/edit/delete, relations

### Screenshot → dashboard (the AI feature)
- [x] **Vision module**, swappable backend (`src/vision/`)
- [x] Ollama backend (free, local) — default
- [x] Gemini backend (cloud) — ready for commercial use
- [x] **Sanitizer** repairs common vision-model mistakes before validation
- [x] Retry-on-failure, clear errors when the model can't read the image

### Housekeeping
- [x] Flattened from a monorepo into one simple project
- [x] Sensible defaults (127.0.0.1, llava) so no env vars needed to run

## Next (dashboard side)

- [x] **Mermaid ERD input** — accepts Mermaid text as well as DBML
      (`src/parse-mermaid.ts` → same Spec, everything downstream works)
- [ ] **Better screenshot accuracy** — update to llama3.2-vision, or Gemini
- [ ] **A confirm/edit step** — show the extracted Spec and let the user fix it
      before generating (useful because vision isn't 100% reliable)

## Next (making it a product)

- [x] **Web interface** — a local page where you paste a diagram or upload a
      screenshot and get the dashboard, with live preview + download. Run it
      with `npm run web`. (Reused by the website pipeline later.)
- [ ] **Deploy it online** — put the web interface on a server so others can use
      it. Needs switching screenshot input from Ollama to Gemini (already built).

## The second engine: UI-flow → website (in progress)

A parallel pipeline for a different kind of diagram (pages + navigation). Lives
in `src/site/`. See `docs/WEBSITE-PIPELINE.md` for the full plan.

- [x] A `SiteSpec` shape (pages, types, navigation) — `src/site/site-spec.ts`
- [x] A `.site` text input — `src/site/parse-sitetext.ts` (test without AI)
- [x] Site generator → real multi-page React + Router site — `src/site/generate-site.ts`
- [x] Page archetypes: hero, list, form, generic (auth/detail reuse these)
- [x] Design tokens (Level 3, Depth 1): read colors/font/corners/spacing from a
      mockup and theme the site. `--theme mockup.png` or `parse-tokens`.
- [ ] Depth 2: component styles (button shape, input style, card treatment)
- [ ] Depth 3: page layout reproduction (hard — where even v0/Figma are imperfect)
- [ ] More archetypes (map, chat-stub, checkout-stub, dashboard reuse)
- [ ] "Pages" vision prompt so screenshots → SiteSpec
- [ ] Auto-detect ERD vs UI-flow and route to the right engine
- [ ] Offer website mode in the web interface

## Non-goals (for now)

- Real database/backend generation (the dashboard uses in-memory data; swapping
  `store.jsx` for API calls is the future path)
- Deployable, business-complete sites from a diagram alone (a diagram can only
  produce a skeleton — payment logic, real content, etc. aren't in the picture)
