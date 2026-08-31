import { describe, it, expect } from "vitest";
import { parseMermaid } from "./parse-mermaid.js";

const mmd = `
erDiagram
    USER ||--o{ ORDER : places
    USER {
        uuid id PK
        string email
        string status
        datetime created_at
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        float total
    }
`;

describe("parseMermaid", () => {
  const spec = parseMermaid(mmd, "Shop");

  it("extracts entities with PascalCase names", () => {
    expect(spec.entities.map((e) => e.name).sort()).toEqual(["Order", "User"]);
  });

  it("applies field heuristics", () => {
    const user = spec.entities.find((e) => e.name === "User")!;
    expect(user.fields.find((f) => f.name === "status")?.ui).toBe("badge");
    expect(user.fields.find((f) => f.name === "created_at")?.ui).toBe("date-column");
    expect(user.fields.find((f) => f.name === "id")?.role).toBe("primary");
  });

  it("wires one-to-many and many-to-one both directions", () => {
    const user = spec.entities.find((e) => e.name === "User")!;
    const order = spec.entities.find((e) => e.name === "Order")!;
    expect(user.relations.some((r) => r.to === "Order" && r.type === "one-to-many")).toBe(true);
    expect(order.relations.some((r) => r.to === "User" && r.type === "many-to-one")).toBe(true);
  });

  it("marks the foreign key field as a relation-picker", () => {
    const order = spec.entities.find((e) => e.name === "Order")!;
    expect(order.fields.find((f) => f.name === "user_id")?.ui).toBe("relation-picker");
  });
});
