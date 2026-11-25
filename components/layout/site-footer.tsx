import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Container } from "@/components/ui/container";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
} from "@/components/ui/icons";
import {
  eyebrowClass,
  focusRing,
  iconButtonStyles,
  luxuryTransition,
} from "@/components/ui/design-system";

const jewelleryLinks = [
  { label: "Rings", href: "/products/rings" },
  { label: "Earrings", href: "/products/earrings" },
  { label: "Necklaces", href: "/products/necklaces" },
  { label: "Bracelets", href: "/products/bracelets" },
  { label: "Engagement", href: "/products/engagement-rings" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/#new-arrivals" },
];

const companyLinks = [
  { label: "Our Story", href: "/info/our-story" },
  { label: "Gallery", href: "/gallery" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/info/contact" },
  { label: "My Account", href: "/account" },
];

const supportLinks = [
  { label: "Contact Us", href: "/info/contact" },
  { label: "Shipping Information", href: "/info/shipping" },
  { label: "Returns & Exchange", href: "/info/returns" },
  { label: "Jewellery Care", href: "/info/care" },
  { label: "FAQs", href: "/info/faqs" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/info/privacy" },
  { label: "Terms & Conditions", href: "/info/terms" },
  { label: "Shipping Information", href: "/info/shipping" },
  { label: "Returns Information", href: "/info/returns" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com", icon: FacebookIcon },
  { label: "Pinterest", href: "https://www.pinterest.com", icon: PinterestIcon },
];

const paymentMarks = [
  { label: "Cash on delivery", short: "COD" },
  { label: "Visa", short: "VISA" },
  { label: "Mastercard", short: "MC" },
  { label: "UPI", short: "UPI" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className={eyebrowClass}>{title}</h2>
      <ul className="mt-6 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className={`text-body-sm text-white/65 ${luxuryTransition} hover:text-accent`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-on-dark">
      <Container className="py-section">
        <div className="grid gap-12 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className={`inline-block font-display text-display-sm tracking-display ${focusRing}`}
            >
              Auréa
            </Link>
            <p className="mt-6 max-w-sm text-body-sm leading-7 text-white/70">
              Fine jewellery crafted with intention — quiet silhouettes, considered materials
              and pieces made to live with you for a lifetime.
            </p>
            <div className="mt-8 space-y-2 text-body-sm text-white/70">
              <p>
                <span className="text-white/45">Email</span>{" "}
                <a href="mailto:care@aurea.example" className={`${luxuryTransition} hover:text-accent`}>
                  care@aurea.example
                </a>
              </p>
              <p>
                <span className="text-white/45">Hours</span> Mon–Sat, 10:00–19:00 IST
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className={iconButtonStyles({
                    size: "sm",
                    variant: "ghost",
                    className: "border-white/20 text-white/80 hover:text-accent",
                  })}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Jewellery" links={jewelleryLinks} />
          <FooterColumn title="Our Company" links={companyLinks} />
          <FooterColumn title="Customer Support" links={supportLinks} />

          <div>
            <h2 className={eyebrowClass}>Newsletter</h2>
            <p className="mt-6 text-body-sm leading-7 text-white/70">
              Private previews, new collections and jewellery stories — sent with care.
            </p>
            <NewsletterForm variant="footer" />
            <div className="mt-8">
              <p className="text-caption tracking-label text-white/45 uppercase">Payments</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Payment methods">
                {paymentMarks.map((mark) => (
                  <li
                    key={mark.short}
                    title={mark.label}
                    className="rounded-control border border-white/20 px-2.5 py-1.5 text-caption font-medium tracking-label text-white/70"
                  >
                    {mark.short}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-caption text-white/45">
                Online methods appear when payment provider is enabled.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-8 text-caption text-white/50 lg:flex-row lg:items-center lg:justify-between">
          <p>&copy; {year} Auréa Jewellery. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${luxuryTransition} hover:text-accent`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
