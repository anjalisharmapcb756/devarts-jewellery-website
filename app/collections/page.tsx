import { Container } from "@/components/ui/container";
import { publicMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = publicMetadata({
  title: "Collections",
  description: "Discover curated jewellery collections.",
  path: "/collections",
});

export default function CollectionsPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
          Curated
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Collections
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          This route is ready for signature collections and editorial
          storytelling.
        </p>
      </Container>
    </section>
  );
}
