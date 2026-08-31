import { describe, it, expect } from "vitest";
import {
  parseDesignTokens,
  DEFAULT_TOKENS,
  tokensToCss,
} from "./design-tokens.js";

describe("design tokens", () => {
  it("accepts valid tokens", () => {
    const t = parseDesignTokens({
      primary: "#ff8800", accent: "#00ccdd", ink: "#111111", bg: "#ffffff",
      radius: "large", font: "serif", density: "spacious",
    });
    expect(t.primary).toBe("#ff8800");
    expect(t.font).toBe("serif");
  });

  it("rejects a bad hex", () => {
    expect(() =>
      parseDesignTokens({ ...DEFAULT_TOKENS, primary: "orange" }),
    ).toThrow();
  });

  it("maps tokens to CSS variables", () => {
    const css = tokensToCss(DEFAULT_TOKENS);
    expect(css).toContain("--accent: #5b3df5");
    expect(css).toContain("--radius: 14px");
    expect(css).toContain("--font:");
  });

  it("derives a darker accent shade", () => {
    const css = tokensToCss({ ...DEFAULT_TOKENS, primary: "#ffffff" });
    // darkened white should not still be pure white
    expect(css).toContain("--accent-dark: #d9d9d9");
  });

  it("maps radius enum to px", () => {
    expect(tokensToCss({ ...DEFAULT_TOKENS, radius: "none" })).toContain("--radius: 0px");
    expect(tokensToCss({ ...DEFAULT_TOKENS, radius: "large" })).toContain("--radius: 22px");
  });
});
