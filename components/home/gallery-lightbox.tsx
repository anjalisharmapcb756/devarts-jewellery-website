"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type GalleryImage = { name: string; src: string };

type GalleryLightboxProps = {
  images: GalleryImage[];
  active: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function GalleryLightbox({ images, active, onClose, onNavigate }: GalleryLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((active - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onNavigate((active + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, images.length, onClose, onNavigate]);

  const image = images[active];
  if (!image) return null;
  const alt = image.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#292521]/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        className="absolute right-4 top-4 border border-white/30 px-3 py-2 text-xs tracking-[0.16em] text-white uppercase hover:bg-white/10"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:left-6"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((active - 1 + images.length) % images.length);
        }}
        aria-label="Previous image"
      >
        &#8592;
      </button>
      <div className="relative h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <Image
          src={image.src}
          alt={alt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-contain"
        />
      </div>
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:right-6"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((active + 1) % images.length);
        }}
        aria-label="Next image"
      >
        &#8594;
      </button>
    </div>
  );
}
