const KEY = "curio-recent-searches";
const LIMIT = 8;

function canStore() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function getRecentSearches() {
  if (!canStore()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string").slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export function recordRecentSearch(query: string) {
  const clean = query.trim();
  if (!clean || !canStore()) return;

  const next = [clean, ...getRecentSearches().filter((value) => value.toLowerCase() !== clean.toLowerCase())].slice(
    0,
    LIMIT,
  );
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  if (canStore()) window.localStorage.removeItem(KEY);
}
