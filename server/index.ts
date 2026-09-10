import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateHtml } from "./gemini.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "25mb" })); // screenshots as base64 need headroom
// { extensions: ["html"] } lets clean routes like /how resolve to public/how.html
app.use(express.static(path.join(__dirname, "..", "public"), { extensions: ["html"] }));

app.post("/api/generate", async (req, res) => {
  try {
    const { text, instructions, imageBase64, imageMime } = req.body ?? {};

    if (!text?.trim() && !imageBase64) {
      res.status(400).json({ error: "Provide diagram text, a description, and/or an image." });
      return;
    }

    const html = await generateHtml({ text, instructions, imageBase64, imageMime });
    res.json({ html });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Generation failed.";
    res.status(500).json({ error: message });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
app.listen(PORT, () => {
  console.log(`Draftboard running at http://localhost:${PORT}`);
});
