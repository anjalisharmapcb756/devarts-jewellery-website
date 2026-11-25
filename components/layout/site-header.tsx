"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useStore } from "@/components/store/store-provider";
import { Container } from "@/components/ui/container";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import {
  Badge,
  Button,
  ButtonLink,
  IconButton,
  IconButtonLink,
  Modal,
} from "@/components/ui/design-system";
import {
  eyebrowClass,
  focusRing,
  luxuryTransition,
} from "@/components/ui/design-system/styles";
import { mainNavigation, type NavItem } from "@/lib/navigation";

type MenuState = string | null;

function CounterBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function HeaderActionLink({
  href,
  label,
  icon,
  count = 0,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  count?: number;
}) {
  return (
    <IconButtonLink
      href={href}
      label={`${label}, ${count} items`}
      variant="ghost"
      size="sm"
      className="relative"
    >
      {icon}
      <CounterBadge count={count} />
    </IconButtonLink>
  );
}

function MegaMenu({
  item,
  open,
  id,
  labelledBy,
}: {
  item: NavItem;
  open: boolean;
  id: string;
  labelledBy: string;
}) {
  if (!item.columns?.length && !item.featured) return null;

  return (
    <div
      id={id}
      aria-labelledby={labelledBy}
      className={[
        "absolute inset-x-0 top-full z-[var(--z-overlay)] border-b border-border bg-surface shadow-overlay",
        "transition duration-[var(--duration-[var(--duration-base)])] ease-luxury",
        open
          ? "visible translate-y-0 opacity-100 pointer-events-auto"
          : "invisible -translate-y-2 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr_280px]">
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
            {item.columns?.map((column) => (
              <div key={column.title}>
                <p className={eyebrowClass}>{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`block text-body-sm text-muted ${luxuryTransition} hover:text-accent-text`}
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
              <div className="relative aspect-[4/5] overflow-hidden rounded-control border border-border bg-surface-muted">
                <Image
                  src={item.featured.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 280px, 100vw"
                  className="object-cover transition duration-[var(--duration-reveal)] ease-luxury group-hover/feature:scale-[1.03]"
                />
                <Badge variant="dark" className="absolute left-4 top-4">
                  Editor&apos;s pick
                </Badge>
              </div>
              <p className="mt-5 font-display text-card-title tracking-display text-foreground">
                {item.featured.title}
              </p>
              <p className="mt-2 text-body-sm text-muted">{item.featured.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-caption font-medium tracking-label text-accent-text uppercase">
                Discover
                <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search Auréa"
      description="Find the piece that feels like yours."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-border pb-4">
        <SearchIcon className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <input
          id="site-search"
          data-autofocus
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search rings, necklaces, gifts..."
          className="w-full bg-transparent text-body-lg text-foreground outline-none placeholder:text-muted"
        />
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      <div className="mt-8">
        <p className={eyebrowClass}>Popular searches</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Diamond Rings", href: "/products/rings" },
            { label: "Pearl Necklaces", href: "/products/necklaces" },
            { label: "Bridal", href: "/products/wedding-jewellery" },
            { label: "Gifts", href: "/products" },
          ].map((term) => (
            <Link
              key={term.label}
              href={term.href}
              onClick={onClose}
              className={`border border-border px-4 py-2 text-body-sm text-muted ${luxuryTransition} hover:border-accent-strong hover:text-accent-text`}
            >
              {term.label}
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function MobileMenu({
  open,
  activeSection,
  onSectionChange,
  onClose,
}: {
  open: boolean;
  activeSection: MenuState;
  onSectionChange: (section: MenuState) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div id="mobile-menu" className="border-t border-border bg-surface md:hidden">
      <Container className="py-6">
        <nav aria-label="Mobile navigation">
          <ul className="space-y-4">
            {mainNavigation.map((item) => {
              const hasMenu = Boolean(item.columns?.length || item.featured);
              const sectionKey = `mobile-${item.label}`;
              const expanded = activeSection === sectionKey;

              return (
                <li key={item.label} className="border-b border-border/70 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="font-display text-card-title tracking-display text-foreground"
                    >
                      {item.label}
                    </Link>
                    {hasMenu ? (
                      <IconButton
                        label={`${expanded ? "Hide" : "Show"} ${item.label} links`}
                        variant="ghost"
                        size="sm"
                        aria-expanded={expanded}
                        aria-controls={`${sectionKey}-panel`}
                        onClick={() => onSectionChange(expanded ? null : sectionKey)}
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition duration-[var(--duration-base)] ease-luxury ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </IconButton>
                    ) : null}
                  </div>

                  {hasMenu && expanded ? (
                    <div id={`${sectionKey}-panel`} className="mt-4 grid gap-5">
                      {item.columns?.map((column) => (
                        <div key={column.title}>
                          <p className={eyebrowClass}>{column.title}</p>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {column.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  onClick={onClose}
                                  className="text-body-sm text-muted"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {item.featured ? (
                        <Link
                          href={item.featured.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 text-body-sm text-accent-text ${focusRing}`}
                        >
                          <span className="relative h-16 w-14 overflow-hidden rounded-control border border-border bg-surface-muted">
                            <Image
                              src={item.featured.image}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </span>
                          <span>{item.featured.title}</span>
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid gap-3">
            <ButtonLink href="/account" variant="secondary" onClick={onClose}>
              My account
            </ButtonLink>
            <ButtonLink href="/wishlist" variant="ghost" onClick={onClose}>
              Wishlist
            </ButtonLink>
          </div>
        </nav>
      </Container>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { wishlist, cartCount } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuState>(null);
  const [mobileSection, setMobileSection] = useState<MenuState>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;
      const previous = lastScrollY.current;
      setScrolled(current > 12);

      if (searchOpen || mobileOpen || activeMenu) {
        setHeaderHidden(false);
        lastScrollY.current = current;
        return;
      }

      if (current > 160 && current > previous + 4) {
        setHeaderHidden(true);
      } else if (current < previous - 4) {
        setHeaderHidden(false);
      }
      lastScrollY.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchOpen, mobileOpen, activeMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <div className="bg-foreground text-on-dark">
        <Container className="flex h-8 items-center justify-center text-center">
          <p className="text-eyebrow font-medium tracking-label uppercase">
            Complimentary insured shipping &middot; Ethically sourced gems
          </p>
        </Container>
      </div>

      <header
        className={[
          "sticky top-0 z-[var(--z-header)] border-b border-border bg-surface/95 backdrop-blur",
          "transition-[transform,box-shadow] duration-[var(--duration-[var(--duration-base)])] ease-luxury",
          scrolled ? "shadow-card" : "",
          headerHidden ? "-translate-y-full" : "translate-y-0",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Container>
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center gap-1 md:gap-2">
              <IconButton
                label={mobileOpen ? "Close menu" : "Open menu"}
                variant="ghost"
                size="sm"
                className="md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((value) => !value)}
              >
                {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </IconButton>
              <IconButton
                label="Open search"
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="h-5 w-5" />
              </IconButton>
            </div>

            <Link
              href="/"
              className="text-center font-display text-display-sm tracking-display text-foreground"
            >
              Auréa
            </Link>

            <div className="flex items-center justify-end gap-1 md:gap-2">
              <IconButtonLink
                href="/account"
                label="Account"
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <UserIcon className="h-5 w-5" />
              </IconButtonLink>
              <HeaderActionLink
                href="/wishlist"
                label="Wishlist"
                icon={<HeartIcon className="h-5 w-5" />}
                count={wishlist.length}
              />
              <HeaderActionLink
                href="/cart"
                label="Shopping bag"
                icon={<BagIcon className="h-5 w-5" />}
                count={cartCount}
              />
            </div>
          </div>

          <nav
            aria-label="Main navigation"
            className="hidden border-t border-border md:block"
            onKeyDown={(event) => {
              if (event.key === "Escape") setActiveMenu(null);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setActiveMenu(null);
              }
            }}
          >
            <ul className="flex items-center justify-center gap-8 lg:gap-10">
              {mainNavigation.map((item) => {
                const hasMenu = Boolean(item.columns?.length || item.featured);
                const menuId = `mega-${item.label.toLowerCase()}`;
                const triggerId = `nav-${item.label.toLowerCase()}`;
                const open = activeMenu === item.label;

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasMenu && setActiveMenu(item.label)}
                    onMouseLeave={() => hasMenu && setActiveMenu(null)}
                  >
                    <div className="flex items-center">
                      <Link
                        id={triggerId}
                        href={item.href}
                        onFocus={() => hasMenu && setActiveMenu(item.label)}
                        aria-haspopup={hasMenu ? "true" : undefined}
                        aria-expanded={hasMenu ? open : undefined}
                        aria-controls={hasMenu ? menuId : undefined}
                        className={[
                          "text-caption font-medium tracking-label uppercase",
                          luxuryTransition,
                          open ? "text-accent-text" : "text-muted hover:text-accent-text",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                      {hasMenu ? (
                        <button
                          type="button"
                          aria-label={`${open ? "Close" : "Open"} ${item.label} menu`}
                          aria-expanded={open}
                          aria-controls={menuId}
                          onClick={() => setActiveMenu(open ? null : item.label)}
                          className={`ml-1 p-1 text-muted ${luxuryTransition} ${focusRing} hover:text-accent-text`}
                        >
                          <ChevronDownIcon
                            className={`h-3.5 w-3.5 transition duration-[var(--duration-base)] ease-luxury ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasMenu ? (
                      <MegaMenu item={item} open={open} id={menuId} labelledBy={triggerId} />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>

        <MobileMenu
          open={mobileOpen}
          activeSection={mobileSection}
          onSectionChange={setMobileSection}
          onClose={() => setMobileOpen(false)}
        />
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
