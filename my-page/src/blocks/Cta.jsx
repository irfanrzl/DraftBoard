import React from "react";
export default function Cta({ block }) {
  return (
    <section className="l-cta-band">
      <h2 className="l-h2">{block.heading || "Ready to get started?"}</h2>
      <p className="l-lead">A closing line that nudges the visitor to act.</p>
      <a className="l-btn l-btn-primary l-btn-lg">Get started</a>
    </section>
  );
}
