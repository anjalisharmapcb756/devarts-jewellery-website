import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#efe7da]">
      <div className="absolute inset-0">
        <Image
          src="/images/references/11.jpg"
          alt="Luxury diamond jewellery on silk fabric"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,248,243,0.94)_0%,rgba(251,248,243,0.78)_34%,rgba(251,248,243,0.20)_68%,rgba(251,248,243,0.06)_100%)]" />
      </div>

      <Container className="relative flex min-h-[78vh] items-center py-24 sm:py-28 lg:min-h-[88vh]">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.35em] text-accent-strong uppercase">
            The New Heirloom Collection
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Jewellery that
            <span className="block text-[#7d6742]">lives beyond time.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#5f564c] sm:text-lg">
            Discover handcrafted diamonds and rare gemstones, designed with
            quiet grandeur for the moments you never forget.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-xs font-medium tracking-[0.22em] text-background uppercase transition hover:bg-accent-strong"
            >
              Shop Now
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center border border-foreground/20 px-8 py-4 text-xs font-medium tracking-[0.22em] text-foreground uppercase transition hover:border-accent hover:text-accent-strong"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
