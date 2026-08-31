import React from "react";
export default function Footer({ site }) {
  return (
    <footer className="l-footer">
      <div className="l-brand"><span className="l-mark small" />{site.name}</div>
      <div className="l-footer-links"><a>Features</a><a>Pricing</a><a>About</a><a>Contact</a></div>
      <div className="l-muted">Generated skeleton · fill in your content</div>
    </footer>
  );
}
