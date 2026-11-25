import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { focusRing, luxuryTransition } from "./styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-foreground bg-foreground text-on-dark hover:border-accent-strong hover:bg-accent-strong",
  secondary:
    "border border-border bg-surface text-foreground hover:border-accent-strong hover:text-accent-strong",
  ghost:
    "border border-transparent bg-transparent text-foreground hover:border-border hover:bg-surface-muted",
  link:
    "border border-transparent bg-transparent px-0 text-accent-text underline underline-offset-4 hover:text-foreground",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-[var(--button-height-sm)] px-[var(--button-padding-sm)] text-eyebrow",
  md: "h-[var(--button-height-md)] px-[var(--button-padding-md)] text-caption",
  lg: "h-[var(--button-height-lg)] px-[var(--button-padding-lg)] text-body-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const shape =
    variant === "link"
      ? ""
      : "inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-center font-medium tracking-label uppercase";

  return [shape, variantStyles[variant], sizeStyles[size], luxuryTransition, focusRing, className]
    .filter(Boolean)
    .join(" ");
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
