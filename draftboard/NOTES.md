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
That's the whole switch. See docs-screenshot.md.

**Why swappable:** free/local now for me; when I commercialize, flip to Gemini
so one business key serves all users (they don't each need an account). The
dashboard generator never changes — only the "image reader" plug does.
