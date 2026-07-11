"use client";

export function FavoriteButton({
  active,
  label,
  onClick,
  className = "",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={`flex items-center justify-center bg-transparent drop-shadow transition hover:scale-105 ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? "drop-shadow-sm" : "opacity-90"}
      >
        <path d="M20.8 4.6c-2-1.8-5.1-1.5-6.8.6L12 7.5l-2-2.3C8.3 3.1 5.2 2.8 3.2 4.6.9 6.7.8 10.3 3 12.6l9 8.8 9-8.8c2.2-2.3 2.1-5.9-.2-8Z" />
      </svg>
    </button>
  );
}
