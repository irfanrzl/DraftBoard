import { describe, it, expect } from "vitest";
import { parseDbml } from "./parser.js";

const dbml = `
Table User {
  id uuid [pk]
  email varchar [unique, not null]
  status varchar
  created_at timestamp
}
Table Post {
  id uuid [pk]
  title varchar [not null]
  user_id uuid [ref: > User.id]
}
`;

describe("parseDbml", () => {
  const spec = parseDbml(dbml, "Blog");

  it("produces a valid spec with two entities", () => {
    expect(spec.name).toBe("Blog");
    expect(spec.entities.map((e) => e.name)).toEqual(["User", "Post"]);
  });

  it("marks the primary key hidden", () => {
    const id = spec.entities[0].fields.find((f) => f.name === "id");
    expect(id?.role).toBe("primary");
    expect(id?.ui).toBe("hidden");
  });

  it("applies name heuristics", () => {
    const status = spec.entities[0].fields.find((f) => f.name === "status");
    expect(status?.ui).toBe("badge");
  });

  it("carries required/unique flags", () => {
    const email = spec.entities[0].fields.find((f) => f.name === "email");
    expect(email?.required).toBe(true);
    expect(email?.unique).toBe(true);
  });

  it("wires relations both directions", () => {
    const post = spec.entities.find((e) => e.name === "Post")!;
    const user = spec.entities.find((e) => e.name === "User")!;
    expect(post.relations.some((r) => r.to === "User" && r.type === "many-to-one")).toBe(true);
    expect(user.relations.some((r) => r.to === "Post" && r.type === "one-to-many")).toBe(true);
  });

  it("upgrades FK fields to relation-picker", () => {
    const post = spec.entities.find((e) => e.name === "Post")!;
    const fk = post.fields.find((f) => f.name === "user_id");
    expect(fk?.ui).toBe("relation-picker");
  });
});
