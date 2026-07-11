"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecentSearches } from "@/lib/recent-searches";
import { vocabularyTerms } from "@/lib/facets";
import { runDiscovery } from "@/lib/filter";
import type { CatalogVocabulary, DiscoveryState, NormalizedProduct } from "@/lib/types";
import Image from "next/image";

function OverlayProductCard({ item }: { item: NormalizedProduct }) {
  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
      <p className="mt-3 font-serif text-xl leading-tight text-foreground">{item.title}</p>
    </article>
  );
}

export function SearchOverlay({
  open,
  query,
  catalog,
  vocabulary,
  state,
  onSearch,
  onClose,
}: {
  open: boolean;
  query: string;
  catalog: NormalizedProduct[];
  vocabulary: CatalogVocabulary;
  state: DiscoveryState;
  onSearch: (query: string) => void;
  onClose: () => void;
}) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const terms = useMemo(() => vocabularyTerms(vocabulary), [vocabulary]);
  const suggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return terms.slice(0, 3);
    return terms.filter((term) => term.toLowerCase().startsWith(clean)).slice(0, 3);
  }, [query, terms]);

  const featured = useMemo(() => {
    if (query.trim()) return runDiscovery(catalog, { ...state, query }).slice(0, 3);

    return [...catalog]
      .sort((a, b) => (b.rating ?? 0) * b.reviews - (a.rating ?? 0) * a.reviews)
      .slice(0, 5);
  }, [catalog, query, state]);

  const trending = useMemo(() => {
    const score = new Map<string, number>();
    for (const item of catalog) {
      for (const term of [item.category, ...item.facets.materials, ...item.facets.styles]) {
        const label = term.length <= 3 ? term.toUpperCase() : term.replace(/\b\w/g, (letter) => letter.toUpperCase());
        score.set(label, (score.get(label) ?? 0) + item.reviews);
      }
    }
    return [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([term]) => term);
  }, [catalog]);

  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-30 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto max-h-[460px] max-w-7xl overflow-y-auto px-4 py-6 lg:px-8">
        {query.trim() ? (
          <div className="grid gap-8 md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.8fr)]">
            <section>
              <div className="mb-4">
                <h2 className="font-sans text-xl font-black uppercase tracking-[0.04em] text-foreground">
                  Recommended Searches
                </h2>
              </div>
              <div className="flex flex-col items-start gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSearch(suggestion)}
                    className="min-h-0 py-1 text-left font-sans text-lg font-bold leading-tight text-foreground hover:text-accent"
                  >
                    <strong>{suggestion.slice(0, query.length)}</strong>
                    {suggestion.slice(query.length)}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h2 className="mb-5 font-sans text-xl font-black uppercase tracking-[0.04em] text-foreground">
                Featured Results
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {featured.map((item) => (
                  <OverlayProductCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[minmax(220px,0.55fr)_minmax(0,2fr)]">
            <div className="space-y-8">
              <section>
                <div className="mb-4">
                  <h2 className="font-sans text-xl font-black uppercase tracking-[0.04em] text-foreground">
                    Recent Searches
                  </h2>
                </div>
                <div className="flex flex-col items-start gap-2">
                  {(recent.length ? recent.slice(0, 3) : ["oak storage", "brass stool", "wall art"]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSearch(item)}
                      className="min-h-0 py-1 text-left font-sans text-lg font-bold leading-tight text-foreground hover:text-accent"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="mb-4 font-sans text-xl font-black uppercase tracking-[0.04em] text-foreground">
                  Trending Searches
                </h2>
                <div className="flex flex-col items-start gap-2">
                  {trending.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSearch(item)}
                      className="min-h-0 py-1 text-left font-sans text-lg font-bold leading-tight text-foreground hover:text-accent"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <section>
              <h2 className="mb-5 font-sans text-xl font-black uppercase tracking-[0.04em] text-foreground">
                Trending Products
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {featured.map((item) => (
                  <OverlayProductCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
