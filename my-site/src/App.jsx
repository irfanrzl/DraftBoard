import React from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { site } from "./site.js";
import Hero from "./pages/Hero.jsx";
import List from "./pages/List.jsx";
import Form from "./pages/Form.jsx";
import Generic from "./pages/Generic.jsx";

// page name -> URL path. First page is "/".
export function pathFor(name) {
  const first = site.pages[0];
  if (first && first.name === name) return "/";
  return "/" + name.toLowerCase();
}

const ARCHETYPES = { hero: Hero, list: List, form: Form, generic: Generic, auth: Form, detail: Generic };

function renderPage(page) {
  const Component = ARCHETYPES[page.type] || Generic;
  return <Component page={page} />;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="site">
      <header className="nav">
        <div className="brand">{site.name}</div>
        <nav>
          {site.pages.map((p) => (
            <NavLink
              key={p.name}
              to={pathFor(p.name)}
              className={({ isActive }) => "navlink" + (isActive ? " active" : "")}
            >
              {p.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Routes>
          {site.pages.map((p) => (
            <Route key={p.name} path={pathFor(p.name)} element={renderPage(p)} />
          ))}
          <Route path="*" element={<div className="container"><h1>Page not found</h1></div>} />
        </Routes>
      </main>

      <footer className="footer">
        <span>{site.name}</span>
        <span className="muted">Generated skeleton · fill in your content</span>
      </footer>
    </div>
  );
}
