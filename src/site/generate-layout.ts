import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { LayoutSpec } from "./layout-spec.js";
import {
  DEFAULT_TOKENS,
  tokensToCss,
  tokenBodyAttrs,
  type DesignTokens,
} from "./design-tokens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "layout-template");

/**
 * Generate a single-page React site composed from a LayoutSpec's block stack.
 * Optionally themed with design tokens (Depth 1 + 2); otherwise preset default.
 */
export function generateLayout(
  spec: LayoutSpec,
  outDir: string,
  tokens: DesignTokens = DEFAULT_TOKENS,
): string[] {
  const written: string[] = [];

  for (const rel of listFiles(TEMPLATE_DIR)) {
    const src = join(TEMPLATE_DIR, rel);
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (rel === "index.html") {
      const html = readFileSync(src, "utf8").replace(
        "<body>",
        `<body ${tokenBodyAttrs(tokens)}>`,
      );
      writeFileSync(dest, html);
    } else {
      writeFileSync(dest, readFileSync(src));
    }
    written.push(dest);
  }

  const srcDir = join(outDir, "src");
  mkdirSync(srcDir, { recursive: true });

  writeFileSync(
    join(srcDir, "layout.js"),
    "// AUTO-GENERATED from your diagram.\nexport const layout = " +
      JSON.stringify(spec, null, 2) + ";\n",
  );
  written.push(join(srcDir, "layout.js"));

  // theme: prepend token CSS variables to the base stylesheet
  const baseCss = readFileSync(join(TEMPLATE_DIR, "src", "styles.css"), "utf8");
  writeFileSync(join(srcDir, "styles.css"), tokensToCss(tokens) + "\n" + baseCss);
  written.push(join(srcDir, "styles.css"));

  writeFileSync(
    join(outDir, "README.md"),
    `# ${spec.name}\n\nAuto-generated single-page site, composed from a layout.\n\n## Run it\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nBlocks: ${spec.blocks.map((b) => b.type).join(" → ")}\n\nA starting skeleton — replace placeholder content with your own.\n`,
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
