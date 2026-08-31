# Architecture

Draftboard is a **pipeline**: a diagram goes in one end, a dashboard comes out
the other. Everything is organized around one idea in the middle — the **Spec**.

```
                          ┌─────────────┐
   DBML text ───────────▶ │             │
                          │             │
   Screenshot ─▶ vision ▶ │    Spec     │ ─▶ generator ─▶ dashboard
                          │  (JSON)     │
   (Mermaid, later) ────▶ │             │
                          └─────────────┘
```

## The Spec is the hub

The Spec is a plain JSON description of a data model: entities, their fields
(with a type and a UI hint), and the relations between them. It's defined and
validated in `src/spec.ts` using Zod.

Why it matters: **every input produces a Spec, and the generator only reads a
Spec.** So you can add new inputs (Mermaid, screenshots) without touching the
generator, and change the generator without touching the parsers. The Spec is
the contract that keeps the two ends independent.

## The files, by job

### Inputs (produce a Spec)
- `src/parser.ts` — DBML text → Spec. Contains the **heuristics**: the rules
  that decide each field's UI component (see `docs/HEURISTICS.md`). This is the
  "brain" of the text path.
- `src/parse-image.ts` — a screenshot → Spec, using the vision module.
- `src/vision/` — the swappable AI backend that reads images:
  - `types.ts` — the interface every backend implements ("the plug")
  - `prompt.ts` — the instruction given to the model (shared by all backends)
  - `ollama.ts` — local backend (free, default)
  - `gemini.ts` — cloud backend (for commercial use)
  - `sanitize.ts` — repairs common model mistakes before validation
  - `index.ts` — picks a backend based on `VISION_PROVIDER`

### The contract
- `src/spec.ts` — the Spec type + Zod validation. Nothing depends on anything
  else here; everything depends on this.

### Outputs (consume a Spec)
- `src/mock.ts` — generates sample rows so a new dashboard has data to show.
- `src/generate-html.ts` — Spec → one self-contained HTML file (quick preview).
- `src/generate-app.ts` — Spec → a full React + Vite project (the real thing).

### The generated app (a separate app)
- `app-template/` — a complete, generic React dashboard. It reads an injected
  `schema.js` (the Spec) and works for *any* data model. When you scaffold, this
  folder is copied out and `schema.js` + `seedData.js` are written into it.

### The entry point
- `src/cli.ts` — the command you run. Routes to parse / generate / scaffold for
  text, and parse-image / scaffold-image for screenshots.

## The key design choice

The generated dashboard is a **generic engine** that reads a schema, not a
hand-built app per diagram. Draftboard's job is just to write the schema and
sample data into that engine. This is why one small template supports unlimited
different dashboards — and why connecting real data later means changing only one
file (`app-template/src/store.jsx`), not regenerating anything.

## Where "creativity" lives

Not in an AI model — in two authored places:
1. The **heuristics** in `src/parser.ts` (field → UI decisions)
2. The **components** in `app-template/src/components/` (how each UI type looks)

AI is used in exactly one spot: reading a screenshot into a Spec. Everything else
is deterministic and testable.
