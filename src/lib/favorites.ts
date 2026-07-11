"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "curio-favorite-product-ids";
const CHANGE_EVENT = "curio-favorites-change";

function readFavorites() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "number") : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: number[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.setTimeout(() => window.dispatchEvent(new Event(CHANGE_EVENT)), 0);
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    setIds(readFavorites());

    function syncFavorites() {
      setIds(readFavorites());
    }

    window.addEventListener(CHANGE_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener(CHANGE_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const favorites = useMemo(() => new Set(ids), [ids]);

  const toggleFavorite = useCallback((id: number) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      writeFavorites(next);
      return next;
    });
  }, []);

  return {
    favoriteIds: ids,
    favorites,
    toggleFavorite,
  };
}
