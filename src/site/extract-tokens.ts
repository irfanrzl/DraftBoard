import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { getVisionProvider } from "../vision/index.js";
import {
  parseDesignTokens,
  DEFAULT_TOKENS,
  type DesignTokens,
} from "./design-tokens.js";
import { DESIGN_SYSTEM_PROMPT, DESIGN_USER_PROMPT } from "./design-prompt.js";

function mediaTypeFor(path: string): string {
  const ext = extname(path).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

function extractJson(text: string): string {
  let t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const first = t.indexOf("{"), last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1);
  return t.trim();
}

/** Repair common model mistakes so tokens validate. Falls back to defaults. */
function sanitizeTokens(raw: any): DesignTokens {
  const out: any = { ...DEFAULT_TOKENS };
  const hex = (v: any) =>
    typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim().toLowerCase() : null;

  // also accept 3-digit hex and expand
  const hex3 = (v: any) => {
    if (typeof v === "string" && /^#[0-9a-fA-F]{3}$/.test(v.trim())) {
      const c = v.trim().slice(1);
      return "#" + c.split("").map((x) => x + x).join("").toLowerCase();
    }
    return null;
  };

  for (const key of ["primary", "accent", "ink", "bg"]) {
    const v = hex(raw?.[key]) ?? hex3(raw?.[key]);
    if (v) out[key] = v;
  }
  if (["none", "small", "medium", "large"].includes(raw?.radius)) out.radius = raw.radius;
  if (["sans", "serif", "mono"].includes(raw?.font)) out.font = raw.font;
  if (["tight", "comfortable", "spacious"].includes(raw?.density)) out.density = raw.density;

  return parseDesignTokens(out);
}

/**
 * Read a mockup image and extract design tokens.
 * Uses the swappable vision provider (set OLLAMA_MODEL=qwen2.5-vl for best local
 * results, or VISION_PROVIDER=gemini). Falls back to defaults if reading fails.
 */
export async function extractTokens(imagePath: string): Promise<DesignTokens> {
  const base64 = readFileSync(imagePath).toString("base64");
  const mediaType = mediaTypeFor(imagePath);

  const provider = getVisionProvider();
  console.error(`Reading design with ${provider.name}...`);

  // The provider uses the ERD prompt by default; for design we pass our own
  // prompts through a thin wrapper. providers accept (image, media) and use the
  // shared ERD prompt — so we call a design-specific variant here.
  const raw = await provider.readDiagram(base64, mediaType, {
    system: DESIGN_SYSTEM_PROMPT,
    user: DESIGN_USER_PROMPT,
  });

  try {
    return sanitizeTokens(JSON.parse(extractJson(raw)));
  } catch {
    console.error("Could not read design cleanly — using default theme.");
    return DEFAULT_TOKENS;
  }
}
