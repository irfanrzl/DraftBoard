import React from "react";
import { Link } from "react-router-dom";

const EXAMPLES = [
  {
    title: "Blog schema",
    kind: "DBML",
    desc: "Users, posts, and comments with relations. A classic content model that becomes a full admin dashboard.",
    code: `Table User {
  id uuid [pk]
  email varchar
  status varchar
}
Table Post {
  id uuid [pk]
  title varchar
  user_id uuid [ref: > User.id]
}`,
  },
  {
    title: "Shop schema",
    kind: "Mermaid",
    desc: "Customers, orders, and line items. Written as a Mermaid ERD — reads exactly the same as DBML.",
    code: `erDiagram
  USER ||--o{ ORDER : places
  ORDER {
    uuid id PK
    uuid user_id FK
    float total
  }`,
  },
  {
    title: "From a screenshot",
    kind: "Vision",
    desc: "Upload a picture of an ERD — from Figma, Miro, or a whiteboard — and a local vision model reads it into a schema.",
    code: `[ ERD screenshot ]
        │
   vision model
        │
   → same clean spec`,
  },
];

export default function Examples() {
  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">Examples</span>
        <h1 className="page-h1">See what goes in</h1>
        <p className="page-sub">
          Any of these inputs produces a working dashboard. Open the tool and
          load one to try it live.
        </p>
      </section>

      <section className="ex-grid">
        {EXAMPLES.map((ex) => (
          <div className="ex-card" key={ex.title}>
            <div className="ex-head">
              <h3>{ex.title}</h3>
              <span className="ex-kind">{ex.kind}</span>
            </div>
            <p className="ex-desc">{ex.desc}</p>
            <pre className="ex-code">{ex.code}</pre>
          </div>
        ))}
      </section>

      <section className="cta-band">
        <h2>Try one yourself</h2>
        <p>The tool ships with DBML and Mermaid examples loaded and ready.</p>
        <Link to="/tool" className="btn btn-primary btn-lg">Open the tool</Link>
      </section>
    </div>
  );
}
