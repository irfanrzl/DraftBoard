import type { VisionProvider } from "./types.js";
import { ollamaProvider } from "./ollama.js";
import { geminiProvider } from "./gemini.js";

// Picks which vision backend to use. This is the ONE place that decides.
// Swap by setting VISION_PROVIDER in your environment:
//   VISION_PROVIDER=ollama   (default, free, local)
//   VISION_PROVIDER=gemini   (cloud, for commercial use)

export function getVisionProvider(): VisionProvider {
  const choice = (process.env.VISION_PROVIDER ?? "ollama").toLowerCase();
  switch (choice) {
    case "gemini":
      return geminiProvider;
    case "ollama":
      return ollamaProvider;
    default:
      throw new Error(
        `Unknown VISION_PROVIDER "${choice}". Use "ollama" or "gemini".`,
      );
  }
}

export type { VisionProvider };
