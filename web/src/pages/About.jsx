import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="page">
      <section className="page-hero">
        <span className="eyebrow">About</span>
        <h1 className="page-h1">The project</h1>
        <p className="page-sub">
          Draftboard is an independent project exploring how far a tool can go
          from a rough diagram to a real, working interface.
        </p>
      </section>

      <section className="about-body">
        <div className="about-col">
          <h3>Why it exists</h3>
          <p>
            Building the same admin CRUD screens over and over is tedious, and the
            structure is usually already sitting in a database diagram. Draftboard
            reads that structure and does the scaffolding for you — turning a
            schema into an interactive dashboard, and a page layout into a website.
          </p>
          <p>
            It's built to run locally and privately: your diagrams never leave your
            machine, and the screenshot reader uses a local vision model rather
            than a cloud service.
          </p>
        </div>

        <div className="about-col">
          <h3>The author</h3>
          <p>Made by <b>Irfan</b> as a personal project.</p>
          <div className="about-links">
            <a href="mailto:you@example.com" className="about-link">
              <span className="al-ico">✉</span> you@example.com
            </a>
            <a href="https://github.com/irfanrzl/Draftboard" target="_blank" rel="noreferrer" className="about-link">
              <span className="al-ico">⌥</span> github.com/irfanrzl/Draftboard
            </a>
          </div>
          <p className="about-note">
            Replace the email above with your real contact before sharing.
          </p>
        </div>
      </section>

      <section className="cta-band">
        <h2>Have a look</h2>
        <Link to="/tool" className="btn btn-primary btn-lg">Open the tool</Link>
      </section>
    </div>
  );
}
