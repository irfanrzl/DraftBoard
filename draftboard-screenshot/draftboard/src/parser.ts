// Parser: reads DBML text and turns it into a validated Spec.
// Includes the heuristics that decide each field's UI component.

import { Parser } from "@dbml/core";
import {
  parseSpec,
  type Spec,
  type Entity,
  type Field,
  type Relation,
  type FieldType,
  type UiHint,
  type FieldRole,
} from "./spec.js";

/** Map a raw DBML/SQL type string to our FieldType. */
export function inferType(rawType: string): FieldType {
  const t = rawType.toLowerCase();
  if (t.includes("uuid")) return "uuid";
  if (t.includes("bool")) return "bool";
  if (t.includes("timestamp") || t.includes("datetime")) return "datetime";
  if (t.includes("date")) return "date";
  if (t.includes("json")) return "json";
  if (t.includes("text")) return "text";
  if (
    t.includes("int") ||
    t.includes("serial") ||
    t.includes("bigint") ||
    t.includes("smallint")
  )
    return "int";
  if (
    t.includes("float") ||
    t.includes("double") ||
    t.includes("decimal") ||
    t.includes("numeric") ||
    t.includes("real")
  )
    return "float";
  // varchar, char, string, and anything unknown -> string
  return "string";
}

/** Detect a special semantic role from the field name / primary-key flag. */
export function inferRole(name: string, isPk: boolean): FieldRole | undefined {
  if (isPk) return "primary";
  const n = name.toLowerCase();
  if (n === "created_at" || n === "created" || n === "inserted_at")
    return "created";
  if (n === "updated_at" || n === "updated" || n === "modified_at")
    return "updated";
  if (n === "title" || n === "name") return "title";
  return undefined;
}

/**
 * Choose a UI component for a field, layering name-based overrides on top of
 * type defaults. Precedence: role (handled by caller) > name > type.
 */
export function inferUi(
  name: string,
  type: FieldType,
  isPk: boolean,
): UiHint {
  if (isPk) return "hidden";

  const n = name.toLowerCase();

  // name-based overrides
  if (/password|secret|token/.test(n)) return "hidden";
  if (/avatar|image|photo|picture/.test(n)) return "image";
  if (n.endsWith("_url") || n === "url" || n === "link") return "text";
  if (/^(is_|has_)/.test(n)) return "toggle";
  if (n === "status" || n === "state" || n === "role") return "badge";
  if (/description|bio|notes|body|content/.test(n)) return "textarea";

  // type defaults
  switch (type) {
    case "bool":
      return "toggle";
    case "enum":
      return "badge";
    case "text":
      return "textarea";
    case "int":
    case "float":
      return "number";
    case "date":
    case "datetime":
      return "date-column";
    case "json":
      return "textarea";
    default:
      return "text";
  }
}



function pluralize(name: string): string {
  if (/[^aeiou]y$/i.test(name)) return name.replace(/y$/i, "ies");
  if (/(s|x|z|ch|sh)$/i.test(name)) return name + "es";
  return name + "s";
}

function singularToPascal(name: string): string {
  // "users" -> "User", "blog_posts" -> "BlogPost"
  const singular = name.replace(/ies$/i, "y").replace(/s$/i, "");
  return singular
    .split(/[_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/**
 * Parse a DBML string into a validated Spec.
 * @param dbml raw DBML source
 * @param schemaName name for the whole schema (defaults to "App")
 */
export function parseDbml(dbml: string, schemaName = "App"): Spec {
  const parser = new Parser();
  const db = parser.parse(dbml, "dbml");

  // @dbml/core returns a Database with one or more schemas.
  const schema = db.schemas[0];

  // Build a quick lookup so relations can reference entity names.
  const tableToEntity = new Map<string, string>();
  for (const table of schema.tables) {
    tableToEntity.set(table.name, singularToPascal(table.name));
  }

  const entities: Entity[] = schema.tables.map((table): Entity => {
    const pkNames = new Set<string>();
    for (const field of table.fields) {
      if (field.pk) pkNames.add(field.name);
    }

    const fields: Field[] = table.fields.map((f): Field => {
      const isPk = !!f.pk;
      const type = inferType(String(f.type?.type_name ?? f.type ?? "varchar"));
      const role = inferRole(f.name, isPk);
      const ui = inferUi(f.name, type, isPk);

      const field: Field = { name: f.name, type, ui };
      if (role) field.role = role;
      if (f.not_null) field.required = true;
      if (f.unique) field.unique = true;
      return field;
    });

    const entityName = singularToPascal(table.name);
    return {
      name: entityName,
      label: pluralize(entityName),
      fields,
      relations: [], // filled in below
    };
  });

  const byName = new Map(entities.map((e) => [e.name, e]));

  // Relations: @dbml/core exposes refs at the schema level.
  for (const ref of schema.refs) {
    // ref.endpoints[0] and [1]; relation.[0] is one side, [1] the other.
    const [a, b] = ref.endpoints;
    const aEntity = tableToEntity.get(a.tableName);
    const bEntity = tableToEntity.get(b.tableName);
    if (!aEntity || !bEntity) continue;

    const aField = a.fieldNames[0];
    const bField = b.fieldNames[0];

    // relation "*" = many, "1" = one
    const aMany = a.relation === "*";
    const bMany = b.relation === "*";

    if (aMany && !bMany) {
      // a has many-to-one to b (a holds the FK)
      addRelation(byName.get(aEntity), {
        field: aField,
        to: bEntity,
        type: "many-to-one",
        ui: "relation-picker",
      });
      addRelation(byName.get(bEntity), {
        field: bField,
        to: aEntity,
        type: "one-to-many",
        ui: "nested-table",
      });
    } else if (!aMany && bMany) {
      addRelation(byName.get(bEntity), {
        field: bField,
        to: aEntity,
        type: "many-to-one",
        ui: "relation-picker",
      });
      addRelation(byName.get(aEntity), {
        field: aField,
        to: bEntity,
        type: "one-to-many",
        ui: "nested-table",
      });
    } else {
      // fallback: treat as many-to-one from a to b
      addRelation(byName.get(aEntity), {
        field: aField,
        to: bEntity,
        type: "many-to-one",
        ui: "relation-picker",
      });
    }
  }

  // Upgrade foreign-key fields to a relation-picker UI now that relations exist.
  for (const entity of entities) {
    for (const rel of entity.relations) {
      if (rel.type !== "many-to-one") continue;
      const fkField = entity.fields.find((f) => f.name === rel.field);
      if (fkField && fkField.role !== "primary") {
        fkField.ui = "relation-picker";
      }
    }
  }

  const spec = {
    version: "1.0" as const,
    name: schemaName,
    entities,
  };

  // Validate before returning — the parser's only contract.
  return parseSpec(spec);
}

function addRelation(entity: Entity | undefined, relation: Relation): void {
  if (!entity) return;
  const exists = entity.relations.some(
    (r) => r.to === relation.to && r.field === relation.field && r.type === relation.type,
  );
  if (!exists) entity.relations.push(relation);
}
