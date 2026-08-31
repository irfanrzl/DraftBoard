# Architecture

Draftboard is one product with **two engines** that share a common approach and a
common AI-vision module. Each engine is a pipeline: something goes in, an
intermediate spec is produced, a generator turns that spec into a runnable
project.

```
                 ┌──────────────── shared ────────────────┐
                 │            src/vision/                  │
                 │   reads images (diagrams, mockups)      │
                 └───────────────┬─────────────────────────┘
                                 │
   DASHBOARD ENGINE              │            WEBSITE ENGINE
   ───────────────              │            ──────────────
   DBML / Mermaid text ─┐       │       ┌─ .site text
   ERD screenshot ──────┼─► Spec │ Spec ─┤
                        │   (JSON)│(Site) │  mockup image ─► design tokens
                        ▼        ▼        ▼
                   generate-app       generate-site
                        │                 │
                        ▼                 ▼
                 React dashboard    React multi-page site
```

The guiding idea, in both engines: **inputs converge on one intermediate spec,
and generators read only that spec.** New inputs can be added without touching
generators; generators can change without touching inputs.

## Dashboard engine

Turns a database schema into an interactive admin dashboard.

- **Inputs** (all produce the same `Spec`):
  - `src/parser.ts` — DBML text. Holds the heuristics that decide each field's
    UI (see `HEURISTICS.md`).
  - `src/parse-mermaid.ts` — Mermaid ERD text. Reuses the same heuristics.
  - `src/parse-image.ts` — an ERD screenshot, via the vision module.
- **Contract:** `src/spec.ts` — the `Spec` (entities, fields, relations),
  validated with Zod.
- **Generators:**
  - `src/generate-html.ts` — one self-contained HTML preview.
  - `src/generate-app.ts` — a full React + Vite project (CRUD, search, relations).
  - `src/mock.ts` — sample data so a new dashboard has rows to show.
- **Generated app:** `app-template/` — a generic dashboard that reads an injected
  `schema.js` and works for any data model.

## Website engine

Turns a page/navigation description into a multi-page website, optionally themed
from a mockup. Lives in `src/site/`.

- **Inputs:**
  - `src/site/parse-sitetext.ts` — the `.site` text format → `SiteSpec`.
  - `src/site/extract-tokens.ts` — a mockup image → `DesignTokens`, via the
    vision module.
- **Contracts:**
  - `src/site/site-spec.ts` — the `SiteSpec` (pages, types, navigation).
  - `src/site/design-tokens.ts` — the `DesignTokens` (colors, font, corners,
    spacing) + the token→CSS mapping.
- **Generator:** `src/site/generate-site.ts` — `SiteSpec` (+ tokens) → a React +
  Vite + React Router site.
- **Generated app:** `src/site/site-template/` — a generic site whose pages are
  rendered by archetype components (`hero`, `list`, `form`, `generic`).

See `WEBSITE-ENGINE.md` for the full website engine detail.

## The shared vision module

`src/vision/` reads images for both engines. It's swappable and prompt-flexible:

- `types.ts` — the `VisionProvider` interface. `readDiagram()` takes an image and
  optional custom prompts, so the same module reads ERDs *and* design mockups.
- `ollama.ts` — local backend (default model `qwen3-vl`).
- `gemini.ts` — cloud backend (for scale / commercial use).
- `index.ts` — picks a backend via `VISION_PROVIDER`.
- `prompt.ts` — the ERD-reading prompt; `sanitize.ts` — repairs model output
  before validation.

Only image inputs use AI. All text inputs (DBML, Mermaid, `.site`) are
deterministic.

## The interface layer

- `src/cli.ts` — the command line for every capability.
- `src/server.ts` + `web/` — a local web app (currently the dashboard side):
  paste a diagram or upload a screenshot, preview, download.

## Design principles

- **One spec per engine is the contract.** Parsers never talk to generators
  directly.
- **AI is used only for images, and only where nothing else can substitute.**
  The deterministic text paths always work without a model.
- **Generated apps are generic engines** that read injected data (`schema.js`,
  `site.js`, tokens), not hand-built per input. One template, unlimited outputs.
- **Honesty over magic.** Outputs are strong *skeletons*; what a diagram or
  mockup can't specify (real content, business logic, pixel-exact layout) is left
  to the user.
