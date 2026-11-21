"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/store/store-provider";
import { mainNavigation, type NavItem } from "@/lib/navigation";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { Container } from "@/components/ui/container";

function MegaMenu({ item }: { item: NavItem }) {
  if (!item.columns?.length && !item.featured) return null;

  return (
    <div className="invisible absolute inset-x-0 top-full z-40 border-b border-border/70 bg-surface/98 opacity-0 shadow-[0_20px_60px_rgba(43,38,32,0.06)] transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_1fr_320px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
          {item.columns?.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.featured ? (
          <Link href={item.featured.href} className="group/feature block">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
              <Image
                src={item.featured.image}
                alt={item.featured.title}
                fill
                sizes="320px"
                className="object-cover transition duration-700 group-hover/feature:scale-[1.03]"
              />
            </div>
            <p className="mt-4 font-display text-2xl tracking-tight text-foreground">
              {item.featured.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {item.featured.description}
            </p>
          </Link>
        ) : null}
      </Container>
    </div>
  );
}

function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#292521]/35 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search">
      <div className="border-b border-border bg-surface">
        <Container className="py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium tracking-[0.28em] text-accent-strong uppercase">
              Search Vara
            </p>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted transition hover:text-foreground"
              aria-label="Close search"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <form action="/products" className="mt-6 flex items-center gap-4 border-b border-border pb-4">
            <SearchIcon className="h-5 w-5 text-muted" />
            <input
              autoFocus
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for rings, diamonds, gifts..."
              className="w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted/70"
            />
          </form>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
            {["Diamond Rings", "Pearl Necklace", "Bridal", "Gifts Under ₹75,000"].map((term) => (
              <Link
                key={term}
                href={`/products?q=${encodeURIComponent(term)}`}
                onClick={onClose}
                className="border border-border px-4 py-2 transition hover:border-accent hover:text-foreground"
              >
                {term}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { wishlist, cartCount } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="bg-[#292521] px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.22em] text-white uppercase">
        Complimentary insured shipping &middot; Crafted with ethically sourced gems
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <Container>
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 -ml-2 text-foreground"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-foreground"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden md:flex md:w-40">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5" />
                <span className="hidden lg:inline tracking-wide">Search</span>
              </button>
            </div>

            <Link href="/" className="font-display text-3xl tracking-[0.04em] text-foreground sm:text-4xl">
              Vara
            </Link>

            <div className="flex w-auto items-center justify-end gap-2 sm:gap-4 md:w-40">
              <Link href="/account" className="p-2 text-muted transition hover:text-foreground" aria-label="Account">
                <UserIcon className="h-5 w-5" />
              </Link>
              <Link href="/wishlist" className="relative p-2 text-muted transition hover:text-foreground" aria-label="Wishlist">
                <HeartIcon className="h-5 w-5" />
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-[#2b2620]">
                  {wishlist.length}
                </span>
              </Link>
              <Link href="/cart" className="relative p-2 text-muted transition hover:text-foreground" aria-label="Shopping bag">
                <BagIcon className="h-5 w-5" />
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-[#2b2620]">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>

          <nav aria-label="Main navigation" className="hidden border-t border-border/60 md:block">
            <ul className="flex items-center justify-center gap-10">
              {mainNavigation.map((item) => (
                <li key={item.label} className="group py-4">
                  <Link
                    href={item.href}
                    className="text-[13px] font-medium tracking-[0.16em] text-muted uppercase transition-colors duration-200 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                  <MegaMenu item={item} />
                </li>
              ))}
            </ul>
          </nav>
        </Container>

        {mobileOpen ? (
          <div className="border-t border-border bg-surface md:hidden">
            <Container className="py-6">
              <nav aria-label="Mobile navigation" className="space-y-5">
                {mainNavigation.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium tracking-[0.14em] text-foreground uppercase"
                    >
                      {item.label}
                    </Link>
                    {item.columns?.[0] ? (
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                        {item.columns[0].links.slice(0, 4).map((link) => (
                          <Link key={link.label} href={link.href} className="text-sm text-muted">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
            </Container>
          </div>
        ) : null}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
