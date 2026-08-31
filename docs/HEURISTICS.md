# Heuristics (dashboard field → UI)

The rules that turn a database field's **type and name** into a **UI component**
in the dashboard engine. This is the core judgment of that engine — encoded
design decisions, not AI guesses. They live in `src/parser.ts` (`inferType`,
`inferRole`, `inferUi`) and are reused by the Mermaid parser.

## Type → UI component

| Data type | Rendered as |
|-----------|-------------|
| `uuid` (primary key) | hidden |
| `string` | text |
| `text` | textarea |
| `int` / `float` | number (right-aligned) |
| `bool` | toggle (Yes/No) |
| `enum` | colored badge |
| `date` / `datetime` | formatted date column |
| `json` | textarea |

## Name-based overrides (layered on top of type)

These fire on the field *name*, making the output feel smart:

| Field name matches | Becomes |
|--------------------|---------|
| `email` | text (extensible to a mailto link) |
| `avatar*`, `image*`, `photo*`, `picture*` | image thumbnail |
| `password`, `secret`, `token` | hidden |
| `status`, `state`, `role` | colored badge |
| `description`, `bio`, `notes`, `body`, `content` | textarea |
| `is_*`, `has_*` | toggle |
| a foreign key (`*_id` pointing at a table) | relation-picker |

## Role detection

Some fields get a special semantic role:

| Condition | Role | Effect |
|-----------|------|--------|
| primary key | `primary` | hidden in tables/forms, used as the row id |
| `created_at`, `created`, `inserted_at` | `created` | read-only date |
| `updated_at`, `updated`, `modified_at` | `updated` | read-only date |
| `name`, `title` | `title` | used as the record's headline in detail views |

## Relations

When the parser sees a foreign key, it wires **both** directions:

- The table holding the key gets a **many-to-one** relation (a dropdown /
  relation-picker in the UI).
- The referenced table gets the matching **one-to-many** relation (a nested
  table of children on its detail page).

## Precedence (when rules conflict)

1. `role` (primary always wins → hidden)
2. explicit `ui` hint already in the Spec
3. name override (e.g. `status` → badge)
4. type default

## Why this is the valuable part

Anyone can ask an AI to "make a dashboard." What makes Draftboard consistent is
this curated set of rules — it produces sensible dashboards *deterministically*,
no API call needed. Growing this table makes every generated dashboard smarter at
once. The same repair logic also lives in `src/vision/sanitize.ts`, which cleans
up vision-model output before it's validated.
