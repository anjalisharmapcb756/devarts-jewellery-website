import { useState } from "react";

const IMAGES = [
  "2011-12-10 19.12.05.jpg","2011-12-10 19.13.08.jpg","2011-12-10 19.13.36.jpg","2011-12-10 19.14.16.jpg","5 7.jpg","5 full.jpg","award winning painting.JPG","Daily News 15 Jan 2017 - Copy.jpg","Daily News 15 Jan 2017.jpg","Dev Arts.jpg","IMG_1867.JPG","IMG_1868.JPG","IMG_1869.JPG","IMG_1870.JPG","IMG_20180624_0001.jpg","IMG_20180624_0002.jpg","IMG_20180624_0003.jpg","IMG_20180624_0004.jpg","IMG_20180624_0005.jpg","IMG_20180624_0006.jpg","IMG_20180624_0007.jpg","IMG_20180624_0008.jpg","IMG_20180624_0009.jpg","IMG_20180624_0010.jpg","IMG_20180624_0011.jpg","IMG_20180624_0012.jpg","IMG_20180624_0013.jpg","IMG_20180624_0014.jpg","IMG_20180624_0015.jpg","IMG_20180624_0016.jpg","Lalit kala academy.jpg","Lalit kala.jpg","NA certificate English.jpg","NA certificate Hindi.jpg","National award (2).JPG","National award (3).jpg","National award (4).jpg","National award (5).JPG","National award (6).JPG","National award (7).JPG","National award (8).JPG","National award (9).JPG","National award.JPG","print.jpg","State Award 02-03.jpg","State award 04 (2).jpg","State award 04.jpg","State Award 04-05.jpg","state awrd merit 02.jpg"
].map((name) => ({ name, src: `/images/gallery/${encodeURIComponent(name)}`, alt: name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") }));

export default function Gallery() {
  const [active, setActive] = useState(null);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-accent">Our Legacy</p>
      <h1 className="mt-3 font-display text-5xl">Gallery &amp; Recognition</h1>
      <p className="mt-4 max-w-2xl text-muted">A glimpse into our craftsmanship, awards, and milestones that define the Vara journey.</p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {IMAGES.map((img, i) => (
          <button key={img.src} type="button" onClick={() => setActive(i)} className="group relative aspect-[4/5] overflow-hidden border border-border bg-[#efe7da]" aria-label={`Open gallery image ${i + 1}`}>
            <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
            <div className="absolute inset-0 bg-[#292521]/0 transition group-hover:bg-[#292521]/10" />
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#292521]/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={() => setActive(null)}>
          <button type="button" className="absolute right-4 top-4 border border-white/30 px-3 py-2 text-xs tracking-[0.16em] text-white uppercase hover:bg-white/10" onClick={() => setActive(null)}>Close</button>
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:left-6" onClick={(e) => { e.stopPropagation(); setActive((active - 1 + IMAGES.length) % IMAGES.length); }} aria-label="Previous image">&#8592;</button>
          <div className="relative max-h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}><img src={IMAGES[active].src} alt={IMAGES[active].alt} className="max-h-[80vh] w-full object-contain" /></div>
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:right-6" onClick={(e) => { e.stopPropagation(); setActive((active + 1) % IMAGES.length); }} aria-label="Next image">&#8594;</button>
        </div>
      )}
    </div>
  );
}
