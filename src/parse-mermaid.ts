// Parses Mermaid ERD text (erDiagram) into the same Spec as the DBML parser.
// Reuses the shared heuristics so field UI decisions stay consistent.
import {
  parseSpec,
  type Spec,
  type Entity,
  type Field,
  type Relation,
} from "./spec.js";
import { inferType, inferRole, inferUi } from "./parser.js";

function pascal(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("") || "Entity";
}

function pluralize(name: string): string {
  if (/[^aeiou]y$/i.test(name)) return name.replace(/y$/i, "ies");
  if (/(s|x|z|ch|sh)$/i.test(name)) return name + "es";
  return name + "s";
}

// Cardinality: the side touching the entity tells us "one" vs "many".
// Left symbols end at the "--": ||, }o, }|, o|, etc.
// Right symbols start after "--": o{, |{, ||, |o, etc.
function isMany(symbol: string): boolean {
  return symbol.includes("{") || symbol.includes("}");
}

interface RawRel {
  left: string;
  right: string;
  leftMany: boolean;
  rightMany: boolean;
}

/**
 * Parse Mermaid erDiagram text into a validated Spec.
 */
export function parseMermaid(text: string, schemaName = "App"): Spec {
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  const entities = new Map<string, Entity>();
  const rawFields = new Map<string, { type: string; name: string; key: string }[]>();
  const rawRels: RawRel[] = [];

  let currentEntity: string | null = null;

  const relRegex =
    /^(\w+)\s+([|}o][|o{}-]*)--([|o{}-]*[|{}o])\s+(\w+)\s*:\s*(.+)?$/;

  for (const line of lines) {
    if (!line || line.startsWith("%%") || line === "erDiagram") continue;

    // End of an entity block
    if (line === "}") {
      currentEntity = null;
      continue;
    }

    // Inside an entity block: "type name KEY" or "type name"
    if (currentEntity) {
      // strip any inline comment
      const clean = line.replace(/"[^"]*"/g, "").trim();
      const parts = clean.split(/\s+/);
      if (parts.length >= 2) {
        const [type, name, key = ""] = parts;
        rawFields.get(currentEntity)!.push({ type, name, key: key.toUpperCase() });
      }
      continue;
    }

    // Entity block start: "NAME {"
    const blockStart = line.match(/^(\w+)\s*\{$/);
    if (blockStart) {
      const raw = blockStart[1];
      currentEntity = raw;
      if (!rawFields.has(raw)) rawFields.set(raw, []);
      continue;
    }

    // Relationship line
    const rel = line.match(relRegex);
    if (rel) {
      const [, left, leftSym, rightSym, right] = rel;
      rawRels.push({
        left,
        right,
        leftMany: isMany(leftSym),
        rightMany: isMany(rightSym),
      });
      // ensure both entities exist even if they have no field block
      if (!rawFields.has(left)) rawFields.set(left, []);
      if (!rawFields.has(right)) rawFields.set(right, []);
      continue;
    }
  }

  // Build entities from collected fields.
  const rawToName = new Map<string, string>();
  for (const [raw, fields] of rawFields) {
    const name = pascal(raw);
    rawToName.set(raw, name);

    let mappedFields: Field[] = fields.map((f) => {
      const isPk = f.key === "PK";
      const type = inferType(f.type);
      const role = inferRole(f.name, isPk);
      const ui = inferUi(f.name, type, isPk);
      const field: Field = { name: f.name, type, ui };
      if (role) field.role = role;
      return field;
    });

    // Ensure a primary key exists.
    if (!mappedFields.some((f) => f.role === "primary")) {
      mappedFields.unshift({ name: "id", type: "uuid", ui: "hidden", role: "primary" });
    }

    entities.set(name, {
      name,
      label: pluralize(name),
      fields: mappedFields,
      relations: [],
    });
  }

  // Wire relations.
  for (const r of rawRels) {
    const leftName = rawToName.get(r.left);
    const rightName = rawToName.get(r.right);
    if (!leftName || !rightName) continue;
    const leftEntity = entities.get(leftName);
    const rightEntity = entities.get(rightName);
    if (!leftEntity || !rightEntity) continue;

    // one-to-many: left is one, right is many  (USER ||--o{ ORDER)
    if (!r.leftMany && r.rightMany) {
      addRelation(leftEntity, {
        field: leftEntity.fields.find((f) => f.role === "primary")?.name ?? "id",
        to: rightName,
        type: "one-to-many",
        ui: "nested-table",
      });
      // the FK on the child side
      const fk = guessFk(rightEntity, leftName);
      addRelation(rightEntity, {
        field: fk,
        to: leftName,
        type: "many-to-one",
        ui: "relation-picker",
      });
      upgradeFk(rightEntity, fk);
    } else if (r.leftMany && !r.rightMany) {
      // mirror image
      addRelation(rightEntity, {
        field: rightEntity.fields.find((f) => f.role === "primary")?.name ?? "id",
        to: leftName,
        type: "one-to-many",
        ui: "nested-table",
      });
      const fk = guessFk(leftEntity, rightName);
      addRelation(leftEntity, {
        field: fk,
        to: rightName,
        type: "many-to-one",
        ui: "relation-picker",
      });
      upgradeFk(leftEntity, fk);
    } else if (r.leftMany && r.rightMany) {
      addRelation(leftEntity, {
        field: leftEntity.fields.find((f) => f.role === "primary")?.name ?? "id",
        to: rightName,
        type: "many-to-many",
        ui: "nested-table",
      });
    } else {
      // one-to-one: treat as many-to-one from right to left
      const fk = guessFk(rightEntity, leftName);
      addRelation(rightEntity, {
        field: fk,
        to: leftName,
        type: "many-to-one",
        ui: "relation-picker",
      });
    }
  }

  const spec = {
    version: "1.0" as const,
    name: schemaName,
    entities: Array.from(entities.values()),
  };

  return parseSpec(spec);
}

/** Find a foreign-key field on the child entity pointing at the parent. */
function guessFk(child: Entity, parentName: string): string {
  const snake = parentName.toLowerCase() + "_id";
  const existing = child.fields.find((f) => f.name.toLowerCase() === snake);
  if (existing) return existing.name;
  // fall back to any *_id field, else create the conventional one
  const anyFk = child.fields.find((f) => /_id$/i.test(f.name) && f.role !== "primary");
  if (anyFk) return anyFk.name;
  child.fields.push({ name: snake, type: "uuid", ui: "relation-picker" });
  return snake;
}

function upgradeFk(entity: Entity, fieldName: string): void {
  const f = entity.fields.find((x) => x.name === fieldName);
  if (f && f.role !== "primary") f.ui = "relation-picker";
}

function addRelation(entity: Entity, relation: Relation): void {
  const exists = entity.relations.some(
    (r) => r.to === relation.to && r.field === relation.field && r.type === relation.type,
  );
  if (!exists) entity.relations.push(relation);
}
