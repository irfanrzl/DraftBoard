import React from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";

export default function App() {
  const loc = useLocation();
  const onTool = loc.pathname === "/tool";

  return (
    <div className={"shell" + (onTool ? " shell-tool" : "")}>
      <header className="topnav">
        <Link to="/" className="mark">
          <span className="diamond" />
          <span className="wordmark">Draftboard</span>
        </Link>
        <nav className="topnav-links">
          <NavLink to="/" end className="tnav">Home</NavLink>
          <NavLink to="/how" className="tnav">How it works</NavLink>
          <NavLink to="/examples" className="tnav">Examples</NavLink>
          <NavLink to="/about" className="tnav">About</NavLink>
        </nav>
        <Link to="/tool" className="tnav-cta">Open the tool</Link>
      </header>

      <main className="shell-main">
        <Outlet />
      </main>

      {!onTool && (
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="diamond small" />
              <span>Draftboard</span>
            </div>
            <div className="footer-links">
              <Link to="/how">How it works</Link>
              <Link to="/examples">Examples</Link>
              <Link to="/about">About</Link>
              <a href="https://github.com/irfanrzl/Draftboard" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <div className="footer-note">Local-first · nothing leaves your machine</div>
          </div>
        </footer>
      )}
    </div>
  );
}
