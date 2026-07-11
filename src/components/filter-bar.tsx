"use client";

import { displayFacet } from "@/lib/facets";
import { DEFAULT_STATE, PRICE_RANGES } from "@/lib/filter";
import type { CatalogVocabulary, DiscoveryState, FacetOption, SortKey } from "@/lib/types";

type Counts = {
  brands: FacetOption[];
  productTypes: FacetOption[];
  materials: FacetOption[];
  styles: FacetOption[];
};

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Most Relevant",
  newest: "Newest",
  "best-sellers": "Best Sellers",
  "top-rated": "Top Rated",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
};

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function NativeMultiSelect({
  label,
  options,
  selected,
  format = (value) => value,
  onChange,
}: {
  label: string;
  options: FacetOption[];
  selected: string[];
  format?: (value: string) => string;
  onChange: (next: string[]) => void;
}) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-secondary">
        {label}
        {selected.length > 0 && <span className="ml-2 text-accent">({selected.length})</span>}
      </summary>
      <div className="absolute z-20 mt-2 max-h-80 w-64 overflow-auto rounded-md border border-border bg-surface p-3 shadow-sm">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center justify-between gap-4 rounded-sm px-2 py-2 text-sm ${
              option.disabled && !selected.includes(option.value) ? "text-secondary/50" : "text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                disabled={option.disabled && !selected.includes(option.value)}
                onChange={() => onChange(toggle(selected, option.value))}
                className="accent-[var(--color-accent)]"
              />
              {format(option.value)}
            </span>
            <span className="text-xs text-secondary">{option.count}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function chipLabel(key: keyof DiscoveryState, value: string | number) {
  if (key === "price") return PRICE_RANGES[String(value)]?.label ?? String(value);
  if (key === "rating") return `${value}+ stars`;
  if (key === "availability") return value === "in-stock" ? "In stock" : "Out of stock";
  if (key === "materials" || key === "styles" || key === "productTypes") return displayFacet(String(value));
  return String(value);
}

export function FilterBar({
  state,
  vocabulary,
  counts,
  resultCount,
  onChange,
}: {
  state: DiscoveryState;
  vocabulary: CatalogVocabulary;
  counts: Counts;
  resultCount: number;
  onChange: (next: DiscoveryState) => void;
}) {
  const chips: { key: keyof DiscoveryState; value: string | number }[] = [
    ...state.brands.map((value) => ({ key: "brands" as const, value })),
    ...state.productTypes.map((value) => ({ key: "productTypes" as const, value })),
    ...state.materials.map((value) => ({ key: "materials" as const, value })),
    ...state.styles.map((value) => ({ key: "styles" as const, value })),
    ...(state.price ? [{ key: "price" as const, value: state.price }] : []),
    ...(state.rating ? [{ key: "rating" as const, value: state.rating }] : []),
    ...(state.availability !== "all" ? [{ key: "availability" as const, value: state.availability }] : []),
  ];

  function removeChip(key: keyof DiscoveryState, value: string | number) {
    if (Array.isArray(state[key])) {
      onChange({ ...state, [key]: (state[key] as string[]).filter((item) => item !== value) });
    } else {
      onChange({ ...state, [key]: DEFAULT_STATE[key] });
    }
  }

  return (
    <section className="space-y-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <NativeMultiSelect
            label="Type"
            options={counts.productTypes}
            selected={state.productTypes}
            format={displayFacet}
            onChange={(productTypes) => onChange({ ...state, productTypes })}
          />
          <NativeMultiSelect
            label="Material"
            options={counts.materials}
            selected={state.materials}
            format={displayFacet}
            onChange={(materials) => onChange({ ...state, materials })}
          />
          <NativeMultiSelect
            label="Style"
            options={counts.styles}
            selected={state.styles}
            format={displayFacet}
            onChange={(styles) => onChange({ ...state, styles })}
          />
          <NativeMultiSelect
            label="Brand"
            options={counts.brands}
            selected={state.brands}
            onChange={(brands) => onChange({ ...state, brands })}
          />
          <select
            aria-label="Price"
            value={state.price}
            onChange={(event) => onChange({ ...state, price: event.target.value })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="">Any price</option>
            {Object.entries(PRICE_RANGES).map(([key, range]) => (
              <option key={key} value={key}>
                {range.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Rating"
            value={state.rating}
            onChange={(event) => onChange({ ...state, rating: Number(event.target.value) })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value={0}>Any rating</option>
            <option value={4}>4+ stars</option>
            <option value={4.5}>4.5+ stars</option>
          </select>
          <select
            aria-label="Availability"
            value={state.availability}
            onChange={(event) => onChange({ ...state, availability: event.target.value as DiscoveryState["availability"] })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Any availability</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </div>
        <select
          aria-label="Sort products"
          value={state.sort}
          onChange={(event) => onChange({ ...state, sort: event.target.value as SortKey })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm text-secondary" aria-live="polite">
          {resultCount.toLocaleString()} Results
        </p>
        {chips.map((chip) => (
          <button
            key={`${chip.key}-${chip.value}`}
            type="button"
            onClick={() => removeChip(chip.key, chip.value)}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
          >
            {chipLabel(chip.key, chip.value)} ×
          </button>
        ))}
        {chips.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_STATE, query: state.query, category: state.category })}
            className="px-2 py-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Clear All
          </button>
        )}
        <span className="sr-only">{vocabulary.brands.length} brands available</span>
      </div>
    </section>
  );
}
