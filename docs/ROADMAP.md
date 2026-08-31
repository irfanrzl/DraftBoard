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

- [ ] **Mermaid ERD input** — accept Mermaid text as well as DBML
      (new file `src/parse-mermaid.ts` → same Spec, everything downstream works)
- [ ] **Better screenshot accuracy** — update to llama3.2-vision, or Gemini
- [ ] **A confirm/edit step** — show the extracted Spec and let the user fix it
      before generating (useful because vision isn't 100% reliable)

## Next (making it a product)

- [ ] **Web interface** — a page where you paste a diagram or upload a
      screenshot and get the dashboard, instead of the command line. This is the
      bridge to real users and reused by the website pipeline later.

## Later (the bigger vision: UI-flow → website)

A second, parallel pipeline for a different kind of diagram (pages + navigation,
not tables + relations). See `docs/WEBSITE-PIPELINE.md` for the plan.

- [ ] New "pages" prompt for the vision model
- [ ] A `SiteSpec` shape (pages, types, navigation)
- [ ] A page-type library (form, hero, list, map, chat-stub, checkout-stub)
- [ ] A site generator that emits a multi-page React app with routing
- [ ] Auto-detect ERD vs UI-flow and route to the right pipeline

## Non-goals (for now)

- Real database/backend generation (the dashboard uses in-memory data; swapping
  `store.jsx` for API calls is the future path)
- Deployable, business-complete sites from a diagram alone (a diagram can only
  produce a skeleton — payment logic, real content, etc. aren't in the picture)
