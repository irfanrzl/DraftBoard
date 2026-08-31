import { z } from "zod";

// The SiteSpec is the contract for the website engine, parallel to the
// dashboard's Spec. A UI-flow diagram (or .site text) becomes a SiteSpec, and
// the site generator reads only this.

/** Page archetypes. Each maps to a layout template in archetypes/. */
export const PageType = z.enum([
  "hero", // landing page: headline, subtext, CTAs
  "list", // a page of cards/items
  "form", // a form page (contact, signup)
  "auth", // login / signup (added later)
  "detail", // single item view (added later)
  "generic", // fallback: title + placeholder content
]);
export type PageType = z.infer<typeof PageType>;

export const Page = z.object({
  name: z.string(), // machine name, e.g. "Home"
  label: z.string(), // nav label, e.g. "Home"
  type: PageType,
  links: z.array(z.string()).default([]), // navigation targets (page names)
});
export type Page = z.infer<typeof Page>;

export const SiteSpec = z.object({
  version: z.literal("1.0"),
  name: z.string(),
  pages: z.array(Page),
});
export type SiteSpec = z.infer<typeof SiteSpec>;

export function parseSiteSpec(input: unknown): SiteSpec {
  return SiteSpec.parse(input);
}
