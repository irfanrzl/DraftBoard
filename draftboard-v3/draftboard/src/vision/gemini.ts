import type { VisionProvider } from "./types.js";
import { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } from "./prompt.js";

// Reads diagrams using Google Gemini. For when you commercialize: one business
// API key serves all your users. Set GEMINI_API_KEY in the environment.
//
// Get a free key at https://aistudio.google.com/apikey

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

export const geminiProvider: VisionProvider = {
  name: `gemini:${GEMINI_MODEL}`,

  async readDiagram(imageBase64: string, mediaType: string): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY is not set. Get a free key at " +
          "https://aistudio.google.com/apikey and set it in your environment.",
      );
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${GEMINI_MODEL}:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: VISION_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: VISION_USER_PROMPT },
              { inline_data: { mime_type: mediaType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0 },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini error ${res.status}: ${body}`);
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  },
};
