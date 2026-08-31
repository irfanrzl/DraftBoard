import React from "react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">How it works</span>
        <h1 className="page-h1">From structure to interface</h1>
        <p className="page-sub">
          Draftboard reads a diagram, builds a clean internal spec, and generates
          a real project from it. Here's the whole path.
        </p>
      </section>

      <section className="steps">
        <div className="step">
          <div className="step-n">1</div>
          <div className="step-body">
            <h3>You give it a diagram</h3>
            <p>
              Three ways in: paste <b>DBML</b> or <b>Mermaid</b> text, or upload a
              <b> screenshot</b> of an ERD. Text is read directly; a screenshot is
              read by a local vision model on your machine.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">2</div>
          <div className="step-body">
            <h3>It builds a clean spec</h3>
            <p>
              Every input becomes the same structured description — entities,
              fields, and relations — with smart defaults: a <i>status</i> field
              becomes a colored badge, a <i>created_at</i> a sortable date, a
              foreign key a linked relation.
            </p>
          </div>
        </div>
        <div className="step">
          <div className="step-n">3</div>
          <div className="step-body">
            <h3>You get a working app</h3>
            <p>
              A real React project — list views with search and sort, detail pages,
              create/edit/delete forms, and navigation between related records.
              Preview it live, then download the whole project.
            </p>
          </div>
        </div>
      </section>

      <section className="two-engines">
        <h2>Two engines, one product</h2>
        <div className="engine-grid">
          <div className="engine-card">
            <div className="engine-tag">Dashboard engine</div>
            <p>Turns a database schema (DBML, Mermaid, or a screenshot) into an
            interactive admin dashboard with full CRUD.</p>
          </div>
          <div className="engine-card">
            <div className="engine-tag">Website engine</div>
            <p>Turns a page/navigation layout into a multi-page website, and can
            theme it from a mockup image's colors and style.</p>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to try it?</h2>
        <Link to="/tool" className="btn btn-primary btn-lg">Open the tool</Link>
      </section>
    </div>
  );
}
