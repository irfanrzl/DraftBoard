import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Copy .env.example to .env and add your key."
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export interface GenerateInput {
  text?: string;
  instructions?: string;
  imageBase64?: string; // raw base64, no "data:" prefix
  imageMime?: string;
}

/** Strip ```html ... ``` fences if Gemini adds them despite instructions not to. */
function cleanHtml(raw: string): string {
  let html = raw.trim();
  html = html.replace(/^```(?:html)?\s*/i, "");
  html = html.replace(/```\s*$/i, "");
  return html.trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Turn Gemini's raw error into something a user can actually act on.
 * - Daily quota (RPD) exhausted: no amount of retrying helps until the
 *   daily reset (midnight Pacific time), so say that plainly.
 * - Per-minute quota (RPM): genuinely transient, worth a short wait.
 * - Anything else: pass the original message through.
 */
function toFriendlyError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);

  const isQuotaError = /RESOURCE_EXHAUSTED|429/i.test(message);
  if (isQuotaError) {
    const isDailyQuota = /PerDay|requests per day/i.test(message);
    if (isDailyQuota) {
      return new Error(
        "You've hit the free-tier daily limit for gemini-3.5-flash (20 requests/day). " +
          "This resets at midnight Pacific time (roughly 3 PM in Malaysia). Retrying now won't help — " +
          "either wait for the reset, or enable billing on your Google Cloud project in AI Studio for a higher limit."
      );
    }
    return new Error(
      "Gemini's per-minute rate limit was hit. Wait about a minute and try again."
    );
  }

  return err instanceof Error ? err : new Error(message);
}

/** Retry only errors that are actually transient (server-side hiccups), with backoff. */
async function callGemini(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  attempt = 0
): Promise<Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>> {
  try {
    return await ai.models.generateContent(params);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isTransient = /UNAVAILABLE|503|overloaded|INTERNAL/i.test(message);
    if (isTransient && attempt < 2) {
      await sleep(1000 * 2 ** attempt); // 1s, then 2s
      return callGemini(ai, params, attempt + 1);
    }
    throw toFriendlyError(err);
  }
}

export async function generateHtml(input: GenerateInput): Promise<string> {
  const ai = getClient();

  const parts: Array<Record<string, unknown>> = [
    { text: `${SYSTEM_PROMPT}\n\n---\n\n${buildUserPrompt(input.text, input.instructions)}` },
  ];

  if (input.imageBase64 && input.imageMime) {
    parts.push({
      inlineData: {
        mimeType: input.imageMime,
        data: input.imageBase64,
      },
    });
  }

  const response = await callGemini(ai, {
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts }],
  });

  const text = response.text ?? "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response. Try again or simplify the input.");
  }
  return cleanHtml(text);
}
