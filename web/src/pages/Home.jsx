import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Local-first · powered by your own machine</span>
          <h1 className="hero-h1">
            Turn a diagram into a<br />
            <span className="grad-text">working dashboard.</span>
          </h1>
          <p className="hero-p">
            Draftboard reads your database schema — as DBML, Mermaid, or even a
            screenshot — and generates a real, interactive React admin dashboard.
            It also builds multi-page websites from a page layout.
          </p>
          <div className="hero-cta">
            <Link to="/tool" className="btn btn-primary btn-lg">Open the tool</Link>
            <Link to="/how" className="btn btn-ghost btn-lg">See how it works</Link>
          </div>
        </div>
        <div className="hero-glow" />
      </section>

      <section className="band">
        <div className="feature-grid">
          <div className="feature">
            <div className="feature-ico">◱</div>
            <h3>Three ways in</h3>
            <p>Paste DBML or Mermaid text, or upload a screenshot of an ERD. All three produce the same clean result.</p>
          </div>
          <div className="feature">
            <div className="feature-ico">⊞</div>
            <h3>Real, interactive output</h3>
            <p>Not a mockup — a runnable React app with tables, search, sorting, detail views, forms, and linked relations.</p>
          </div>
          <div className="feature">
            <div className="feature-ico">◈</div>
            <h3>Two engines, one product</h3>
            <p>Build data dashboards from schemas, or multi-page websites from a page layout — themed from a mockup.</p>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Draw the structure. Get the interface.</h2>
        <p>No setup, no account. Your diagram goes in, a working app comes out.</p>
        <Link to="/tool" className="btn btn-primary btn-lg">Try it now</Link>
      </section>
    </div>
  );
}
