import React from "react";
import { Link } from "react-router-dom";
import { pathFor } from "../App.jsx";
import { site } from "../site.js";

// Placeholder items so the page looks real. Users replace these.
const PLACEHOLDERS = [
  { title: "First item", body: "A short description of this item goes here." },
  { title: "Second item", body: "Explain what this offering or entry is about." },
  { title: "Third item", body: "Add as many of these cards as you need." },
  { title: "Fourth item", body: "Replace the placeholder text with real content." },
  { title: "Fifth item", body: "Each card can link somewhere or show details." },
  { title: "Sixth item", body: "This grid adapts to how many items you add." },
];

export default function List({ page }) {
  const linked = page.links
    .map((n) => site.pages.find((p) => p.name === n))
    .filter(Boolean);

  return (
    <section className="container section">
      <h1 className="page-title">{page.label}</h1>
      <p className="page-lead">
        A grid of {page.label.toLowerCase()}. Swap these placeholder cards for
        your real content.
      </p>

      <div className="grid">
        {PLACEHOLDERS.map((item, i) => (
          <div className="card" key={i}>
            <div className="card-thumb" />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>

      {linked.length > 0 && (
        <div className="cta-row" style={{ marginTop: 32 }}>
          {linked.map((p) => (
            <Link key={p.name} to={pathFor(p.name)} className="btn btn-primary">
              {p.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
