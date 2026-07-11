import { DEFAULT_STATE } from "./filter";
import type { DiscoveryState, SortKey } from "./types";

const SORTS: SortKey[] = ["relevance", "newest", "best-sellers", "top-rated", "price-low", "price-high"];
const AVAILABILITY = ["all", "in-stock", "out-of-stock"] as const;

type ParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function read(input: ParamsInput, key: string) {
  if (input instanceof URLSearchParams) return input.get(key) ?? "";
  const value = input[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readList(input: ParamsInput, key: string) {
  const value = read(input, key);
  return value ? value.split(",").map(decodeURIComponent).filter(Boolean) : [];
}

export function parseState(input: ParamsInput): DiscoveryState {
  const sort = read(input, "sort") as SortKey;
  const availability = read(input, "availability") as DiscoveryState["availability"];
  const rating = Number.parseInt(read(input, "rating"), 10);

  return {
    ...DEFAULT_STATE,
    query: read(input, "q"),
    category: read(input, "category") || DEFAULT_STATE.category,
    brands: readList(input, "brand"),
    productTypes: readList(input, "type"),
    materials: readList(input, "material"),
    styles: readList(input, "style"),
    price: read(input, "price"),
    rating: Number.isFinite(rating) ? rating : 0,
    availability: AVAILABILITY.includes(availability) ? availability : "all",
    sort: SORTS.includes(sort) ? sort : "relevance",
  };
}

export function serializeState(state: DiscoveryState) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== "All") params.set("category", state.category);
  if (state.brands.length) params.set("brand", state.brands.map(encodeURIComponent).join(","));
  if (state.productTypes.length) params.set("type", state.productTypes.map(encodeURIComponent).join(","));
  if (state.materials.length) params.set("material", state.materials.map(encodeURIComponent).join(","));
  if (state.styles.length) params.set("style", state.styles.map(encodeURIComponent).join(","));
  if (state.price) params.set("price", state.price);
  if (state.rating) params.set("rating", String(state.rating));
  if (state.availability !== "all") params.set("availability", state.availability);
  if (state.sort !== "relevance") params.set("sort", state.sort);
  const query = params.toString();
  return query ? `?${query}` : "/";
}
