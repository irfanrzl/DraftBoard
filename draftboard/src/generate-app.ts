import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { Spec } from "./spec.js";
import { mockData } from "./mock.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Templates live next to the built file. During build we copy them into dist.
// app-template sits at the project root, one level up from src/
const TEMPLATE_DIR = join(__dirname, "..", "app-template");

/**
 * Generate a complete, runnable React + Vite project for the given Spec.
 * Writes all files under `outDir`. The user then runs `npm install && npm run dev`.
 */
export function generateProject(spec: Spec, outDir: string): string[] {
  const written: string[] = [];

  // 1. Copy every static template file verbatim.
  for (const rel of listFiles(TEMPLATE_DIR)) {
    const src = join(TEMPLATE_DIR, rel);
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src));
    written.push(dest);
  }

  // 2. Write the two generated files derived from the Spec.
  const srcDir = join(outDir, "src");
  mkdirSync(srcDir, { recursive: true });

  const schemaJs =
    "// AUTO-GENERATED from your diagram. Do not edit by hand.\n" +
    "export const schema = " + JSON.stringify(spec, null, 2) + ";\n";
  writeFileSync(join(srcDir, "schema.js"), schemaJs);
  written.push(join(srcDir, "schema.js"));

  const seed = mockData(spec, 8);
  const seedJs =
    "// AUTO-GENERATED sample data. Replace with a real API/database later.\n" +
    "export const seedData = " + JSON.stringify(seed, null, 2) + ";\n";
  writeFileSync(join(srcDir, "seedData.js"), seedJs);
  written.push(join(srcDir, "seedData.js"));

  // 3. A README for the generated project.
  const readme = generatedReadme(spec);
  writeFileSync(join(outDir, "README.md"), readme);
  written.push(join(outDir, "README.md"));

  return written;
}

/** Recursively list files under a directory, returning paths relative to it. */
function listFiles(root: string, base = root): string[] {
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push(relative(base, full));
    }
  }
  return out;
}

function generatedReadme(spec: Spec): string {
  const entities = spec.entities.map((e) => "- " + e.label).join("\n");
  return `# ${spec.name} Dashboard

Auto-generated from a database diagram.

## Run it

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open the URL it prints (usually http://localhost:5173).

## What's inside

A fully interactive admin dashboard with:
- A list view per entity, with search and sorting
- Click any row to see its detail page and related records
- Create, edit, and delete records
- Sample data to play with (lives in memory, resets on refresh)

Entities:
${entities}

## Where the data comes from

Right now the app uses generated sample data in \`src/seedData.js\`, kept in
memory. To connect a real backend later, replace the store in \`src/store.js\`
with calls to your API — the rest of the app stays the same.

## Files

- \`src/schema.js\` — your data model (generated)
- \`src/seedData.js\` — sample records (generated)
- \`src/store.js\` — in-memory CRUD state
- \`src/components/\` — the dashboard UI (works for any schema)
`;
}
