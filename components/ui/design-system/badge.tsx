import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "dark"
  | "outline"
  | "success"
  | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral: "border-border bg-surface-muted text-foreground",
  accent: "border-accent/30 bg-accent/10 text-accent-text",
  dark: "border-foreground bg-foreground text-on-dark",
  outline: "border-border bg-transparent text-muted",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-control border px-3 py-1",
        "text-caption font-medium tracking-label uppercase",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
