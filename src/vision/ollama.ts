import type { VisionProvider, VisionPrompts } from "./types.js";
import { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } from "./prompt.js";

// Reads diagrams using a local Ollama model. Free, private, no API key.
// Requires Ollama running locally with a vision model pulled, e.g.:
//   ollama pull llama3.2-vision

const OLLAMA_URL =
  process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/chat";
// Defaults to qwen3-vl — a strong local vision model, good at reading diagrams
// and design. Override with OLLAMA_MODEL=... (e.g. qwen3-vl:4b for less memory,
// or a different model). Requires a recent Ollama version.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3-vl";

export const ollamaProvider: VisionProvider = {
  name: `ollama:${OLLAMA_MODEL}`,

  async readDiagram(
    imageBase64: string,
    _mediaType: string,
    prompts?: VisionPrompts,
  ): Promise<string> {
    const sys = prompts?.system ?? VISION_SYSTEM_PROMPT;
    const usr = prompts?.user ?? VISION_USER_PROMPT;
    let res: Response;
    try {
      res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          options: { temperature: 0 },
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content: usr,
              images: [imageBase64],
            },
          ],
        }),
      });
    } catch (err) {
      throw new Error(
        `Could not reach Ollama at ${OLLAMA_URL}. Is Ollama running? ` +
          `Install from https://ollama.com and run "ollama pull ${OLLAMA_MODEL}".\n` +
          `Original error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 404) {
        throw new Error(
          `Ollama responded 404. The model "${OLLAMA_MODEL}" may not be pulled yet. ` +
            `Run: ollama pull ${OLLAMA_MODEL}`,
        );
      }
      throw new Error(`Ollama error ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content;
    if (!content) {
      throw new Error("Ollama returned an empty response.");
    }
    return content;
  },
};
