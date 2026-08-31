# Website Engine

Draftboard's second engine turns a page/navigation description into a real
multi-page React website — and can theme it from a mockup image.

It lives entirely in `src/site/`, separate from the dashboard engine, but shares
the vision module (`src/vision/`).

## The pipeline

```
.site text ─┐
            ├─► SiteSpec (pages + nav) ─► site generator ─► multi-page React site
mockup img ─┘        + design tokens (theme)
```

Two inputs feed it:
- **`.site` text** → the pages and navigation (structure)
- **a mockup image** (optional) → design tokens (colors, font, corners, spacing)

## Quick start

```bash
# build a site with the default theme
npm run site examples/acme.site -- --out my-site

# build a site themed from a mockup (needs a vision model — qwen3-vl by default)
npm run site examples/acme.site -- --out my-site --theme path/to/mockup.png

# just see what design tokens a mockup produces (no site built)
npm run parse-tokens path/to/mockup.png

# then run the generated site
cd my-site
npm install
npm run dev
```

## The `.site` format

A simple text format (see `examples/acme.site`):

```
site "Acme Services"

page Home : hero
  -> Services
  -> Contact

page Services : list
  -> Contact

page Contact : form

page Login : auth
  -> Home
```

- `site "Name"` — names the whole site
- `page <Name> : <type>` — declares a page and its archetype
- `-> <Target>` — a navigation link to another page

## Page archetypes

Each page type maps to a layout template in `src/site/site-template/src/pages/`:

| Type | What it renders |
|------|-----------------|
| `hero` | Landing: headline, subtext, CTA buttons to linked pages |
| `list` | A grid of cards |
| `form` | A form (name/email/message) |
| `auth` | A login form (reuses Form) |
| `generic` | Fallback: title + placeholder blocks |

Unknown types fall back to `generic`.

## Design tokens (theming from a mockup)

This is "Level 3" — reading the visual **style** from a mockup image and applying
it to the generated site. It extracts a small, reliable set of tokens:

```json
{
  "primary": "#4f46e5",
  "accent": "#ff6b6b",
  "ink": "#14141b",
  "bg": "#ffffff",
  "radius": "medium",
  "font": "sans",
  "density": "comfortable",
  "buttonStyle": "filled",
  "buttonShape": "rounded",
  "inputStyle": "box",
  "cardStyle": "border",
  "shadow": "soft"
}
```

Palette & feel (Depth 1):
- `primary`/`accent`/`ink`/`bg` — colors (validated as hex)
- `radius` — none / small / medium / large (corner roundness)
- `font` — sans / serif / mono
- `density` — tight / comfortable / spacious (spacing)

Component styles (Depth 2) — read from the mockup's buttons, inputs, and cards:
- `buttonStyle` — filled / outline / soft
- `buttonShape` — sharp / rounded / pill
- `inputStyle` — box / underline / filled
- `cardStyle` — border / shadow / flat / elevated
- `shadow` — none / soft / strong (overall depth)

These become body `data-*` attributes and CSS variables, so the same site
templates restyle their components to echo the mockup — a design with ghost
pill buttons and underline inputs produces a site that mirrors that.

These become CSS variables in the generated site's stylesheet, re-theming the
same templates. Without `--theme`, the preset default is used (the adaptive
idea: preset when no design is given, extracted tokens when a mockup is).

### What it extracts, honestly

- **Best on a single, clean design.** A contact-sheet of many thumbnails, or a
  page mixing light and dark sections, gives a muddled read — there's no single
  design to extract. Feed it one coherent page.
- **Colors drift.** The model reads "roughly this blue," not always the exact
  hex. It's non-deterministic — the same image can give slightly different
  tokens run to run.
- **This is Depth 1 + Depth 2.** It captures colors/font/corners/spacing *and*
  component styles (button/input/card design). It does not reproduce page
  *layout* (where blocks go) — that's Depth 3, not built.
- If the model returns junk, the sanitizer falls back to sensible defaults
  rather than failing.

## Model

Uses the shared vision module. Default is `qwen3-vl` via Ollama (strong local
vision model). Override with `OLLAMA_MODEL` (e.g. `qwen3-vl:4b` for less memory)
or switch to Gemini with `VISION_PROVIDER=gemini`. Requires a recent Ollama.

## Honest scope

The website engine produces a **skeleton**: the right pages, working navigation,
placeholder content, themed to a mockup's palette. Real content, images, and
business logic are the user's to fill in — a diagram/mockup can't specify those.
This is the ceiling for every diagram-to-site tool, not a shortcoming of this one.
