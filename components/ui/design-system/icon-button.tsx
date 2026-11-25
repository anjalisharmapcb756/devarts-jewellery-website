import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { focusRing, luxuryTransition } from "./styles";

export type IconButtonVariant = "solid" | "outline" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

const variants: Record<IconButtonVariant, string> = {
  solid: "border border-foreground bg-foreground text-on-dark hover:bg-accent-strong",
  outline: "border border-border bg-surface text-foreground hover:border-accent-strong",
  ghost: "border border-transparent bg-transparent text-foreground hover:bg-surface-muted",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

export function iconButtonStyles({
  size = "md",
  variant = "outline",
  className = "",
}: {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  className?: string;
} = {}) {
  return [
    "inline-flex shrink-0 items-center justify-center rounded-control",
    variants[variant],
    sizes[size],
    luxuryTransition,
    focusRing,
    "disabled:cursor-not-allowed disabled:opacity-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  children: ReactNode;
};

export function IconButton({
  label,
  size = "md",
  variant = "outline",
  className = "",
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={iconButtonStyles({ size, variant, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export type IconButtonLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  children: ReactNode;
};

export function IconButtonLink({
  label,
  size = "md",
  variant = "outline",
  className = "",
  children,
  ...props
}: IconButtonLinkProps) {
  return (
    <Link aria-label={label} className={iconButtonStyles({ size, variant, className })} {...props}>
      {children}
    </Link>
  );
}
