import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@/lib/data/homepage";

export function CategorySection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Shop By Category"
          title="Find your signature piece"
          description="From everyday radiance to ceremonial brilliance, explore jewellery crafted for every expression."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden bg-surface-muted"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#292521]/55 via-[#292521]/5 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs tracking-[0.24em] text-[#efe4cf] uppercase">{category.description}</p>
                <h3 className="mt-2 font-display text-3xl tracking-tight">{category.name}</h3>
                <span className="mt-4 inline-block text-xs tracking-[0.2em] uppercase underline decoration-accent/70 underline-offset-8">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
