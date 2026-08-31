import React from "react";
export default function Feature({ block }) {
  const imageLeft = block.imageSide === "left";
  return (
    <section className="l-section">
      <div className={"l-split" + (imageLeft ? " reverse" : "")}>
        <div className="l-split-text">
          <h2 className="l-h2">{block.heading || "A focused feature"}</h2>
          <p className="l-lead">Explain one thing well here. Pair the text with a visual to make the point land.</p>
          <a className="l-btn l-btn-ghost">Learn more</a>
        </div>
        <div className="l-split-media"><div className="l-media" /></div>
      </div>
    </section>
  );
}
