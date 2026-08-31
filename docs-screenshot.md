# Screenshot → Dashboard

Turn a picture of an ERD (from Figma, Miro, a whiteboard photo, anything) into a
working dashboard. This is the only feature that uses an AI model, because a
screenshot is just pixels — something has to *look* at it.

## Two backends, swappable

The image reader is a swappable module. You pick which model reads the image
with one environment variable:

| `VISION_PROVIDER` | Backend | Cost | Use it for |
|-------------------|---------|------|-----------|
| `ollama` (default) | Local model on your machine | Free | Personal use, experimenting |
| `gemini` | Google Gemini (cloud) | Free tier / paid | Commercial use (one key serves all users) |

Everything downstream (Spec → dashboard) is identical either way.

## Option A — Ollama (free, local, default)

### One-time setup

1. Install Ollama from https://ollama.com
2. Pull a vision model (a few GB download, once):
   ```bash
   ollama pull llama3.2-vision
   ```
3. Ollama runs in the background automatically after install.

### Use it

```bash
# just see what it extracted
npm run parse-image path/to/your-erd.png

# read the image AND build the dashboard
npm run scaffold-image path/to/your-erd.png -- --out my-dashboard
cd my-dashboard
npm install
npm run dev
```

Notes:
- First run is slow (the model loads into memory). Later runs are faster.
- Accuracy depends on the image. Clean, clear diagrams work best; dense or
  blurry ones may need a second try or a clearer screenshot.
- Always eyeball the result — run `parse-image` first to check the structure
  before scaffolding.

## Option B — Gemini (for when you commercialize)

1. Get a key at https://aistudio.google.com/apikey (free tier available)
2. Set two environment variables, then run the same commands:

   PowerShell (Windows):
   ```powershell
   $env:VISION_PROVIDER="gemini"
   $env:GEMINI_API_KEY="your-key-here"
   npm run scaffold-image path/to/your-erd.png -- --out my-dashboard
   ```

   bash/zsh (Mac/Linux):
   ```bash
   VISION_PROVIDER=gemini GEMINI_API_KEY=your-key-here \
     npm run scaffold-image path/to/your-erd.png -- --out my-dashboard
   ```

That's the only change. With Gemini, *you* hold one key that serves everyone —
users never need their own account.

## When it can't read the image

If the model can't produce a valid schema (dense diagram, bad photo), the tool
tells you and suggests exporting the diagram as DBML or Mermaid text instead.
It tries twice automatically before giving up.
