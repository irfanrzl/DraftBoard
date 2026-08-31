# Vision (reading images)

Draftboard uses an AI vision model to read images. This is the only part of the
product that needs AI — text inputs (DBML, Mermaid, `.site`) never do. One
swappable module (`src/vision/`) serves two jobs:

1. **Reading diagrams** — an ERD screenshot → a dashboard `Spec`.
2. **Reading design** — a mockup image → `DesignTokens` for a website's theme.

## Models and backends

The module is swappable. Which model reads the image is set by two environment
variables:

| Variable | Values | Meaning |
|----------|--------|---------|
| `VISION_PROVIDER` | `ollama` (default) / `gemini` | which backend |
| `OLLAMA_MODEL` | e.g. `qwen3-vl` (default), `qwen3-vl:4b` | which local model |
| `GEMINI_API_KEY` | your key | required when provider is `gemini` |

Everything downstream is identical regardless of backend.

### Local (Ollama) — default, free, private

1. Install Ollama from https://ollama.com (use a recent version — older versions
   fail to load newer vision models).
2. Pull the default model:
   ```bash
   ollama pull qwen3-vl
   ```
   Tight on memory? Use `qwen3-vl:4b` and set `OLLAMA_MODEL=qwen3-vl:4b`.
3. Ollama runs in the background automatically.

`qwen3-vl` is a strong local vision model, good at both diagram structure and
design. On Windows, if the model can't be reached, the module defaults to
`127.0.0.1` (not `localhost`) to avoid an IPv6 resolution quirk.

### Cloud (Gemini) — for scale / commercial use

1. Get a key at https://aistudio.google.com/apikey (free tier available).
2. Set `VISION_PROVIDER=gemini` and `GEMINI_API_KEY=...`.

One business key serves all your users — they never need their own account. This
is the path for putting the product online, where a server can't run local Ollama.

## Reading diagrams (ERD → dashboard)

```bash
# just print what was extracted
npm run parse-image path/to/erd.png

# read the image AND build the dashboard
npm run scaffold-image path/to/erd.png -- --out my-dashboard
```

The raw model output is repaired by `src/vision/sanitize.ts` (fixing common
mistakes like an invalid enum value) before it's validated, and retried once if
the first parse fails. If it still can't produce a valid schema, it tells you and
suggests exporting the diagram as DBML/Mermaid text instead.

## Reading design (mockup → theme)

```bash
# just print the extracted design tokens
npm run parse-tokens path/to/mockup.png

# build a website themed from a mockup
npm run site examples/acme.site -- --out my-site --theme path/to/mockup.png
```

See `WEBSITE-ENGINE.md` for what the tokens are and how they theme a site.

## Honest expectations

- **Always eyeball the result.** Vision output is not 100% reliable — use
  `parse-image` / `parse-tokens` to check before building.
- **Feed one clean image.** A single diagram or a single coherent design reads
  well; a busy sheet of many thumbnails, or a page mixing light and dark
  sections, gives a muddled read.
- **Quality tracks the model.** `qwen3-vl` is good locally; Gemini/Claude read
  more accurately, especially for subtle design detail.
- **It's non-deterministic.** The same image can give slightly different results
  run to run. That's the nature of vision models, not a bug.
