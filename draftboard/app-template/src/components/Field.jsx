import React from "react";

const BADGE_STYLES = [
  { background: "#d1fae5", color: "#065f46" },
  { background: "#fef3c7", color: "#92400e" },
  { background: "#ffe4e6", color: "#9f1239" },
  { background: "#e0f2fe", color: "#075985" },
  { background: "#ede9fe", color: "#5b21b6" },
];
function badgeStyle(value) {
  let h = 0;
  const s = String(value);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return BADGE_STYLES[h % BADGE_STYLES.length];
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
}

/**
 * Render a single field value according to its UI hint.
 * `onRelation` (optional) is called when a relation chip is clicked.
 */
export default function Field({ field, value, onRelation }) {
  if (value === null || value === undefined || value === "") {
    return <span className="empty">\u2014</span>;
  }
  switch (field.ui) {
    case "badge":
      return <span className="badge" style={badgeStyle(value)}>{String(value)}</span>;
    case "image":
      return <img className="avatar" src={value} alt="" />;
    case "toggle":
      return value
        ? <span style={{ color: "#059669" }}>Yes</span>
        : <span className="muted">No</span>;
    case "date-column":
      return <span className="num muted">{formatDate(value)}</span>;
    case "number":
      return <span className="num">{String(value)}</span>;
    case "relation-picker":
      return onRelation ? (
        <a className="rel-chip" onClick={(e) => { e.stopPropagation(); onRelation(); }}>
          {String(value)}
        </a>
      ) : (
        <span className="rel-chip">{String(value)}</span>
      );
    case "textarea":
      return <span className="muted">{truncate(String(value), 60)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
}

export { formatDate };
