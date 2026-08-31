import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { labelize } from "./EntityTable.jsx";

// Which UI hints get which input type.
function inputKind(field) {
  if (field.ui === "toggle" || field.type === "bool") return "checkbox";
  if (field.ui === "badge" && field.values) return "select";
  if (field.type === "enum" && field.values) return "select";
  if (field.ui === "textarea" || field.type === "text") return "textarea";
  if (field.ui === "number" || field.type === "int" || field.type === "float") return "number";
  if (field.type === "date") return "date";
  if (field.type === "datetime") return "datetime-local";
  return "text";
}

export default function EntityForm({ entity, id, onNavigate }) {
  const store = useStore();
  const def = store.schema.entities.find((e) => e.name === entity);
  const editing = id != null;
  const existing = editing ? store.get(entity, id) : null;

  // Editable fields: skip primary keys and auto timestamps.
  const editable = def.fields.filter(
    (f) => f.role !== "primary" && f.role !== "created" && f.role !== "updated",
  );

  const [form, setForm] = useState(() => {
    const init = {};
    for (const f of editable) {
      init[f.name] = existing ? existing[f.name] ?? "" : defaultFor(f);
    }
    return init;
  });

  const [errors, setErrors] = useState({});

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const errs = {};
    for (const f of editable) {
      if (f.required && (form[f.name] === "" || form[f.name] == null)) {
        errs[f.name] = "Required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function save() {
    if (!validate()) return;
    if (editing) {
      store.update(entity, id, form);
      onNavigate({ view: "detail", entity, id });
    } else {
      const rec = store.create(entity, form);
      const pk = store.primaryKey(entity);
      onNavigate({ view: "detail", entity, id: rec[pk] });
    }
  }

  return (
    <div>
      <div className="crumb">
        <a onClick={() => onNavigate({ view: "list", entity })}>{def.label}</a>
        {" / "}
        {editing ? "Edit" : "New"}
      </div>
      <div className="page-head">
        <h1>{editing ? "Edit " + def.name : "New " + def.name}</h1>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="form">
          {editable.map((f) => (
            <div className="field" key={f.name}>
              <label>
                {labelize(f.name)}
                {f.required && <span className="req"> *</span>}
              </label>
              {renderInput(f, form[f.name], (v) => setField(f.name, v))}
              {errors[f.name] && (
                <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                  {errors[f.name]}
                </div>
              )}
            </div>
          ))}
          <div className="form-actions">
            <button className="btn btn-primary" onClick={save}>
              {editing ? "Save changes" : "Create"}
            </button>
            <button
              className="btn"
              onClick={() =>
                onNavigate(
                  editing
                    ? { view: "detail", entity, id }
                    : { view: "list", entity },
                )
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function defaultFor(field) {
  if (field.ui === "toggle" || field.type === "bool") return false;
  if ((field.ui === "badge" || field.type === "enum") && field.values) return field.values[0];
  return "";
}

function renderInput(field, value, onChange) {
  const kind = inputKind(field);
  if (kind === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: "auto" }}
      />
    );
  }
  if (kind === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {field.values.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    );
  }
  if (kind === "textarea") {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <input
      type={kind}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
