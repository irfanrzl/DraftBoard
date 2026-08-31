import { z } from "zod";

/** Underlying data types a field can hold. */
export const FieldType = z.enum([
  "uuid",
  "string",
  "text",
  "int",
  "float",
  "bool",
  "enum",
  "date",
  "datetime",
  "json",
]);
export type FieldType = z.infer<typeof FieldType>;

/** How a field should be rendered in the generated UI. */
export const UiHint = z.enum([
  "hidden",
  "text",
  "textarea",
  "number",
  "toggle",
  "badge",
  "date-column",
  "image",
  "relation-picker",
  "nested-table",
]);
export type UiHint = z.infer<typeof UiHint>;

/** Special semantic roles a field can play. */
export const FieldRole = z.enum(["primary", "created", "updated", "title"]);
export type FieldRole = z.infer<typeof FieldRole>;

export const Field = z.object({
  name: z.string(),
  type: FieldType,
  ui: UiHint,
  role: FieldRole.optional(),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  /** Allowed values, only meaningful when type === "enum". */
  values: z.array(z.string()).optional(),
});
export type Field = z.infer<typeof Field>;

export const Relation = z.object({
  /** Local field holding the key. */
  field: z.string(),
  /** Target entity name. */
  to: z.string(),
  type: z.enum(["one-to-many", "many-to-one", "many-to-many"]),
  ui: z.enum(["nested-table", "relation-picker"]),
});
export type Relation = z.infer<typeof Relation>;

export const Entity = z.object({
  name: z.string(),
  label: z.string(),
  fields: z.array(Field),
  relations: z.array(Relation).default([]),
});
export type Entity = z.infer<typeof Entity>;

export const Spec = z.object({
  version: z.literal("1.0"),
  name: z.string(),
  entities: z.array(Entity),
});
export type Spec = z.infer<typeof Spec>;

/**
 * Parse and validate an unknown value into a Spec.
 * Throws a ZodError with a readable message on failure.
 */
export function parseSpec(input: unknown): Spec {
  return Spec.parse(input);
}
