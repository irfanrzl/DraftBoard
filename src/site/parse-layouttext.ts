import { parseLayoutSpec, type LayoutSpec, type Block } from "./layout-spec.js";

// Parses the ".layout" text format into a LayoutSpec.
//
//   layout "Home"
//   nav
//   hero split-right
//   grid 3
//   feature left
//   cta
//   footer

export function parseLayoutText(text: string, fallbackName = "Page"): LayoutSpec {
  const lines = text.split(/\r?\n/);
  let name = fallbackName;
  const blocks: Block[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    // layout "Name"
    const head = line.match(/^layout\s+"?([^"]+)"?$/i);
    if (head) {
      name = head[1].trim();
      continue;
    }

    const parts = line.split(/\s+/);
    const type = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();

    if (type === "nav") { blocks.push({ type: "nav" }); continue; }
    if (type === "footer") { blocks.push({ type: "footer" }); continue; }
    if (type === "cta") { blocks.push({ type: "cta" }); continue; }

    if (type === "hero") {
      const variant =
        arg === "split-right" || arg === "split-left" || arg === "centered"
          ? (arg as Block["variant"])
          : "centered";
      blocks.push({ type: "hero", variant });
      continue;
    }

    if (type === "grid") {
      const n = Number(arg);
      const columns = (n === 2 || n === 3 || n === 4 ? n : 3) as Block["columns"];
      blocks.push({ type: "grid", columns });
      continue;
    }

    if (type === "feature") {
      const imageSide = arg === "left" ? "left" : "right";
      blocks.push({ type: "feature", imageSide });
      continue;
    }
    // unknown lines are ignored (keeps parsing robust)
  }

  return parseLayoutSpec({ version: "1.0", name, blocks });
}
