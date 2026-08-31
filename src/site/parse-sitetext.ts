import { parseSiteSpec, type SiteSpec, type Page, PageType } from "./site-spec.js";

// Parses the simple ".site" text format into a SiteSpec.
//
//   site "My Company"
//   page Home : hero
//     -> Services
//     -> Contact
//   page Services : list
//   page Contact : form

function labelize(name: string): string {
  return name.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const VALID_TYPES = new Set(PageType.options);

export function parseSiteText(text: string, fallbackName = "Site"): SiteSpec {
  const lines = text.split(/\r?\n/);
  let siteName = fallbackName;
  const pages: Page[] = [];
  let current: Page | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    // site "Name"
    const site = line.match(/^site\s+"?([^"]+)"?$/i);
    if (site) {
      siteName = site[1].trim();
      continue;
    }

    // page Name : type
    const page = line.match(/^page\s+(\w+)\s*:\s*(\w+)$/i);
    if (page) {
      const name = page[1];
      let type = page[2].toLowerCase();
      if (!VALID_TYPES.has(type as any)) type = "generic";
      current = { name, label: labelize(name), type: type as any, links: [] };
      pages.push(current);
      continue;
    }

    // -> Target  (a nav link on the current page)
    const link = line.match(/^->\s*(\w+)$/);
    if (link && current) {
      current.links.push(link[1]);
      continue;
    }
  }

  return parseSiteSpec({ version: "1.0", name: siteName, pages });
}
