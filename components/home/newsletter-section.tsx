import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Container } from "@/components/ui/container";

export function NewsletterSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="bg-[#292521] px-8 py-14 text-center text-[#F8F5F0] sm:px-12 sm:py-20">
          <p className="text-xs font-medium tracking-[0.32em] text-accent uppercase">
            Newsletter
          </p>
          <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
            Enter the world of Vara
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#D9D2C7]">
            Receive early access to new collections, private offers, and stories
            from our atelier.
          </p>
          <NewsletterForm />
        </div>
      </Container>
    </section>
  );
}
