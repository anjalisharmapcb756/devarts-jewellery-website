import Link from "next/link";
import { Container } from "@/components/ui/container";
import { FacebookIcon, InstagramIcon, PinterestIcon } from "@/components/ui/icons";

const footerColumns = [
  {
    title: "Jewellery",
    links: [
      { label: "Rings", href: "/products/rings" },
      { label: "Necklaces", href: "/products/necklaces" },
      { label: "Earrings", href: "/products/earrings" },
      { label: "Bracelets", href: "/products/bracelets" },
      { label: "New Arrivals", href: "/#new-arrivals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Collections", href: "/collections" },
      { label: "Our Story", href: "/#story" },
      { label: "Account", href: "/account" },
      { label: "Admin", href: "/admin" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", href: "/account" },
      { label: "Shipping & Returns", href: "/account" },
      { label: "Jewellery Care", href: "/account" },
      { label: "FAQs", href: "/account" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com", icon: FacebookIcon },
  { label: "Pinterest", href: "https://www.pinterest.com", icon: PinterestIcon },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#292521] text-white">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.15fr_2fr_1.1fr]">
          <div className="max-w-sm">
            <Link href="/" className="font-display text-4xl tracking-[0.04em] text-white">
              Vara
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/70">
              Fine jewellery crafted with intention, designed to celebrate life&apos;s most
              luminous moments.
            </p>
            <div className="mt-7 flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-white/80 transition duration-200 hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-medium tracking-[0.24em] text-white/90 uppercase">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/65 transition duration-200 hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-sm lg:justify-self-end">
            <h3 className="text-xs font-medium tracking-[0.24em] text-white/90 uppercase">
              Newsletter
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/65">
              Receive updates on new collections, private previews, and timeless jewellery stories.
            </p>
            <form className="mt-6 space-y-3" action="#" method="post">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-accent"
              />
              <button
                type="button"
                className="w-full border border-accent bg-accent px-4 py-3 text-xs font-medium tracking-[0.2em] text-white uppercase transition duration-200 hover:bg-transparent hover:text-accent"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-xs tracking-[0.08em] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Vara Jewellery. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/account" className="transition duration-200 hover:text-accent">Privacy Policy</Link>
            <Link href="/account" className="transition duration-200 hover:text-accent">Terms</Link>
            <Link href="/account" className="transition duration-200 hover:text-accent">Shipping</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
