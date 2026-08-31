import { z } from "zod";

// LayoutSpec describes ONE page as a flat, ordered stack of blocks.
// This is the Depth 3 contract: it captures the arrangement of a page
// (which blocks, in what order, with a few layout options each) — not just
// its style. Deliberately narrow: no nesting, a small fixed vocabulary.

export const BlockType = z.enum([
  "nav",
  "hero",
  "grid",
  "feature",
  "cta",
  "footer",
]);
export type BlockType = z.infer<typeof BlockType>;

export const Block = z.object({
  type: BlockType,
  // hero: how it's arranged
  variant: z.enum(["centered", "split-right", "split-left"]).optional(),
  // grid: how many columns
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  // feature: which side the image sits
  imageSide: z.enum(["left", "right"]).optional(),
  // optional label/heading override
  heading: z.string().optional(),
});
export type Block = z.infer<typeof Block>;

export const LayoutSpec = z.object({
  version: z.literal("1.0"),
  name: z.string(),
  blocks: z.array(Block),
});
export type LayoutSpec = z.infer<typeof LayoutSpec>;

export function parseLayoutSpec(input: unknown): LayoutSpec {
  return LayoutSpec.parse(input);
}
