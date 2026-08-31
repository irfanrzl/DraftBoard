import React from "react";
export default function Grid({ block }) {
  const cols = block.columns || 3;
  const items = Array.from({ length: cols === 2 ? 4 : cols === 4 ? 4 : 3 });
  return (
    <section className="l-section">
      <h2 className="l-h2">{block.heading || "What you get"}</h2>
      <div className="l-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {items.map((_, i) => (
          <div className="l-card" key={i}>
            <div className="l-card-ico" />
            <h3>Feature {i + 1}</h3>
            <p>A short description of this feature. Swap in your own content.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
