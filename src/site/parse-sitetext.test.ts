import { describe, it, expect } from "vitest";
import { parseSiteText } from "./parse-sitetext.js";

const src = `
site "Acme"
page Home : hero
  -> Services
  -> Contact
page Services : list
page Contact : form
page Weird : nonsense
`;

describe("parseSiteText", () => {
  const spec = parseSiteText(src, "Fallback");

  it("reads the site name", () => {
    expect(spec.name).toBe("Acme");
  });

  it("extracts all pages", () => {
    expect(spec.pages.map((p) => p.name)).toEqual([
      "Home", "Services", "Contact", "Weird",
    ]);
  });

  it("captures navigation links", () => {
    const home = spec.pages.find((p) => p.name === "Home")!;
    expect(home.links).toEqual(["Services", "Contact"]);
  });

  it("maps known page types", () => {
    expect(spec.pages.find((p) => p.name === "Home")!.type).toBe("hero");
    expect(spec.pages.find((p) => p.name === "Contact")!.type).toBe("form");
  });

  it("falls back unknown types to generic", () => {
    expect(spec.pages.find((p) => p.name === "Weird")!.type).toBe("generic");
  });

  it("uses fallback name when none given", () => {
    const s = parseSiteText("page Home : hero", "MyFallback");
    expect(s.name).toBe("MyFallback");
  });
});
