import { z } from "zod";

// Design tokens describe the visual style of a generated site. They can come
// from a preset (default) or be extracted from a mockup image.
// Depth 1: palette + font + radius + density.
// Depth 2: component styles — how buttons, inputs, and cards look.

const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a #RRGGBB hex color");

export const DesignTokens = z.object({
  // Depth 1 — palette & feel
  primary: HEX,
  accent: HEX,
  ink: HEX,
  bg: HEX,
  radius: z.enum(["none", "small", "medium", "large"]),
  font: z.enum(["sans", "serif", "mono"]),
  density: z.enum(["tight", "comfortable", "spacious"]),
  // Depth 2 — component styles
  buttonStyle: z.enum(["filled", "outline", "soft"]),
  buttonShape: z.enum(["sharp", "rounded", "pill"]),
  inputStyle: z.enum(["box", "underline", "filled"]),
  cardStyle: z.enum(["border", "shadow", "flat", "elevated"]),
  shadow: z.enum(["none", "soft", "strong"]),
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
  buttonStyle: "filled",
  buttonShape: "rounded",
  inputStyle: "box",
  cardStyle: "border",
  shadow: "soft",
};

export function parseDesignTokens(input: unknown): DesignTokens {
  return DesignTokens.parse(input);
}

// --- token -> CSS mapping ---

const RADIUS_PX = { none: "0px", small: "6px", medium: "14px", large: "22px" };
const BTN_RADIUS = { sharp: "0px", rounded: "12px", pill: "999px" };
const FONT_STACK = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
};
const DENSITY_SCALE = { tight: "0.75", comfortable: "1", spacious: "1.4" };
const SHADOW_MD = {
  none: "none",
  soft: "0 8px 30px rgba(16,16,32,0.08)",
  strong: "0 16px 44px rgba(16,16,32,0.18)",
};
const SHADOW_LG = {
  none: "none",
  soft: "0 24px 60px rgba(16,16,32,0.12)",
  strong: "0 32px 80px rgba(16,16,32,0.24)",
};

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
  --btn-radius: ${BTN_RADIUS[t.buttonShape]};
  --font: ${FONT_STACK[t.font]};
  --density: ${DENSITY_SCALE[t.density]};
  --shadow-md: ${SHADOW_MD[t.shadow]};
  --shadow-lg: ${SHADOW_LG[t.shadow]};
}
`;
}

/** The data-* attributes that switch component styles, set on <body>. */
export function tokenBodyAttrs(t: DesignTokens): string {
  return `data-btn="${t.buttonStyle}" data-input="${t.inputStyle}" data-card="${t.cardStyle}"`;
}
