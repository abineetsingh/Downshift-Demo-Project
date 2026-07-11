"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NormalizedProduct } from "@/lib/types";
import { ProductCard } from "./product-card";

const BATCH_SIZE = 48;

export function ResultsGrid({ items }: { items: NormalizedProduct[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [items]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + BATCH_SIZE, items.length));
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {visibleItems.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      {visibleCount < items.length && <div ref={sentinelRef} className="h-12" aria-hidden="true" />}
    </>
  );
}
