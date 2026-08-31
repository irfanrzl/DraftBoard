// The instruction we give any vision model. Shared across all providers so they
// behave consistently. Tightening this prompt improves every backend at once.

export const VISION_SYSTEM_PROMPT = `You are a diagram parser. You are given an image of an entity-relationship diagram (ERD) from a tool like Figma, Miro, dbdiagram, or a whiteboard photo.

Extract the data model and return ONLY a JSON object. No prose, no markdown fences, no explanation. The JSON MUST match this shape exactly:

{
  "version": "1.0",
  "name": "<a short name for the whole schema>",
  "entities": [
    {
      "name": "<singular PascalCase machine name, e.g. User>",
      "label": "<plural display name, e.g. Users>",
      "fields": [
        {
          "name": "<field name>",
          "type": "<one of: uuid, string, text, int, float, bool, enum, date, datetime, json>",
          "ui": "<one of: hidden, text, textarea, number, toggle, badge, date-column, image, relation-picker, nested-table>",
          "role": "<optional, one of: primary, created, updated, title>",
          "values": ["<optional string array, only for enum fields>"]
        }
      ],
      "relations": [
        {
          "field": "<local field name holding the key>",
          "to": "<target entity name>",
          "type": "<one of: one-to-many, many-to-one, many-to-many>",
          "ui": "<one of: nested-table, relation-picker>"
        }
      ]
    }
  ]
}

Rules:
- Infer sensible types from field names when the diagram doesn't state them (created_at -> datetime, is_active -> bool, status -> enum, price -> float, email -> string).
- Mark the primary key with "role":"primary" and "ui":"hidden".
- Timestamps like created_at get "ui":"date-column".
- status/state fields get "ui":"badge".
- A field named like *_id that points at another table is a foreign key: give it "ui":"relation-picker" and add a matching "many-to-one" relation.
- Read arrows/crow's-feet to determine relation direction and cardinality. When a table holds a foreign key, it is the "many" side.
- If unsure about a value, choose the most reasonable default rather than omitting the field.
- Output valid JSON only.`;

export const VISION_USER_PROMPT =
  "Parse this ERD image into the Spec JSON described above.";
