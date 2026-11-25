"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const IMAGES = [
  "2011-12-10 19.12.05.jpg","2011-12-10 19.13.08.jpg","2011-12-10 19.13.36.jpg","2011-12-10 19.14.16.jpg","5 7.jpg","5 full.jpg","award winning painting.JPG","Daily News 15 Jan 2017 - Copy.jpg","Daily News 15 Jan 2017.jpg","Dev Arts.jpg","IMG_1867.JPG","IMG_1868.JPG","IMG_1869.JPG","IMG_1870.JPG","IMG_20180624_0001.jpg","IMG_20180624_0002.jpg","IMG_20180624_0003.jpg","IMG_20180624_0004.jpg","IMG_20180624_0005.jpg","IMG_20180624_0006.jpg","IMG_20180624_0007.jpg","IMG_20180624_0008.jpg","IMG_20180624_0009.jpg","IMG_20180624_0010.jpg","IMG_20180624_0011.jpg","IMG_20180624_0012.jpg","IMG_20180624_0013.jpg","IMG_20180624_0014.jpg","IMG_20180624_0015.jpg","IMG_20180624_0016.jpg","Lalit kala academy.jpg","Lalit kala.jpg","NA certificate English.jpg","NA certificate Hindi.jpg","National award (2).JPG","National award (3).jpg","National award (4).jpg","National award (5).JPG","National award (6).JPG","National award (7).JPG","National award (8).JPG","National award (9).JPG","National award.JPG","print.jpg","State Award 02-03.jpg","State award 04 (2).jpg","State Award 04-05.jpg","State award 04.jpg","state awrd merit 02.jpg"
].map((name) => ({ name, src: `/images/gallery/${encodeURIComponent(name)}` }));

const GalleryLightbox = dynamic(
  () => import("@/components/home/gallery-lightbox").then((module) => module.GalleryLightbox),
  { ssr: false },
);

export function GallerySection() {
  const [active, setActive] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <section className="border-y border-border bg-surface-muted/30 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Our Legacy"
          title="Gallery & Recognition"
          description="A glimpse into our craftsmanship, awards, and milestones that define the Vara journey."
          align="center"
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActive(i);
              }}
              className="group relative aspect-[4/5] overflow-hidden border border-border bg-[#efe7da]"
              aria-label={`Open gallery image ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[#292521]/0 transition group-hover:bg-[#292521]/10" />
            </button>
          ))}
        </div>
      </Container>

      {active !== null ? (
        <GalleryLightbox
          images={IMAGES}
          active={active}
          onClose={() => {
            setActive(null);
            triggerRef.current?.focus();
          }}
          onNavigate={setActive}
        />
      ) : null}
    </section>
  );
}
