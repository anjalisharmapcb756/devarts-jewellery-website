import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { focusRing, luxuryTransition } from "./styles";

export type NavLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  active?: boolean;
  children: ReactNode;
};

export function NavLink({
  active = false,
  className = "",
  children,
  ...props
}: NavLinkProps) {
  return (
    <Link
      {...props}
      aria-current={active ? "page" : undefined}
      className={[
        "inline-flex items-center gap-2 text-caption font-medium tracking-label uppercase",
        luxuryTransition,
        focusRing,
        active ? "text-accent-text" : "text-muted hover:text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}

export function NavList({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap items-center gap-6">{children}</ul>
    </nav>
  );
}

export function NavListItem({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <li className={className}>{children}</li>;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-caption text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className={`${focusRing} hover:text-foreground`}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
              {!isLast ? (
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
