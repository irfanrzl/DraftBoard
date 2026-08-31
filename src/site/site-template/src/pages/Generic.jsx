import React from "react";
import { Link } from "react-router-dom";
import { pathFor } from "../App.jsx";
import { site } from "../site.js";

export default function Generic({ page }) {
  const linked = page.links
    .map((n) => site.pages.find((p) => p.name === n))
    .filter(Boolean);

  return (
    <section className="container section">
      <h1 className="page-title">{page.label}</h1>
      <p className="page-lead">
        This is the {page.label} page. Add your content here.
      </p>
      <div className="placeholder-block" />
      <div className="placeholder-block short" />
      {linked.length > 0 && (
        <div className="cta-row" style={{ marginTop: 32 }}>
          {linked.map((p) => (
            <Link key={p.name} to={pathFor(p.name)} className="btn btn-ghost">
              {p.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
