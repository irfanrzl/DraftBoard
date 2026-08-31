# Website Pipeline (Phase 2 — planned, not built)

The long-term goal: also accept **UI-flow diagrams** (pages + navigation, like a
sitemap or user-flow) and generate a **multi-page website skeleton** — a parallel
pipeline alongside the existing ERD → dashboard one.

## Why it's a separate pipeline

An ERD and a UI-flow diagram are different things:

| | ERD (current) | UI-flow (this plan) |
|---|---|---|
| Boxes are | database tables | screens/pages |
| Arrows are | data relations | user navigation |
| Output | a data dashboard | a multi-page site |

They share the *shape* (input → intermediate spec → generator) but need different
contents at each stage.

## The plan

```
UI-flow diagram → SiteSpec (pages/nav) → site generator → multi-page React site
```

### 1. Input — reuse the vision module, new prompt
The vision machinery already reads images. A new prompt asks it to extract
**pages and navigation** instead of tables and fields.

### 2. SiteSpec — a new intermediate shape
```jsonc
{
  "pages": [
    { "name": "Login",   "type": "form",     "links": ["Landing"] },
    { "name": "Landing", "type": "hero",     "links": ["Team","Search","Contact"] },
    { "name": "Cart",    "type": "checkout", "links": [] }
  ]
}
```

### 3. Page-type library — the creative core
Like field heuristics were for the dashboard, this is a set of page templates:
form, hero, list, detail, map, chat-stub, checkout-stub. Each renders a sensible
placeholder layout for that kind of page.

### 4. Site generator
Emits a React site with **routing** between pages and each page's starter layout.

### 5. Auto-detect
Look at the extracted structure and decide: is this an ERD or a UI-flow? Route to
the right pipeline automatically.

## Honest scope note

A diagram can only produce a **skeleton**: the right pages, wired navigation, and
placeholder layouts. It fundamentally cannot infer real content, business logic,
payment processing, or real-time chat — that information isn't in the diagram.
This is the ceiling for *every* "diagram → website" tool, not a shortcoming of
this one. The output is a strong starting point the user then fills in.

## Effort

Roughly comparable to everything built so far — it's a second product sharing the
vision module and project-scaffolding approach with the first.
