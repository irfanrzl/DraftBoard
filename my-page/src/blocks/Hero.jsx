import React from "react";
export default function Hero({ block, site }) {
  const variant = block.variant || "centered";
  if (variant === "centered") {
    return (
      <section className="l-hero l-hero-center">
        <div className="l-hero-inner">
          <span className="l-eyebrow">{site.name}</span>
          <h1 className="l-h1">{block.heading || "A headline that sells the idea"}</h1>
          <p className="l-lead">Replace this with your value proposition. Say what it is and why it matters, in a sentence or two.</p>
          <div className="l-cta-row">
            <a className="l-btn l-btn-primary l-btn-lg">Get started</a>
            <a className="l-btn l-btn-ghost l-btn-lg">Learn more</a>
          </div>
        </div>
      </section>
    );
  }
  // split-left / split-right
  const imageLeft = variant === "split-left";
  return (
    <section className="l-hero l-hero-split">
      <div className={"l-split" + (imageLeft ? " reverse" : "")}>
        <div className="l-split-text">
          <span className="l-eyebrow">{site.name}</span>
          <h1 className="l-h1">{block.heading || "A headline that sells the idea"}</h1>
          <p className="l-lead">Replace this with your value proposition. Say what it is and why it matters.</p>
          <div className="l-cta-row">
            <a className="l-btn l-btn-primary l-btn-lg">Get started</a>
            <a className="l-btn l-btn-ghost l-btn-lg">Learn more</a>
          </div>
        </div>
        <div className="l-split-media"><div className="l-media" /></div>
      </div>
    </section>
  );
}
