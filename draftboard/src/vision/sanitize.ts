// Vision models get the structure mostly right but make small mistakes:
// putting a relation type in a "role" slot, using unknown enum values, omitting
// required fields, etc. This cleans up the raw parsed object so it has the best
// chance of passing Spec validation. Better to repair than to reject.

const VALID_TYPES = new Set([
  "uuid", "string", "text", "int", "float", "bool", "enum", "date", "datetime", "json",
]);
const VALID_UI = new Set([
  "hidden", "text", "textarea", "number", "toggle", "badge",
  "date-column", "image", "relation-picker", "nested-table",
]);
const VALID_ROLES = new Set(["primary", "created", "updated", "title"]);
const VALID_REL_TYPES = new Set(["one-to-many", "many-to-one", "many-to-many"]);
const VALID_REL_UI = new Set(["nested-table", "relation-picker"]);

function pascal(name: string): string {
  return String(name)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("") || "Entity";
}

function pluralize(name: string): string {
  if (/[^aeiou]y$/i.test(name)) return name.replace(/y$/i, "ies");
  if (/(s|x|z|ch|sh)$/i.test(name)) return name + "es";
  return name + "s";
}

function uiForType(type: string, name: string, isPk: boolean): string {
  if (isPk) return "hidden";
  const n = name.toLowerCase();
  if (/password|secret|token/.test(n)) return "hidden";
  if (/avatar|image|photo|picture/.test(n)) return "image";
  if (n === "status" || n === "state") return "badge";
  if (/description|bio|notes|body|content/.test(n)) return "textarea";
  switch (type) {
    case "bool": return "toggle";
    case "enum": return "badge";
    case "text": return "textarea";
    case "int":
    case "float": return "number";
    case "date":
    case "datetime": return "date-column";
    default: return "text";
  }
}

/**
 * Repair a raw object from a vision model into something Spec.parse can accept.
 * Returns a cleaned object (still validated separately afterwards).
 */
export function sanitizeSpec(raw: any): any {
  const out: any = {
    version: "1.0",
    name: typeof raw?.name === "string" && raw.name.trim() ? raw.name.trim() : "App",
    entities: [],
  };

  const entities = Array.isArray(raw?.entities) ? raw.entities : [];
  for (const e of entities) {
    if (!e || typeof e !== "object") continue;
    const name = pascal(e.name ?? e.label ?? "Entity");
    const label =
      typeof e.label === "string" && e.label.trim() ? e.label.trim() : pluralize(name);

    const fields: any[] = [];
    const rawFields = Array.isArray(e.fields) ? e.fields : [];
    for (const f of rawFields) {
      if (!f || typeof f !== "object" || !f.name) continue;

      let type = String(f.type ?? "string").toLowerCase();
      if (!VALID_TYPES.has(type)) {
        // common aliases
        if (type.includes("var") || type.includes("char")) type = "string";
        else if (type.includes("time") || type.includes("date")) type = "datetime";
        else if (type.includes("bool")) type = "bool";
        else if (type.includes("int")) type = "int";
        else type = "string";
      }

      const isPk =
        f.role === "primary" ||
        f.pk === true ||
        String(f.name).toLowerCase() === "id";

      // role: drop anything not in the allowed set (this is the bug we hit).
      let role: string | undefined =
        typeof f.role === "string" && VALID_ROLES.has(f.role) ? f.role : undefined;
      if (isPk) role = "primary";

      // ui: use given if valid, else infer.
      let ui = typeof f.ui === "string" && VALID_UI.has(f.ui) ? f.ui : undefined;
      if (!ui) ui = uiForType(type, String(f.name), isPk);

      const field: any = { name: String(f.name), type, ui };
      if (role) field.role = role;
      if (f.required === true) field.required = true;
      if (f.unique === true) field.unique = true;
      if (Array.isArray(f.values) && f.values.length) {
        field.values = f.values.map(String);
      }
      fields.push(field);
    }

    // Ensure there's a primary key.
    if (!fields.some((f) => f.role === "primary")) {
      fields.unshift({ name: "id", type: "uuid", ui: "hidden", role: "primary" });
    }

    const relations: any[] = [];
    const rawRels = Array.isArray(e.relations) ? e.relations : [];
    for (const r of rawRels) {
      if (!r || typeof r !== "object" || !r.to) continue;
      let type = String(r.type ?? "many-to-one");
      if (!VALID_REL_TYPES.has(type)) type = "many-to-one";
      let ui =
        typeof r.ui === "string" && VALID_REL_UI.has(r.ui)
          ? r.ui
          : type === "one-to-many"
            ? "nested-table"
            : "relation-picker";
      relations.push({
        field: String(r.field ?? "id"),
        to: pascal(r.to),
        type,
        ui,
      });
    }

    out.entities.push({ name, label, fields, relations });
  }

  return out;
}
