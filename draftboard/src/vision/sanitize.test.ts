import { describe, it, expect } from "vitest";
import { sanitizeSpec } from "./sanitize.js";
import { parseSpec } from "../spec.js";

describe("sanitizeSpec", () => {
  it("repairs the 'relation type in role slot' bug", () => {
    const broken = {
      name: "shop",
      entities: [
        {
          name: "customer",
          fields: [
            { name: "id", type: "integer" },
            { name: "email", type: "varchar" },
            { name: "status", type: "string" },
          ],
        },
        {
          name: "order",
          fields: [
            { name: "id", type: "integer" },
            { name: "customer_id", type: "integer", role: "many-to-one" },
            { name: "total", type: "decimal" },
          ],
          relations: [
            { field: "customer_id", to: "customer", type: "belongs-to" },
          ],
        },
      ],
    };
    // Should not throw:
    const spec = parseSpec(sanitizeSpec(broken));
    expect(spec.entities).toHaveLength(2);
    // the bad role was dropped
    const fk = spec.entities[1].fields.find((f) => f.name === "customer_id");
    expect(fk?.role).toBeUndefined();
    // invalid relation type coerced to a valid one
    expect(spec.entities[1].relations[0].type).toBe("many-to-one");
  });

  it("adds a primary key when the model forgot one", () => {
    const spec = parseSpec(
      sanitizeSpec({ name: "x", entities: [{ name: "thing", fields: [{ name: "label", type: "string" }] }] }),
    );
    expect(spec.entities[0].fields.some((f) => f.role === "primary")).toBe(true);
  });

  it("coerces unknown types to valid ones", () => {
    const spec = parseSpec(
      sanitizeSpec({
        name: "x",
        entities: [{ name: "t", fields: [{ name: "amount", type: "decimal(10,2)" }] }],
      }),
    );
    const amount = spec.entities[0].fields.find((f) => f.name === "amount");
    expect(amount).toBeDefined();
  });

  it("PascalCases entity names and pluralizes labels", () => {
    const spec = parseSpec(
      sanitizeSpec({ name: "x", entities: [{ name: "blog_post", fields: [] }] }),
    );
    expect(spec.entities[0].name).toBe("BlogPost");
    expect(spec.entities[0].label).toBe("BlogPosts");
  });
});
