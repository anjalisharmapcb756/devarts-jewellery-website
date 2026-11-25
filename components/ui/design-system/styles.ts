export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export const luxuryTransition =
  "transition-colors duration-[var(--duration-base)] ease-luxury disabled:transition-none";

export const eyebrowClass =
  "text-eyebrow font-medium tracking-eyebrow text-accent-text uppercase";

export const surfaceClass =
  "border border-border bg-surface shadow-card";

export const inputClass = [
  "w-full rounded-control border border-border bg-surface px-4 py-3",
  "text-body-sm text-foreground placeholder:text-muted",
  luxuryTransition,
  focusRing,
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-danger",
].join(" ");
