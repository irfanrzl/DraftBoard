import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { SiteSpec } from "./site-spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "site-template");

/**
 * Generate a complete, runnable React + Vite + React Router site from a
 * SiteSpec. Writes all files under outDir. User runs npm install && npm run dev.
 */
export function generateSite(spec: SiteSpec, outDir: string): string[] {
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

  const siteJs =
    "// AUTO-GENERATED from your diagram. Do not edit by hand.\n" +
    "export const site = " + JSON.stringify(spec, null, 2) + ";\n";
  writeFileSync(join(srcDir, "site.js"), siteJs);
  written.push(join(srcDir, "site.js"));

  const readme = `# ${spec.name}\n\nAuto-generated website skeleton.\n\n## Run it\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nPages: ${spec.pages.map((p) => p.label).join(", ")}\n\nThis is a starting skeleton — real content, images, and logic are yours to fill in.\n`;
  writeFileSync(join(outDir, "README.md"), readme);
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
