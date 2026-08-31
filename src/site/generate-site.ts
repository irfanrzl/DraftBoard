import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { SiteSpec } from "./site-spec.js";
import {
  DEFAULT_TOKENS,
  tokensToCss,
  type DesignTokens,
} from "./design-tokens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "site-template");

/**
 * Generate a complete React + Vite + React Router site from a SiteSpec.
 * Optionally themes it with design tokens (extracted from a mockup); otherwise
 * uses the preset default theme.
 */
export function generateSite(
  spec: SiteSpec,
  outDir: string,
  tokens: DesignTokens = DEFAULT_TOKENS,
): string[] {
  const written: string[] = [];

  for (const rel of listFiles(TEMPLATE_DIR)) {
    const src = join(TEMPLATE_DIR, rel);
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src));
    written.push(dest);
  }

  const srcDir = join(outDir, "src");
  mkdirSync(srcDir, { recursive: true });

  // site data
  writeFileSync(
    join(srcDir, "site.js"),
    "// AUTO-GENERATED from your diagram.\nexport const site = " +
      JSON.stringify(spec, null, 2) + ";\n",
  );
  written.push(join(srcDir, "site.js"));

  // theme: prepend token CSS variables to the base stylesheet, so the same
  // templates get re-themed by the extracted (or default) palette.
  const baseCss = readFileSync(join(TEMPLATE_DIR, "src", "styles.css"), "utf8");
  writeFileSync(join(srcDir, "styles.css"), tokensToCss(tokens) + "\n" + baseCss);
  written.push(join(srcDir, "styles.css"));

  // README
  writeFileSync(
    join(outDir, "README.md"),
    `# ${spec.name}\n\nAuto-generated website skeleton.\n\n## Run it\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nPages: ${spec.pages.map((p) => p.label).join(", ")}\n\nThemed with: primary ${tokens.primary}, accent ${tokens.accent}, ${tokens.font} font, ${tokens.radius} corners.\n\nThis is a starting skeleton — real content and logic are yours to fill in.\n`,
  );
  written.push(join(outDir, "README.md"));

  return written;
}

function listFiles(root: string, base = root): string[] {
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, base));
    else out.push(relative(base, full));
  }
  return out;
}
