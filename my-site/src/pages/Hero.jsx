import React from "react";
import { Link } from "react-router-dom";
import { pathFor } from "../App.jsx";
import { site } from "../site.js";

export default function Hero({ page }) {
  const linked = page.links
    .map((n) => site.pages.find((p) => p.name === n))
    .filter(Boolean);

  return (
    <section className="hero">
      <div className="container">
        <div className="eyebrow">{site.name}</div>
        <h1 className="hero-title">{page.label}</h1>
        <p className="hero-sub">
          A starting point for your {page.label.toLowerCase()} page. Replace this
          copy with your own message, add visuals, and make it yours.
        </p>
        <div className="cta-row">
          {linked.map((p, i) => (
            <Link
              key={p.name}
              to={pathFor(p.name)}
              className={"btn " + (i === 0 ? "btn-primary" : "btn-ghost")}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
