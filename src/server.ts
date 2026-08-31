// A small local web server that puts a friendly face on the engine.
// No framework — just Node's built-in http. Reuses all existing engine code.
import { createServer } from "node:http";
import { readFileSync, mkdtempSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseDbml } from "./parser.js";
import { parseMermaid } from "./parse-mermaid.js";
import { parseImage } from "./parse-image.js";
import { generateHtml } from "./generate-html.js";
import { generateProject } from "./generate-app.js";
import type { Spec } from "./spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DIR = join(__dirname, "..", "web");
const PORT = Number(process.env.PORT ?? 3000);

// --- helpers ---

function send(res: any, status: number, body: string | Buffer, type = "text/plain") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c: Buffer) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/** Turn whatever the user submitted into a Spec. */
async function specFromInput(input: {
  kind: string;
  text?: string;
  imageBase64?: string;
  mediaType?: string;
}): Promise<Spec> {
  if (input.kind === "dbml") return parseDbml(input.text ?? "", "App");
  if (input.kind === "mermaid") return parseMermaid(input.text ?? "", "App");
  if (input.kind === "auto") {
    const t = (input.text ?? "").trimStart();
    return t.startsWith("erDiagram")
      ? parseMermaid(t, "App")
      : parseDbml(t, "App");
  }
  if (input.kind === "image") {
    // parseImage reads from a file path, so write the upload to a temp file.
    const dir = mkdtempSync(join(tmpdir(), "draftboard-img-"));
    const ext = (input.mediaType ?? "image/png").split("/")[1] ?? "png";
    const file = join(dir, `upload.${ext}`);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(file, Buffer.from(input.imageBase64 ?? "", "base64"));
    try {
      return await parseImage(file);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  throw new Error("Unknown input kind: " + input.kind);
}

/** Collect a generated project into an in-memory map of path -> contents. */
function collectProject(spec: Spec): Record<string, string> {
  const dir = mkdtempSync(join(tmpdir(), "draftboard-proj-"));
  try {
    generateProject(spec, dir);
    const files: Record<string, string> = {};
    for (const rel of listFiles(dir)) {
      files[rel.replace(/\\/g, "/")] = readFileSync(join(dir, rel), "utf8");
    }
    return files;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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

// --- server ---

const server = createServer(async (req, res) => {
  try {
    // Serve the page
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      return send(res, 200, readFileSync(join(WEB_DIR, "index.html")), "text/html");
    }

    // Generate a preview: returns the dashboard HTML + the spec
    if (req.method === "POST" && req.url === "/api/generate") {
      const body = JSON.parse(await readBody(req));
      const spec = await specFromInput(body);
      const html = generateHtml(spec);
      return send(
        res,
        200,
        JSON.stringify({ html, spec }),
        "application/json",
      );
    }

    // Download: returns all project files as JSON; the browser zips them.
    if (req.method === "POST" && req.url === "/api/download") {
      const body = JSON.parse(await readBody(req));
      const spec: Spec = body.spec;
      const files = collectProject(spec);
      return send(res, 200, JSON.stringify({ files }), "application/json");
    }

    send(res, 404, "Not found");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    send(res, 400, JSON.stringify({ error: msg }), "application/json");
  }
});

server.listen(PORT, () => {
  console.log(`\n  Draftboard web interface running:`);
  console.log(`  → http://localhost:${PORT}\n`);
  console.log(`  Paste DBML/Mermaid or upload a screenshot, then Generate.`);
  console.log(`  (Screenshot input needs Ollama running — see docs-screenshot.md)\n`);
});
