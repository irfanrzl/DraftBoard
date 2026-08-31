import type { Spec, Entity, Field } from "./spec.js";
import { mockData, type MockRow } from "./mock.js";

/**
 * Generate a single, fully self-contained HTML dashboard for a Spec.
 * No external requests: all CSS is inlined, no CDN, no React, no build step.
 * Open the file in any browser (works offline).
 */
export function generateHtml(spec: Spec): string {
  const data = mockData(spec, 6);

  const nav = spec.entities
    .map(
      (e, i) =>
        `<button class="nav-item${i === 0 ? " active" : ""}" data-entity="${attr(
          e.name,
        )}" onclick="showEntity('${attr(e.name)}')">${esc(e.label)}</button>`,
    )
    .join("\n        ");

  const panels = spec.entities
    .map((e, i) => renderPanel(e, data[e.name] ?? [], i === 0))
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(spec.name)} — Dashboard</title>
<style>
  :root {
    --ink: #1c1b22;
    --muted: #6b7280;
    --line: #e5e7eb;
    --paper: #f7f6f3;
    --card: #ffffff;
    --accent: #4f46e5;
    --accent-soft: #eef2ff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--ink);
    background: var(--paper);
  }
  .layout { display: flex; min-height: 100vh; }
  aside {
    width: 224px; flex-shrink: 0;
    background: var(--card); border-right: 1px solid var(--line);
    padding: 16px;
  }
  .brand { padding: 0 8px; margin-bottom: 24px; }
  .brand .name { font-size: 18px; font-weight: 700; }
  .brand .sub { font-size: 12px; color: #9ca3af; }
  .nav-item {
    display: block; width: 100%; text-align: left;
    border: 0; background: transparent; cursor: pointer;
    padding: 8px 12px; margin-bottom: 4px; border-radius: 8px;
    font-size: 14px; color: var(--muted); font-family: inherit;
  }
  .nav-item:hover { background: #f3f4f6; }
  .nav-item.active { background: var(--accent); color: #fff; }
  main { flex: 1; padding: 32px; }
  .head { margin-bottom: 24px; }
  .head h1 { margin: 0; font-size: 24px; font-weight: 700; }
  .head p { margin: 4px 0 0; font-size: 14px; color: var(--muted); }
  .panel { display: none; }
  .panel.active { display: block; }
  .card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead { background: #f9fafb; }
  th {
    text-align: left; font-weight: 600; color: var(--muted);
    padding: 12px 16px; border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }
  td {
    padding: 12px 16px; border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }
  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: #f9fafb; }
  .badge {
    display: inline-block; padding: 2px 10px; border-radius: 9999px;
    font-size: 12px; font-weight: 500;
  }
  .avatar { width: 32px; height: 32px; border-radius: 9999px; object-fit: cover; }
  .rel-chip {
    background: var(--accent-soft); color: var(--accent);
    padding: 2px 8px; border-radius: 6px; font-size: 12px;
  }
  .muted { color: var(--muted); }
  .empty { color: #d1d5db; }
  .num { font-variant-numeric: tabular-nums; }
  .relations {
    margin-top: 24px; background: var(--card);
    border: 1px solid var(--line); border-radius: 12px; padding: 16px;
  }
  .relations .title {
    font-size: 14px; font-weight: 600; color: var(--muted); margin-bottom: 8px;
  }
  .relations li { font-size: 14px; color: var(--muted); margin: 4px 0; list-style: none; }
  .relations ul { padding: 0; margin: 0; }
  .relations strong { color: var(--ink); }
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="brand">
      <div class="name">${esc(spec.name)}</div>
      <div class="sub">Dashboard</div>
    </div>
    <nav>
        ${nav}
    </nav>
  </aside>
  <main>
${panels}
  </main>
</div>
<script>
  function showEntity(name) {
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-panel') === name);
    });
    document.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-entity') === name);
    });
  }
</script>
</body>
</html>`;
}

function renderPanel(entity: Entity, rows: MockRow[], active: boolean): string {
  const cols = entity.fields.filter((f) => f.ui !== "hidden");

  const head = cols.map((f) => `<th>${esc(labelize(f.name))}</th>`).join("");

  const body = rows
    .map((row) => {
      const cells = cols
        .map((f) => `<td>${renderCell(f, row[f.name])}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\n            ");

  const relations =
    entity.relations && entity.relations.length > 0
      ? `<div class="relations">
      <div class="title">Relations</div>
      <ul>
        ${entity.relations
          .map(
            (r) =>
              `<li><strong>${esc(entity.name)}</strong> <span class="muted">— ${esc(
                r.type,
              )} —</span> <strong>${esc(r.to)}</strong></li>`,
          )
          .join("\n        ")}
      </ul>
    </div>`
      : "";

  return `    <div class="panel${active ? " active" : ""}" data-panel="${attr(
    entity.name,
  )}">
      <div class="head">
        <h1>${esc(entity.label)}</h1>
        <p>${rows.length} records · ${entity.fields.length} fields</p>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>${head}</tr></thead>
            <tbody>
            ${body}
            </tbody>
          </table>
        </div>
      </div>
      ${relations}
    </div>`;
}

const BADGE_STYLES = [
  "background:#d1fae5;color:#065f46",
  "background:#fef3c7;color:#92400e",
  "background:#ffe4e6;color:#9f1239",
  "background:#e0f2fe;color:#075985",
  "background:#ede9fe;color:#5b21b6",
];
function badgeStyle(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return BADGE_STYLES[h % BADGE_STYLES.length];
}

function renderCell(field: Field, value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return `<span class="empty">—</span>`;
  }
  switch (field.ui) {
    case "badge":
      return `<span class="badge" style="${badgeStyle(String(value))}">${esc(
        String(value),
      )}</span>`;
    case "image":
      return `<img class="avatar" src="${attr(String(value))}" alt="" />`;
    case "toggle":
      return value
        ? `<span style="color:#059669">Yes</span>`
        : `<span class="muted">No</span>`;
    case "date-column":
      return `<span class="num muted">${esc(formatDate(value))}</span>`;
    case "number":
      return `<span class="num">${esc(String(value))}</span>`;
    case "relation-picker":
      return `<span class="rel-chip">${esc(String(value))}</span>`;
    case "textarea":
      return `<span class="muted">${esc(truncate(String(value), 48))}</span>`;
    default:
      return esc(String(value));
  }
}

function formatDate(value: unknown): string {
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function labelize(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}
