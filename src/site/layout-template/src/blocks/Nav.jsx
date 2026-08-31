import React from "react";
export default function Nav({ site }) {
  return (
    <header className="l-nav">
      <div className="l-brand"><span className="l-mark" />{site.name}</div>
      <nav className="l-navlinks">
        <a>Home</a><a>Features</a><a>Pricing</a><a>About</a>
      </nav>
      <a className="l-btn l-btn-primary l-btn-sm">Get started</a>
    </header>
  );
}
