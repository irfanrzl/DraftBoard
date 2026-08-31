import React, { useState } from "react";
import { useStore } from "./store.jsx";
import Sidebar from "./components/Sidebar.jsx";
import EntityTable from "./components/EntityTable.jsx";
import EntityForm from "./components/EntityForm.jsx";
import DetailView from "./components/DetailView.jsx";

export default function App() {
  const { schema } = useStore();
  const [route, setRoute] = useState({
    view: "list",
    entity: schema.entities[0].name,
  });

  function navigate(next) {
    setRoute(next);
    window.scrollTo(0, 0);
  }

  return (
    <div className="layout">
      <Sidebar active={route.entity} onNavigate={navigate} />
      <main>
        {route.view === "list" && (
          <EntityTable entity={route.entity} onNavigate={navigate} />
        )}
        {route.view === "detail" && (
          <DetailView entity={route.entity} id={route.id} onNavigate={navigate} />
        )}
        {(route.view === "create" || route.view === "edit") && (
          <EntityForm
            entity={route.entity}
            id={route.view === "edit" ? route.id : undefined}
            onNavigate={navigate}
          />
        )}
      </main>
    </div>
  );
}
