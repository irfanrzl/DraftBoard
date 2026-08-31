import React, { createContext, useContext, useState, useCallback } from "react";
import { schema } from "./schema.js";
import { seedData } from "./seedData.js";

const StoreContext = createContext(null);

let idCounter = 100000;
function newId() {
  return "rec-" + ++idCounter;
}

/** Find the primary-key field name for an entity. */
function primaryKey(entityName) {
  const entity = schema.entities.find((e) => e.name === entityName);
  const pk = entity?.fields.find((f) => f.role === "primary");
  return pk?.name ?? "id";
}

export function StoreProvider({ children }) {
  // data: { EntityName: [rows] }
  const [data, setData] = useState(() =>
    JSON.parse(JSON.stringify(seedData)),
  );

  const list = useCallback((entity) => data[entity] ?? [], [data]);

  const get = useCallback(
    (entity, id) => {
      const pk = primaryKey(entity);
      return (data[entity] ?? []).find((r) => String(r[pk]) === String(id));
    },
    [data],
  );

  const create = useCallback((entity, row) => {
    const pk = primaryKey(entity);
    const record = { ...row };
    if (!record[pk]) record[pk] = newId();
    setData((d) => ({ ...d, [entity]: [record, ...(d[entity] ?? [])] }));
    return record;
  }, []);

  const update = useCallback((entity, id, patch) => {
    const pk = primaryKey(entity);
    setData((d) => ({
      ...d,
      [entity]: (d[entity] ?? []).map((r) =>
        String(r[pk]) === String(id) ? { ...r, ...patch } : r,
      ),
    }));
  }, []);

  const remove = useCallback((entity, id) => {
    const pk = primaryKey(entity);
    setData((d) => ({
      ...d,
      [entity]: (d[entity] ?? []).filter((r) => String(r[pk]) !== String(id)),
    }));
  }, []);

  const value = { schema, data, list, get, create, update, remove, primaryKey };
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
