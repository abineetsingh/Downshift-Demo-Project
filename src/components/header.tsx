"use client";

import Image from "next/image";
import { SearchOverlay } from "./search-overlay";
import type { CatalogVocabulary, DiscoveryState, NormalizedProduct } from "@/lib/types";

export function Header({
  query,
  catalog,
  vocabulary,
  state,
  overlayOpen,
  onOverlayOpen,
  onOverlayClose,
  onQueryChange,
  onSearchCommit,
}: {
  query: string;
  catalog: NormalizedProduct[];
  vocabulary: CatalogVocabulary;
  state: DiscoveryState;
  overlayOpen: boolean;
  onOverlayOpen: () => void;
  onOverlayClose: () => void;
  onQueryChange: (query: string) => void;
  onSearchCommit: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-black">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 lg:px-8">
          <div aria-hidden="true" />
          <Image
            src="/branding/curio-banner-dark.png"
            alt="Curio"
            width={168}
            height={39}
            priority
            className="h-10 w-auto object-contain"
          />
          <div aria-hidden="true" />
        </div>
      </div>
      <div className="relative border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="shrink-0 space-y-1">
            <Image src="/branding/curio-banner.png" alt="Curio" width={135} height={38} priority />
            <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-secondary">
              Curated Home Goods
            </p>
          </div>
          <form
            className="flex w-full items-center gap-3 md:max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchCommit(query);
            }}
          >
            <label className="sr-only" htmlFor="curio-search">
              Search products
            </label>
            <div className="relative flex-1">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary/70 drop-shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4 4" />
                </svg>
              </span>
              <input
                id="curio-search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                onFocus={onOverlayOpen}
                placeholder="Search"
                className="h-12 w-full rounded-md border border-border bg-background px-4 pl-11 text-base text-foreground shadow-[inset_0_1px_1px_rgba(23,23,23,0.04)] outline-none transition-shadow placeholder:text-secondary focus:shadow-[0_10px_28px_rgba(23,23,23,0.14),inset_0_1px_1px_rgba(23,23,23,0.04)]"
              />
            </div>
            {overlayOpen && (
              <button
                type="button"
                onClick={onOverlayClose}
                className="shrink-0 px-1 text-sm font-medium text-foreground hover:text-accent"
              >
                Close
              </button>
            )}
          </form>
        </div>
        <SearchOverlay
          open={overlayOpen}
          query={query}
          catalog={catalog}
          vocabulary={vocabulary}
          state={state}
          onSearch={onSearchCommit}
          onClose={onOverlayClose}
        />
      </div>
    </header>
  );
}
