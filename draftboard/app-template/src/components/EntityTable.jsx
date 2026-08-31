import React, { useState, useMemo } from "react";
import { useStore } from "../store.jsx";
import Field from "./Field.jsx";

function labelize(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EntityTable({ entity, onNavigate }) {
  const store = useStore();
  const def = store.schema.entities.find((e) => e.name === entity);
  const rows = store.list(entity);
  const pk = store.primaryKey(entity);

  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const cols = def.fields.filter((f) => f.ui !== "hidden");

  const filtered = useMemo(() => {
    let out = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) =>
        cols.some((c) => String(r[c.name] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sortField) {
      out = [...out].sort((a, b) => {
        const av = a[sortField], bv = b[sortField];
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sortField, sortDir, cols]);

  function toggleSort(name) {
    if (sortField === name) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(name);
      setSortDir("asc");
    }
  }

  function relationTarget(field) {
    const rel = (def.relations ?? []).find(
      (r) => r.field === field.name && r.type === "many-to-one",
    );
    return rel?.to ?? null;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{def.label}</h1>
          <div className="meta">{filtered.length} of {rows.length} records</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate({ view: "create", entity })}
        >
          + New {def.name}
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder={"Search " + def.label.toLowerCase() + "\u2026"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cols.map((f) => (
                  <th
                    key={f.name}
                    className="sortable"
                    onClick={() => toggleSort(f.name)}
                  >
                    {labelize(f.name)}
                    {sortField === f.name && (
                      <span className="arrow">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row[pk]}
                  onClick={() => onNavigate({ view: "detail", entity, id: row[pk] })}
                >
                  {cols.map((f) => {
                    const target = relationTarget(f);
                    return (
                      <td key={f.name}>
                        <Field
                          field={f}
                          value={row[f.name]}
                          onRelation={
                            target
                              ? () =>
                                  onNavigate({
                                    view: "detail",
                                    entity: target,
                                    id: row[f.name],
                                  })
                              : undefined
                          }
                        />
                      </td>
                    );
                  })}
                  <td className="actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate({ view: "edit", entity, id: row[pk] });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this record?")) store.remove(entity, row[pk]);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="big">No records</div>
              <div>{query ? "Try a different search." : "Create your first record to get started."}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { labelize };
