import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function ExclusiveSection() {
  return (
    <section className="bg-[#292521] py-20 text-[#F8F5F0] sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#332e29]">
          <Image
            src="/images/references/5.jpg"
            alt="Exclusive gold jewellery"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="max-w-xl lg:pl-8">
          <p className="text-xs font-medium tracking-[0.32em] text-accent uppercase">
            Exclusive Jewellery
          </p>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Bespoke brilliance, reserved for the extraordinary.
          </h2>
          <p className="mt-6 text-base leading-8 text-[#D9D2C7]">
            Our exclusive atelier pieces are crafted in limited numbers, pairing
            exceptional gemstones with meticulous hand-finishing. For those who
            seek jewellery as individual as their story.
          </p>
          <Link
            href="/collections"
            className="mt-10 inline-flex items-center justify-center border border-accent/60 px-8 py-4 text-xs font-medium tracking-[0.22em] text-[#F8F5F0] uppercase transition duration-300 hover:bg-accent hover:text-white"
          >
            Discover Exclusives
          </Link>
        </div>
      </Container>
    </section>
  );
}
