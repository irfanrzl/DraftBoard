import React from "react";
import { useStore } from "../store.jsx";
import Field, { formatDate } from "./Field.jsx";
import { labelize } from "./EntityTable.jsx";

export default function DetailView({ entity, id, onNavigate }) {
  const store = useStore();
  const def = store.schema.entities.find((e) => e.name === entity);
  const record = store.get(entity, id);
  const pk = store.primaryKey(entity);

  if (!record) {
    return (
      <div>
        <div className="crumb">
          <a onClick={() => onNavigate({ view: "list", entity })}>{def.label}</a>
        </div>
        <div className="empty-state">
          <div className="big">Record not found</div>
        </div>
      </div>
    );
  }

  // Title: prefer a field with role "title", else the pk.
  const titleField = def.fields.find((f) => f.role === "title");
  const title = titleField ? record[titleField.name] : record[pk];

  const shown = def.fields.filter((f) => f.ui !== "hidden");

  // one-to-many relations: find child rows that reference this record.
  const childRelations = (def.relations ?? []).filter(
    (r) => r.type === "one-to-many",
  );

  return (
    <div>
      <div className="crumb">
        <a onClick={() => onNavigate({ view: "list", entity })}>{def.label}</a>
        {" / "}
        {String(title)}
      </div>

      <div className="page-head">
        <h1>{String(title)}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn"
            onClick={() => onNavigate({ view: "edit", entity, id })}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm("Delete this record?")) {
                store.remove(entity, id);
                onNavigate({ view: "list", entity });
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="card">
        <div className="detail-grid">
          {shown.map((f) => {
            const rel = (def.relations ?? []).find(
              (r) => r.field === f.name && r.type === "many-to-one",
            );
            return (
              <div className="detail-row" key={f.name}>
                <div className="k">{labelize(f.name)}</div>
                <div className="v">
                  <Field
                    field={f}
                    value={record[f.name]}
                    onRelation={
                      rel
                        ? () =>
                            onNavigate({
                              view: "detail",
                              entity: rel.to,
                              id: record[f.name],
                            })
                        : undefined
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {childRelations.map((rel) => (
        <RelatedList
          key={rel.to}
          parentEntity={entity}
          parentId={id}
          rel={rel}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function RelatedList({ parentEntity, parentId, rel, onNavigate }) {
  const store = useStore();
  const childDef = store.schema.entities.find((e) => e.name === rel.to);
  if (!childDef) return null;

  // Find the FK on the child that points back to the parent.
  const backRel = (childDef.relations ?? []).find(
    (r) => r.to === parentEntity && r.type === "many-to-one",
  );
  if (!backRel) return null;

  const children = store
    .list(rel.to)
    .filter((r) => String(r[backRel.field]) === String(parentId));

  const cols = childDef.fields.filter((f) => f.ui !== "hidden").slice(0, 4);

  return (
    <div>
      <div className="section-title">{childDef.label}</div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{cols.map((f) => <th key={f.name}>{labelize(f.name)}</th>)}</tr>
            </thead>
            <tbody>
              {children.map((row) => (
                <tr
                  key={row[store.primaryKey(rel.to)]}
                  onClick={() =>
                    onNavigate({
                      view: "detail",
                      entity: rel.to,
                      id: row[store.primaryKey(rel.to)],
                    })
                  }
                >
                  {cols.map((f) => (
                    <td key={f.name}><Field field={f} value={row[f.name]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {children.length === 0 && (
            <div className="empty-state"><div>No related {childDef.label.toLowerCase()}.</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
