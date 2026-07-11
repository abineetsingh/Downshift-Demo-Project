import { MATERIAL_TAGS, PRODUCT_TYPE_TAGS, STYLE_TAGS } from "./facets";
import { searchItems } from "./search";
import { sortResults } from "./sort";
import type {
  DiscoveryState,
  FacetFamily,
  FacetOption,
  NormalizedProduct,
  PriceRange,
} from "./types";

export const DEFAULT_STATE: DiscoveryState = {
  query: "",
  category: "All",
  brands: [],
  productTypes: [],
  materials: [],
  styles: [],
  price: "",
  rating: 0,
  availability: "all",
  sort: "relevance",
};

export const PRICE_RANGES: Record<string, PriceRange> = {
  under250: { label: "Under $250", max: 250 },
  "250-500": { label: "$250 to $500", min: 250, max: 500 },
  "500-800": { label: "$500 to $800", min: 500, max: 800 },
  over800: { label: "Over $800", min: 800 },
};

function includesAny(values: string[], selected: string[]) {
  return selected.length === 0 || selected.some((value) => values.includes(value));
}

export function matchesFilters(
  item: NormalizedProduct,
  state: DiscoveryState,
  excludeFamily?: "brands" | "productTypes" | "materials" | "styles",
) {
  if (state.category !== "All" && item.category !== state.category) return false;
  if (excludeFamily !== "brands" && state.brands.length > 0 && !state.brands.includes(item.brand)) {
    return false;
  }

  const familyMap: Record<FacetFamily, keyof DiscoveryState> = {
    productTypes: "productTypes",
    materials: "materials",
    styles: "styles",
  };

  for (const [family, stateKey] of Object.entries(familyMap) as [FacetFamily, keyof DiscoveryState][]) {
    if (excludeFamily !== family && !includesAny(item.facets[family], state[stateKey] as string[])) {
      return false;
    }
  }

  if (state.price) {
    if (item.price === null) return false;
    const range = PRICE_RANGES[state.price];
    if (range?.min !== undefined && item.price < range.min) return false;
    if (range?.max !== undefined && item.price > range.max) return false;
  }

  if (state.rating > 0 && (item.rating === null || item.rating < state.rating)) return false;
  if (state.availability === "in-stock" && !item.inStock) return false;
  if (state.availability === "out-of-stock" && item.inStock) return false;

  return true;
}

export function runDiscovery(items: NormalizedProduct[], state: DiscoveryState) {
  const filtered = items.filter((item) => matchesFilters(item, state));
  const searched = searchItems(filtered, state.query);
  return sortResults(searched, state.sort).map((result) => result.item);
}

function facetOptions(
  items: NormalizedProduct[],
  state: DiscoveryState,
  values: string[],
  family: FacetFamily | "brands",
) {
  return values.map<FacetOption>((value) => {
    const count = items.filter((item) => {
      if (!matchesFilters(item, state, family)) return false;
      if (family === "brands") return item.brand === value;
      return item.facets[family].includes(value);
    }).length;

    return { value, count, disabled: count === 0 };
  });
}

export function getFacetCounts(items: NormalizedProduct[], state: DiscoveryState, brands: string[]) {
  return {
    brands: facetOptions(items, state, brands, "brands"),
    productTypes: facetOptions(items, state, PRODUCT_TYPE_TAGS, "productTypes"),
    materials: facetOptions(items, state, MATERIAL_TAGS, "materials"),
    styles: facetOptions(items, state, STYLE_TAGS, "styles"),
  };
}
