import { describe, it, expect } from "vitest";
import { parseLayoutText } from "./parse-layouttext.js";

const src = `
layout "Home"
nav
hero split-right
grid 3
feature left
cta
footer
`;

describe("parseLayoutText", () => {
  const spec = parseLayoutText(src, "Fallback");

  it("reads the layout name", () => {
    expect(spec.name).toBe("Home");
  });

  it("parses blocks in order", () => {
    expect(spec.blocks.map((b) => b.type)).toEqual([
      "nav", "hero", "grid", "feature", "cta", "footer",
    ]);
  });

  it("captures the hero variant", () => {
    expect(spec.blocks.find((b) => b.type === "hero")?.variant).toBe("split-right");
  });

  it("captures grid columns", () => {
    expect(spec.blocks.find((b) => b.type === "grid")?.columns).toBe(3);
  });

  it("captures feature image side", () => {
    expect(spec.blocks.find((b) => b.type === "feature")?.imageSide).toBe("left");
  });

  it("defaults unknown grid columns to 3", () => {
    const s = parseLayoutText("layout \"X\"\ngrid 9", "X");
    expect(s.blocks[0].columns).toBe(3);
  });

  it("defaults a bare hero to centered", () => {
    const s = parseLayoutText("layout \"X\"\nhero", "X");
    expect(s.blocks[0].variant).toBe("centered");
  });
});
