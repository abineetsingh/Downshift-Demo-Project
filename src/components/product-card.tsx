"use client";

import Image from "next/image";
import { useState } from "react";
import type { NormalizedProduct } from "@/lib/types";

function formatPrice(price: number | null) {
  if (price === null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ item }: { item: NormalizedProduct }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          onError={() => setHidden(true)}
        />
        {!item.inStock && (
          <span className="absolute left-3 top-3 rounded-sm bg-surface/95 px-2 py-1 text-xs font-medium text-olive">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="font-serif text-xl leading-tight text-foreground">{item.title}</p>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-secondary">{item.brand}</span>
          {item.price !== null && <span className="font-medium text-foreground">{formatPrice(item.price)}</span>}
        </div>
        {item.rating !== null && (
          <p className="text-xs text-secondary">
            {item.rating.toFixed(1)} stars · {item.reviews.toLocaleString()} reviews
          </p>
        )}
      </div>
    </article>
  );
}
