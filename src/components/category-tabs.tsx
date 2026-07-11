"use client";

import Image from "next/image";

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <nav className="overflow-x-auto border-b border-border" aria-label="Product categories">
      <div className="flex min-w-max items-center gap-7">
        <div className="flex h-full items-center pr-1" aria-hidden="true">
          <Image src="/branding/curio-icon.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        </div>
        {["All", ...categories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              active === category
                ? "border-accent text-foreground"
                : "border-transparent text-secondary hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
