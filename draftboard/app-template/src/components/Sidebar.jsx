import React from "react";
import { useStore } from "../store.jsx";

export default function Sidebar({ active, onNavigate }) {
  const { schema, list } = useStore();
  return (
    <aside>
      <div className="brand">
        <div className="name">{schema.name}</div>
        <div className="sub">Dashboard</div>
      </div>
      <nav>
        {schema.entities.map((e) => (
          <button
            key={e.name}
            className={"nav-item" + (e.name === active ? " active" : "")}
            onClick={() => onNavigate({ view: "list", entity: e.name })}
          >
            <span>{e.label}</span>
            <span className="count">{list(e.name).length}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
