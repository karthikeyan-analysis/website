import { useState, useCallback } from "react";

export const useAdminData = (storageKey, initialData = []) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialData;
  });

  const saveData = useCallback(
    (newData) => {
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setData(newData);
    },
    [storageKey],
  );

  const addItem = useCallback(
    (item) => {
      const newItem = { ...item, id: Date.now() };
      const updated = [...data, newItem];
      saveData(updated);
      return newItem;
    },
    [data, saveData],
  );

  const updateItem = useCallback(
    (id, updates) => {
      const updated = data.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      );
      saveData(updated);
    },
    [data, saveData],
  );

  const deleteItem = useCallback(
    (id) => {
      const updated = data.filter((item) => item.id !== id);
      saveData(updated);
    },
    [data, saveData],
  );

  const getItem = useCallback(
    (id) => {
      return data.find((item) => item.id === id);
    },
    [data],
  );

  return {
    data,
    saveData,
    addItem,
    updateItem,
    deleteItem,
    getItem,
  };
};
