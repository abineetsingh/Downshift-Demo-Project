"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CategoryTabs } from "./category-tabs";
import { FilterBar } from "./filter-bar";
import { Header } from "./header";
import { ResultsGrid } from "./results-grid";
import { buildVocabulary } from "@/lib/facets";
import { DEFAULT_STATE, getFacetCounts, runDiscovery } from "@/lib/filter";
import { recordRecentSearch } from "@/lib/recent-searches";
import { serializeState } from "@/lib/url-state";
import type { CatalogVocabulary, DiscoveryState, NormalizedProduct } from "@/lib/types";

export function DiscoveryPage({
  catalog,
  initialState,
}: {
  catalog: NormalizedProduct[];
  initialState: DiscoveryState;
}) {
  const [state, setState] = useState<DiscoveryState>(initialState);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const deferredQuery = useDeferredValue(state.query);
  const vocabulary: CatalogVocabulary = useMemo(() => buildVocabulary(catalog), [catalog]);

  const derivedState = useMemo(() => ({ ...state, query: deferredQuery }), [deferredQuery, state]);
  const results = useMemo(() => runDiscovery(catalog, derivedState), [catalog, derivedState]);
  const counts = useMemo(
    () => getFacetCounts(catalog, { ...derivedState, query: "" }, vocabulary.brands),
    [catalog, derivedState, vocabulary.brands],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextUrl = serializeState(state);
      window.history.replaceState(null, "", nextUrl);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [state]);

  function commitSearch(query: string) {
    const clean = query.trim();
    setState((current) => ({ ...current, query: clean }));
    recordRecentSearch(clean);
    setOverlayOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        query={state.query}
        catalog={catalog}
        vocabulary={vocabulary}
        state={state}
        overlayOpen={overlayOpen}
        onOverlayOpen={() => setOverlayOpen(true)}
        onOverlayClose={() => setOverlayOpen(false)}
        onQueryChange={(query) => setState((current) => ({ ...current, query }))}
        onSearchCommit={commitSearch}
      />
      <section className="relative min-h-[280px] w-full overflow-hidden md:min-h-[420px]" aria-label="Curio room inspiration">
        <Image
          src="/branding/curio-room-banner.png"
          alt="Elegant neutral living room with wood accents and soft natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/12 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[280px] max-w-7xl items-center px-4 md:min-h-[420px] lg:px-8">
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] text-white drop-shadow-sm md:text-7xl">
            Your space, beautifully curated and thoughtfully considered.
          </h1>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <CategoryTabs
          categories={vocabulary.categories}
          active={state.category}
          onChange={(category) => setState((current) => ({ ...current, category }))}
        />
        <FilterBar
          state={state}
          vocabulary={vocabulary}
          counts={counts}
          resultCount={results.length}
          onChange={setState}
        />
        {results.length > 0 ? (
          <ResultsGrid items={results} />
        ) : (
          <section className="border-y border-border py-16 text-center">
            <h2 className="font-serif text-3xl">No results found</h2>
            <p className="mt-2 text-secondary">Try removing a filter or searching for a nearby material or product type.</p>
            <button
              type="button"
              onClick={() => setState({ ...DEFAULT_STATE, query: "" })}
              className="mt-5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Reset discovery
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
