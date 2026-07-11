import type { SearchResult, SortKey } from "./types";

function missingLast(a: number | null, b: number | null, direction: "asc" | "desc") {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === "asc" ? a - b : b - a;
}

export function sortResults(results: SearchResult[], sort: SortKey) {
  return [...results].sort((a, b) => {
    switch (sort) {
      case "newest":
        return b.item.releasedAtMs - a.item.releasedAtMs;
      case "best-sellers":
        return b.item.reviews - a.item.reviews;
      case "top-rated":
        return missingLast(a.item.rating, b.item.rating, "desc");
      case "price-low":
        return missingLast(a.item.price, b.item.price, "asc");
      case "price-high":
        return missingLast(a.item.price, b.item.price, "desc");
      case "relevance":
      default:
        return b.score - a.score;
    }
  });
}
