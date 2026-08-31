import { z } from "zod";

// Design tokens describe the visual style of a generated site. They can come
// from a preset (default) or be extracted from a mockup image (Level 3).

const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a #RRGGBB hex color");

export const DesignTokens = z.object({
  primary: HEX, // main brand / CTA color
  accent: HEX, // secondary accent
  ink: HEX, // main text color
  bg: HEX, // page background
  radius: z.enum(["none", "small", "medium", "large"]),
  font: z.enum(["sans", "serif", "mono"]),
  density: z.enum(["tight", "comfortable", "spacious"]),
});
export type DesignTokens = z.infer<typeof DesignTokens>;

/** The preset default theme (matches the current site look). */
export const DEFAULT_TOKENS: DesignTokens = {
  primary: "#5b3df5",
  accent: "#12b6c9",
  ink: "#14141b",
  bg: "#ffffff",
  radius: "medium",
  font: "sans",
  density: "comfortable",
};

export function parseDesignTokens(input: unknown): DesignTokens {
  return DesignTokens.parse(input);
}

// --- token -> CSS mapping ---

const RADIUS_PX = { none: "0px", small: "6px", medium: "14px", large: "22px" };
const FONT_STACK = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
};
const DENSITY_SCALE = { tight: "0.75", comfortable: "1", spacious: "1.4" };

/** Derive a slightly darker shade for hover/gradient ends (simple + safe). */
function darken(hex: string, amount = 0.15): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * (1 - amount));
  g = Math.round(g * (1 - amount));
  b = Math.round(b * (1 - amount));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Turn tokens into the CSS :root variables the site stylesheet consumes. */
export function tokensToCss(t: DesignTokens): string {
  return `:root {
  --accent: ${t.primary};
  --accent-dark: ${darken(t.primary)};
  --accent-2: ${t.accent};
  --ink: ${t.ink};
  --bg: ${t.bg};
  --radius: ${RADIUS_PX[t.radius]};
  --font: ${FONT_STACK[t.font]};
  --density: ${DENSITY_SCALE[t.density]};
}
`;
}
