import type { Spec, Entity, Field } from "./spec.js";

/** A single generated row: field name -> value. */
export type MockRow = Record<string, unknown>;

const FIRST_NAMES = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie"];
const LAST_NAMES = ["Lee", "Patel", "Garcia", "Chen", "Ahmad", "Silva", "Khan", "Nguyen"];
const WORDS = ["draft", "review", "launch", "update", "note", "plan", "report", "idea"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function sampleValue(field: Field, rowIndex: number): unknown {
  const n = field.name.toLowerCase();

  // name-based sensible values
  if (n === "email") return `${pick(FIRST_NAMES, rowIndex).toLowerCase()}@example.com`;
  if (n === "name" || field.role === "title") {
    return `${pick(FIRST_NAMES, rowIndex)} ${pick(LAST_NAMES, rowIndex)}`;
  }
  if (n === "title") return `${pick(WORDS, rowIndex)} ${rowIndex + 1}`;
  if (/avatar|image|photo|picture/.test(n) || field.ui === "image") {
    return `https://i.pravatar.cc/64?img=${(rowIndex % 70) + 1}`;
  }
  if (n === "status" || n === "state") {
    return pick(field.values ?? ["active", "pending", "archived"], rowIndex);
  }

  // type-based values
  switch (field.type) {
    case "uuid":
      return `${field.name}-${rowIndex + 1}`;
    case "bool":
      return rowIndex % 2 === 0;
    case "int":
      return (rowIndex + 1) * 7;
    case "float":
      return Number(((rowIndex + 1) * 3.5).toFixed(2));
    case "date":
    case "datetime": {
      const d = new Date(2026, 0, 1 + rowIndex * 3, 9, 30);
      return d.toISOString();
    }
    case "enum":
      return pick(field.values ?? ["one", "two", "three"], rowIndex);
    case "text":
      return `Some ${pick(WORDS, rowIndex)} content for row ${rowIndex + 1}.`;
    case "json":
      return { key: pick(WORDS, rowIndex), n: rowIndex };
    default:
      return `${field.name} ${rowIndex + 1}`;
  }
}

/** Generate `count` mock rows for one entity. */
export function mockRows(entity: Entity, count = 5): MockRow[] {
  const rows: MockRow[] = [];
  for (let i = 0; i < count; i++) {
    const row: MockRow = {};
    for (const field of entity.fields) {
      row[field.name] = sampleValue(field, i);
    }
    rows.push(row);
  }
  return rows;
}

/** Generate mock data for every entity in a spec. */
export function mockData(spec: Spec, count = 5): Record<string, MockRow[]> {
  const data: Record<string, MockRow[]> = {};
  for (const entity of spec.entities) {
    data[entity.name] = mockRows(entity, count);
  }

  // Wire foreign keys to real parent IDs so related records actually link up.
  for (const entity of spec.entities) {
    const pkField = entity.fields.find((f) => f.role === "primary");
    if (!pkField) continue;
    const primaryName = pkField.name;
    for (const rel of entity.relations ?? []) {
      if (rel.type !== "many-to-one") continue;
      const parents = data[rel.to];
      const parentPk = spec.entities
        .find((e) => e.name === rel.to)
        ?.fields.find((f) => f.role === "primary");
      if (!parents || !parentPk || parents.length === 0) continue;
      data[entity.name].forEach((row, i) => {
        row[rel.field] = parents[i % parents.length][parentPk.name];
      });
    }
  }

  return data;
}
