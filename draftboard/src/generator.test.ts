import { describe, it, expect } from "vitest";
import { generateHtml } from "./generate-html.js";
import { mockData, mockRows } from "./mock.js";
import type { Spec, Entity } from "./spec.js";

const spec: Spec = {
  version: "1.0",
  name: "Blog",
  entities: [
    {
      name: "User",
      label: "Users",
      fields: [
        { name: "id", type: "uuid", ui: "hidden", role: "primary" },
        { name: "email", type: "string", ui: "text" },
        { name: "status", type: "string", ui: "badge" },
      ],
      relations: [
        { field: "id", to: "Post", type: "one-to-many", ui: "nested-table" },
      ],
    },
    {
      name: "Post",
      label: "Posts",
      fields: [
        { name: "id", type: "uuid", ui: "hidden", role: "primary" },
        { name: "user_id", type: "uuid", ui: "relation-picker" },
      ],
      relations: [
        { field: "user_id", to: "User", type: "many-to-one", ui: "relation-picker" },
      ],
    },
  ],
};

describe("mockData", () => {
  const data = mockData(spec, 5);

  it("creates rows for every entity", () => {
    expect(data.User).toHaveLength(5);
    expect(data.Post).toHaveLength(5);
  });

  it("links foreign keys to real parent ids", () => {
    const userIds = data.User.map((r) => r.id);
    for (const post of data.Post) {
      expect(userIds).toContain(post.user_id);
    }
  });
});

describe("mockRows", () => {
  it("fills every field", () => {
    const rows = mockRows(spec.entities[0], 3);
    expect(Object.keys(rows[0])).toEqual(["id", "email", "status"]);
  });
});

describe("generateHtml (single-file preview)", () => {
  const html = generateHtml(spec);
  it("produces a self-contained document", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).not.toContain("unpkg");
  });
});
