import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { collections } from "@/lib/data/homepage";

export function FeaturedCollectionsSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Featured Collections"
          title="Curated for every chapter"
          description="Explore editorial collections where artistry, heritage, and contemporary design meet."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.name}
              href={collection.href}
              className={`group relative overflow-hidden ${index === 0 ? "lg:row-span-2" : ""}`}
            >
              <div className={`relative ${index === 0 ? "min-h-[420px] lg:min-h-full" : "aspect-[5/4]"}`}>
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#292521]/60 via-[#292521]/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
                <p className="text-xs tracking-[0.24em] text-[#efe4cf] uppercase">Collection</p>
                <h3 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">{collection.name}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
