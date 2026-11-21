import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const values = [
  {
    title: "Ethically Sourced",
    description:
      "Responsibly selected diamonds and gemstones, chosen with care for people and planet.",
  },
  {
    title: "Master Craftsmanship",
    description:
      "Each piece is shaped by skilled artisans with meticulous attention to every detail.",
  },
  {
    title: "Certified Quality",
    description:
      "Authenticity certificates and transparent quality standards you can trust.",
  },
  {
    title: "Lifetime Care",
    description:
      "Complimentary cleaning, resizing guidance, and dedicated support for years to come.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section id="story" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="The Vara promise"
          description="Luxury is not only how jewellery looks, but how thoughtfully it is made and cared for."
        />
        <div className="mt-14 grid gap-px bg-border/70 sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => (
            <div key={value.title} className="bg-surface px-8 py-10">
              <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">
                0{index + 1}
              </p>
              <h3 className="mt-5 font-display text-2xl tracking-tight text-foreground">
                {value.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
