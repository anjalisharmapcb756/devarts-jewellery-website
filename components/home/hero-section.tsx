"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";

const BANNER_IMAGES = [
  { src: "/images/banner/National%20award%20(2).png", alt: "Vara national award recognition banner" },
  { src: "/images/banner/State%20Award%2002-03.jpg", alt: "Vara state award recognition banner" },
  { src: "/images/banner/state-awards-hd-2026.png", alt: "Vara state awards banner" },
];

export function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (BANNER_IMAGES.length <= 1) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % BANNER_IMAGES.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="overflow-hidden bg-[#f8f5f0]">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.35em] text-[#7d6742] uppercase">
              The New Heirloom Collection
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-[#292521] sm:text-6xl lg:text-7xl">
              Jewellery that
              <span className="block text-[#7d6742]">lives beyond time.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#5f564c] sm:text-lg">
              Discover handcrafted diamonds and rare gemstones, designed with
              quiet grandeur for the moments you never forget.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/products" className="inline-flex items-center justify-center border border-[#292521] bg-white px-8 py-4 text-xs font-medium tracking-[0.22em] text-[#292521] uppercase transition hover:bg-[#292521] hover:text-[#fbf8f3]">
                Shop Now
              </Link>
              <Link href="/collections" className="inline-flex items-center justify-center border border-[#292521] bg-transparent px-8 py-4 text-xs font-medium tracking-[0.22em] text-[#292521] uppercase transition hover:bg-[#292521] hover:text-[#fbf8f3]">
                Explore Collections
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto w-full max-w-[680px] overflow-hidden border border-[#e9e3da] bg-[#efe7da] lg:mx-0 lg:max-w-none" style={{ height: "clamp(320px, 46vw, 620px)" }}>
              {BANNER_IMAGES.map((img, i) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 52vw"
                  className={`object-contain object-center p-3 transition-opacity duration-700 sm:p-4 md:p-5 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2" aria-label="Banner slides">
              {BANNER_IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 w-8 transition ${i === active ? "bg-[#7d6742]" : "bg-[#292521]/25 hover:bg-[#292521]/45"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

