#!/usr/bin/env node
// The command you run.
// Text input:  parse, generate, create (scaffold) from a .dbml file
// Image input: parse-image, scaffold-image from a screenshot (uses a vision model)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parseDbml } from "./parser.js";
import { parseMermaid } from "./parse-mermaid.js";
import { parseImage } from "./parse-image.js";
import { generateHtml } from "./generate-html.js";
import { generateProject } from "./generate-app.js";
import type { Spec } from "./spec.js";

function usage(): never {
  console.error(`Usage:
  Text (DBML or Mermaid):
    npm run parse     <file.dbml|.mmd>            print the Spec JSON
    npm run generate  <file> -- --out dir           single-file HTML preview
    npm run scaffold  <file> -- --out dir           full React dashboard (DBML or Mermaid)

  Image (screenshot -> needs a vision model, Ollama by default):
    npm run parse-image    <image.png>             print the Spec JSON
    npm run scaffold-image <image.png> -- --out dir  full React dashboard
`);
  process.exit(1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function outDirFrom(rest: string[]): string {
  const i = rest.indexOf("--out");
  return i !== -1 && rest[i + 1] ? rest[i + 1] : "generated";
}

function writeHtml(spec: Spec, outDir: string) {
  const outPath = resolve(outDir, "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, generateHtml(spec), "utf8");
  console.log(`HTML preview written to ${outPath}`);
  console.log(`Open it in your browser to view.`);
}

function scaffold(spec: Spec, outDir: string) {
  const target = resolve(outDir);
  const files = generateProject(spec, target);
  console.log(`Scaffolded ${files.length} files into ${target}`);
  console.log(``);
  console.log(`Next steps:`);
  console.log(`  cd ${outDir}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
}

function specFromText(file: string): Spec {
  let source: string;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    console.error(`Cannot read file: ${file}`);
    process.exit(1);
  }
  const schemaName = capitalize(basename(file).replace(/\.[^.]+$/, ""));
  const ext = file.toLowerCase();
  const isMermaid =
    ext.endsWith(".mmd") ||
    ext.endsWith(".mermaid") ||
    source.trimStart().startsWith("erDiagram");
  try {
    return isMermaid
      ? parseMermaid(source, schemaName)
      : parseDbml(source, schemaName);
  } catch (err) {
    console.error("Failed to parse into a valid Spec:");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

async function main() {
  const argv = process.argv.slice(2).filter((a) => a !== "--");
  if (argv.length === 0) usage();

  let command = argv[0];
  let rest = argv.slice(1);
  // back-compat: a bare .dbml file means "parse"
  if (command.endsWith(".dbml") || command.endsWith(".mmd") || command.endsWith(".mermaid")) {
    command = "parse";
    rest = argv;
  }

  const file = rest.find((a) => !a.startsWith("-"));
  if (!file) usage();

  // ---- Image commands (async) ----
  if (command === "parse-image" || command === "scaffold-image") {
    let spec: Spec;
    try {
      spec = await parseImage(file);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }

    if (command === "parse-image") {
      console.log(JSON.stringify(spec, null, 2));
      return;
    }
    // scaffold-image: show what we extracted, then build
    console.error(
      `Extracted ${spec.entities.length} entities: ` +
        spec.entities.map((e) => e.name).join(", "),
    );
    scaffold(spec, outDirFrom(rest));
    return;
  }

  // ---- Text (DBML) commands ----
  const spec = specFromText(file);

  if (command === "parse") {
    console.log(JSON.stringify(spec, null, 2));
    return;
  }
  if (command === "generate") {
    writeHtml(spec, outDirFrom(rest));
    return;
  }
  if (command === "create") {
    scaffold(spec, outDirFrom(rest));
    return;
  }

  usage();
}

main();
