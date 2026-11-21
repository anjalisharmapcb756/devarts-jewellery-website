"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
  badge?: string;
  discount?: number;
};

export function ProductGallery({ images, name, badge, discount }: ProductGalleryProps) {
  const gallery = useMemo(
    () => [...new Set(images.filter(Boolean))].slice(0, 5),
    [images],
  );
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const activeImage = gallery[active] ?? gallery[0];

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden bg-surface-muted"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setPos({ x, y });
        }}
      >
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-300"
          style={{
            transformOrigin: `${pos.x}% ${pos.y}%`,
            transform: zoom ? "scale(1.6)" : "scale(1)",
          }}
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {badge ? (
            <span className="bg-surface/92 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-foreground uppercase backdrop-blur">
              {badge}
            </span>
          ) : null}
          {discount ? (
            <span className="bg-[#292521]/90 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-white uppercase">
              {discount}% Off
            </span>
          ) : null}
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 bg-surface/90 px-3 py-2 text-[10px] font-medium tracking-[0.16em] text-foreground uppercase backdrop-blur">
          Hover to zoom
        </div>
      </div>

      {gallery.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gallery.map((img, index) => (
            <button
              key={img + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden bg-surface-muted ring-1 transition ${
                active === index ? "ring-accent" : "ring-transparent hover:ring-border"
              }`}
              aria-label={`View ${name} image ${index + 1}`}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}