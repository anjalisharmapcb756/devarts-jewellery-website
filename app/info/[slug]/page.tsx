import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, ButtonLink } from "@/components/ui/design-system";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

type InfoContent = {
  title: string;
  eyebrow: string;
  description: string;
  sections: Array<{ heading: string; body: string }>;
};

const infoPages: Record<string, InfoContent> = {
  "our-story": {
    title: "Our Story",
    eyebrow: "The House of Auréa",
    description:
      "Auréa is a quiet-luxury jewellery house devoted to pieces that feel personal, considered and enduring.",
    sections: [
      {
        heading: "Our point of view",
        body: "We believe fine jewellery should be lived in, not reserved. Every silhouette is drawn with restraint, balanced for everyday elegance and finished by hand to feel as considered as it looks.",
      },
      {
        heading: "Materials & craft",
        body: "Our pieces are made with responsibly sourced gemstones and hallmarked precious metals. We work in small batches so that proportions, settings and finishes receive the attention they deserve.",
      },
      {
        heading: "A promise of care",
        body: "From complimentary insured shipping to lifetime exchange assurance, we aim to make ownership as effortless as the jewellery itself.",
      },
    ],
  },
  contact: {
    title: "Contact Us",
    eyebrow: "Client Care",
    description:
      "Our client care team is here to help with sizing, orders, styling advice and aftercare.",
    sections: [
      {
        heading: "Email",
        body: "Write to care@aurea.example and we will respond within one business day. For order-related queries, please include your order number.",
      },
      {
        heading: "Studio hours",
        body: "Monday to Saturday, 10:00–19:00 IST. We are closed on public holidays.",
      },
      {
        heading: "Appointments",
        body: "Private viewings can be arranged by email. Share the pieces you would like to see and your preferred city.",
      },
    ],
  },
  shipping: {
    title: "Shipping Information",
    eyebrow: "Delivery",
    description:
      "Complimentary insured shipping is available on qualifying orders across India.",
    sections: [
      {
        heading: "Dispatch",
        body: "In-stock pieces are typically dispatched within two business days. Made-to-order pieces are crafted specially for you and may take longer; the estimated timeline appears on the product page.",
      },
      {
        heading: "Delivery",
        body: "Every order is packed in discreet, protective packaging and sent with tracked, insured delivery. A tracking link is shared as soon as the parcel is handed to our courier partner.",
      },
      {
        heading: "Charges",
        body: "Shipping is complimentary once the order value meets the threshold shown at checkout. Below that amount, the shipping fee is displayed before payment.",
      },
    ],
  },
  returns: {
    title: "Returns & Exchange",
    eyebrow: "Client Care",
    description:
      "We want every Auréa piece to feel right. If it does not, our team will help you find the right outcome.",
    sections: [
      {
        heading: "Return window",
        body: "Unworn, unused pieces in original packaging may be returned within seven days of delivery, subject to verification.",
      },
      {
        heading: "Lifetime exchange",
        body: "Eligible pieces may be exchanged against the purchase value at any time. Gemstone, metal and market-price changes may affect equivalent designs.",
      },
      {
        heading: "How to begin",
        body: "Email care@aurea.example with your order number and the reason for return. We will share the next steps and arrange reverse pickup where available.",
      },
    ],
  },
  care: {
    title: "Jewellery Care",
    eyebrow: "The Auréa Guide",
    description:
      "A few simple habits will keep your fine jewellery beautiful for generations.",
    sections: [
      {
        heading: "Storage",
        body: "Store each piece separately in a soft-lined box or pouch to prevent scratches. Keep jewellery away from moisture, perfume and household chemicals.",
      },
      {
        heading: "Cleaning",
        body: "Wipe gently with a soft, dry cloth after wear. For a deeper clean, use lukewarm water with a mild soap and a soft brush, then dry thoroughly.",
      },
      {
        heading: "Servicing",
        body: "We recommend a professional check every twelve months, especially for pieces with intricate settings or gemstone details.",
      },
    ],
  },
  faqs: {
    title: "Frequently Asked Questions",
    eyebrow: "Help Centre",
    description: "Quick answers to the questions we hear most often.",
    sections: [
      {
        heading: "Are the gemstones certified?",
        body: "Gemstone and metal details are listed on each product page. Certification information is included with eligible pieces at delivery.",
      },
      {
        heading: "Can I resize a ring?",
        body: "Many ring designs can be resized. Contact our client care team with the product name and your current size before ordering.",
      },
      {
        heading: "Which payment methods are available?",
        body: "Cash on delivery is available. Card and UPI payments activate when the online payment provider is configured for the store.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Legal",
    description:
      "This policy explains what information Auréa collects and how we use it.",
    sections: [
      {
        heading: "Information we collect",
        body: "We collect details you provide when you create an account, place an order, save a wishlist item or subscribe to the newsletter. We also use essential cookies to keep your session active.",
      },
      {
        heading: "How we use it",
        body: "Your information is used to fulfil orders, provide client care, improve the storefront and send updates only when you have opted in.",
      },
      {
        heading: "Your choices",
        body: "You may request access, correction or deletion of your personal information by emailing care@aurea.example. Newsletter subscribers can unsubscribe using the link in any email.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Legal",
    description: "The terms that apply to purchases made through the Auréa storefront.",
    sections: [
      {
        heading: "Pricing",
        body: "All prices are shown in Indian Rupees and include applicable taxes unless stated otherwise. Product details and availability may change without notice.",
      },
      {
        heading: "Orders",
        body: "An order is confirmed only after payment or cash-on-delivery acceptance is verified. We reserve the right to cancel orders affected by pricing errors or stock limitations.",
      },
      {
        heading: "Ownership",
        body: "Product imagery, copy and designs on this site belong to Auréa or its licensors and may not be reproduced without written permission.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(infoPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = infoPages[slug];
  if (!page) return { title: "Information" };
  return { title: page.title, description: page.description };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = infoPages[slug];
  if (!page) notFound();

  return (
    <section className="py-section">
      <Container>
        <Breadcrumbs
          className="mb-8"
          items={[{ label: "Home", href: "/" }, { label: page.title }]}
        />
        <SectionHeading
          align="left"
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
        />
        <div className="mt-12 max-w-copy space-y-8">
          {page.sections.map((section) => (
            <div key={section.heading} className="border-t border-border pt-6">
              <h2 className="font-display text-card-title text-foreground">
                {section.heading}
              </h2>
              <p className="mt-3 text-body text-muted">{section.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <ButtonLink href="/products" variant="primary">
            Explore jewellery
          </ButtonLink>
          <ButtonLink href="/info/contact" variant="secondary">
            Contact client care
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
