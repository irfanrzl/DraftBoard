# Roadmap

## Design decisions — why this is built the way it is

Draftboard didn't start as a single Gemini call. The first version parsed a
diagram into a validated schema (a fixed vocabulary of component types), then
rendered that schema through hand-written templates. That approach had a real
guarantee: every rendered element had actual, tested code behind it. It also
had a real ceiling — output was limited to whatever was in the vocabulary,
and content that didn't fit the schema got dropped rather than shown.

The current version trades that guarantee for range: the input goes to
Gemini with a single, carefully-written prompt (four fidelity criteria —
layout, content, navigation, design — see `server/prompt.ts`), and whatever
Gemini writes back *is* the page. No schema in between, no vocabulary
ceiling. The honest cost of that trade: there's currently no mechanical check
on the result. A generated page could have a broken internal link or an
inconsistent layout and nothing would catch it before it's shown.

Neither version is "better" in the abstract — they're different answers to
a reliability-vs-flexibility tradeoff. This version is the flexibility
answer, on purpose.

## What's next

- [ ] **Deterministic output validation.** Before showing a generated page,
      check things that have a fixed, objective answer regardless of what
      the input was — every `href="#slug"` has a matching `id="slug"` in
      the same document, the HTML isn't truncated, the output isn't
      suspiciously empty. This costs no extra API call (pure parsing, no
      model involved) and would catch real bugs like a nav link pointing
      nowhere. Deliberately narrow: it can only ever catch mechanical
      breakage, never judge whether the output is actually good.
- [ ] **Optional refine pass.** A second, user-triggered Gemini call that
      checks the generated page broadly against the same four fidelity
      criteria and fixes what's wrong — generic design, content that
      doesn't match the input, layout drift. Opt-in, not automatic: this
      spends a real request, and the free tier is capped at 20/day, so it
      should be a deliberate choice, not a cost every generation pays
      whether it needs it or not.
- [ ] **Connecting to real data.** Both the dashboard and website outputs
      currently run on placeholder in-memory data. Wiring a generated
      dashboard to a real database/API is the natural next step once the
      draft itself is trustworthy enough to build on.
- [ ] **Multi-turn refinement.** Right now, fixing something wrong means
      re-generating from scratch and hoping the result is better. A chat-
      style follow-up ("make the nav a sidebar instead") would be a much
      more usable way to iterate on a draft.

## Explicitly not planned

**Training or hosting a custom model.** Every serious tool in this space —
this one included — is a thin, well-designed layer over an existing
foundation model, not a competing model. The edge available to a small
project is in the prompt, the verification layer, and the workflow around
the model call, not in the model itself.
