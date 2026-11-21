import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { StarIcon } from "@/components/ui/icons";
import { testimonials } from "@/lib/data/homepage";

export function TestimonialsSection() {
  return (
    <section className="bg-surface-muted/45 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Customer Testimonials"
          title="Cherished by those who wear it"
          description="Stories from clients who found their perfect piece with Vara."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="bg-surface p-8 sm:p-10">
              <div className="flex gap-1 text-accent-strong">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-foreground/90">
                “{testimonial.quote}”
              </p>
              <footer className="mt-8 border-t border-border pt-5">
                <p className="font-display text-xl tracking-tight text-foreground">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-sm text-muted">{testimonial.location}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
