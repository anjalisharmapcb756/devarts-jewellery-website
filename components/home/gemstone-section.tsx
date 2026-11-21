import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { gemstones } from "@/lib/data/homepage";

export function GemstoneSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Shop By Gemstone"
          title="A spectrum of rare beauty"
          description="Choose a gemstone that speaks to your story, from classic diamonds to vivid coloured treasures."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {gemstones.map((gem) => (
            <Link
              key={gem.name}
              href={gem.href}
              className={`group rounded-[2rem] bg-gradient-to-b ${gem.tone} p-5 transition duration-300 hover:-translate-y-1`}
            >
              <div className="relative mx-auto aspect-square overflow-hidden rounded-full">
                <Image
                  src={gem.image}
                  alt={gem.name}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 80vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <p className="mt-5 text-center font-display text-2xl tracking-tight text-foreground">
                {gem.name}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
