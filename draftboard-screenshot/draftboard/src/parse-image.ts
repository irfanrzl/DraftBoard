import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { parseSpec, type Spec } from "./spec.js";
import { getVisionProvider } from "./vision/index.js";

function mediaTypeFor(path: string): string {
  const ext = extname(path).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

/** Strip markdown fences and grab the JSON object from a model's text reply. */
function extractJson(text: string): string {
  let t = text.trim();
  // remove ```json ... ``` or ``` ... ``` fences
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // if there's leading/trailing prose, keep only the outermost {...}
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  return t.trim();
}

/**
 * Read a diagram image and return a validated Spec.
 * Uses whichever vision provider VISION_PROVIDER selects (Ollama by default).
 * Retries once if the first response fails validation.
 */
export async function parseImage(imagePath: string): Promise<Spec> {
  const bytes = readFileSync(imagePath);
  const base64 = bytes.toString("base64");
  const mediaType = mediaTypeFor(imagePath);

  const provider = getVisionProvider();
  console.error(`Reading diagram with ${provider.name}...`);

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await provider.readDiagram(base64, mediaType);
    const json = extractJson(raw);
    try {
      const parsed = JSON.parse(json);
      return parseSpec(parsed);
    } catch (err) {
      lastError = err;
      if (attempt === 1) {
        console.error("First attempt didn't produce valid Spec, retrying...");
      }
    }
  }

  throw new Error(
    "The model did not return a valid Spec after 2 attempts.\n" +
      "This can happen with dense or blurry diagrams. Try a clearer image, " +
      "or export the diagram as DBML/Mermaid text instead.\n" +
      `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}
