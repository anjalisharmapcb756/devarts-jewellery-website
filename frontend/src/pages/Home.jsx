import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import { useStore } from "../context/StoreContext";
import { CATALOGUE, mergeCatalogue, productFallback } from "../data/catalogue";

const categories = [
  { name: "Rings", href: "/products?category=Rings", image: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?auto=format&fit=crop&w=800&q=80", sub: "Signature solitaires and bands" },
  { name: "Necklaces", href: "/products?category=Necklaces", image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?auto=format&fit=crop&w=800&q=80", sub: "Pendants with quiet brilliance" },
  { name: "Earrings", href: "/products?category=Earrings", image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80", sub: "Elegant drops and studs" },
  { name: "Bracelets", href: "/products?category=Bracelets", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80", sub: "Refined everyday radiance" },
];

const gemstones = [
  { name: "Diamond", image: "https://images.unsplash.com/photo-1602752250015-52934bc45613?auto=format&fit=crop&w=800&q=80" },
  { name: "Emerald", image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=800&q=80" },
  { name: "Ruby", image: "https://images.unsplash.com/photo-1586104237516-5b7075e00d45?auto=format&fit=crop&w=800&q=80" },
  { name: "Sapphire", image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=800&q=80" },
  { name: "Pearl", image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80" },
];

const collections = [
  { title: "The Bridal Edit", text: "Heirloom-worthy pieces for unforgettable beginnings.", image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=800&q=80" },
  { title: "Golden Hour", text: "Warm gold silhouettes crafted for modern elegance.", image: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=800&q=80" },
  { title: "Celestial Gems", text: "Rare gemstones inspired by starlit beauty.", image: "https://images.unsplash.com/photo-1609873814058-a8928924184a?auto=format&fit=crop&w=800&q=80" },
];

const promises = [
  { no: "01", title: "Ethically Sourced", text: "Responsibly selected diamonds and gemstones, chosen with care for people and planet." },
  { no: "02", title: "Master Craftsmanship", text: "Each piece is shaped by skilled artisans with meticulous attention to every detail." },
  { no: "03", title: "Certified Quality", text: "Authenticity certificates and transparent quality standards you can trust." },
  { no: "04", title: "Lifetime Care", text: "Complimentary cleaning, resizing guidance, and dedicated support for years to come." },
];

const testimonials = [
  { quote: "The craftsmanship is exquisite. My ring feels timeless, elegant, and beautifully personal.", name: "Ananya S.", city: "Mumbai" },
  { quote: "From packaging to finish, every detail felt luxurious. The necklace is even more stunning in person.", name: "Meera K.", city: "Bengaluru" },
  { quote: "Vara made gifting effortless. The design is refined and the quality truly stands out.", name: "Riya P.", city: "Delhi" },
];

const GALLERY_IMAGES = [
  "2011-12-10 19.12.05.jpg","2011-12-10 19.13.08.jpg","2011-12-10 19.13.36.jpg","2011-12-10 19.14.16.jpg","5 7.jpg","5 full.jpg","award winning painting.JPG","Daily News 15 Jan 2017 - Copy.jpg","Daily News 15 Jan 2017.jpg","Dev Arts.jpg","IMG_1867.JPG","IMG_1868.JPG","IMG_1869.JPG","IMG_1870.JPG","IMG_20180624_0001.jpg","IMG_20180624_0002.jpg","IMG_20180624_0003.jpg","IMG_20180624_0004.jpg","IMG_20180624_0005.jpg","IMG_20180624_0006.jpg","IMG_20180624_0007.jpg","IMG_20180624_0008.jpg","IMG_20180624_0009.jpg","IMG_20180624_0010.jpg","IMG_20180624_0011.jpg","IMG_20180624_0012.jpg","IMG_20180624_0013.jpg","IMG_20180624_0014.jpg","IMG_20180624_0015.jpg","IMG_20180624_0016.jpg","Lalit kala academy.jpg","Lalit kala.jpg","NA certificate English.jpg","NA certificate Hindi.jpg","National award (2).JPG","National award (3).jpg","National award (4).jpg","National award (5).JPG","National award (6).JPG","National award (7).JPG","National award (8).JPG","National award (9).JPG","National award.JPG","print.jpg","State Award 02-03.jpg","State award 04 (2).jpg","State award 04.jpg","State Award 04-05.jpg","state awrd merit 02.jpg"
].map((name) => ({ name, src: `/images/gallery/${encodeURIComponent(name)}`, alt: name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") }));

const fallbackProducts = CATALOGUE.slice(0, 8).map((p, i) => ({ ...p, badge: ["Bestseller","Loved","New","New","New","New","New","New"][i], discount: i === 0 ? "15% Off" : i === 2 || i === 7 ? "10% Off" : undefined, originalPrice: i === 0 ? 105000 : i === 2 ? 82000 : i === 7 ? 162000 : undefined, outOfStock: i === 7 }));

function SectionHead({ eyebrow, title, text, center }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
      {text && <p className={`mt-4 max-w-2xl text-base leading-7 text-muted ${center ? "mx-auto" : ""}`}>{text}</p>}
    </div>
  );
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="group">
      <Link to={`/products/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-surface-muted">
        <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:opacity-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id); }} />
        <img src={p.hoverImage || p.image} alt={`${p.name} alternate view`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id + "h"); }} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {p.badge && <span className="bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em]">{p.badge}</span>}
          {p.discount && <span className="bg-[#292521] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white">{p.discount}</span>}
          {p.outOfStock && <span className="bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">Out of Stock</span>}
        </div>
        <button
          type="button"
          disabled={p?.is_in_stock === false || p?.outOfStock || Number(p?.stock_quantity) === 0}
          onClick={(e) => { e.preventDefault(); onAdd(p); }}
          className="absolute inset-x-3 bottom-3 bg-white/95 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-foreground opacity-0 transition group-hover:opacity-100 hover:bg-white disabled:cursor-not-allowed disabled:text-muted"
        >
          {p?.is_in_stock === false || p?.outOfStock || Number(p?.stock_quantity) === 0 ? "Out of Stock" : "Add to Bag"}
        </button>
      </Link>
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{p.category}</p>
        <Link to={`/products/${p.slug}`} className="mt-1 block font-display text-2xl leading-tight hover:text-accent">{p.name}</Link>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span>{formatPrice(p.price)}</span>
          {p.originalPrice && <span className="text-muted line-through">{formatPrice(p.originalPrice)}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [galleryActive, setGalleryActive] = useState(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({ loading: false, ok: false, message: "" });
  const { addToCart, products } = useStore();

  const catalog = useMemo(() => mergeCatalogue(products || []), [products]);
  const featured = fallbackProducts.map((fp) => catalog.find((p) => String(p.id || p.slug) === String(fp.id)) || fp);
  const bestSellers = featured.slice(0, 4);
  const newArrivals = catalog.slice(-4).reverse();

  const onAdd = (p) => {
    if (p?.is_in_stock === false || p?.outOfStock || Number(p?.stock_quantity) === 0) return;
    addToCart({ productId: p.id, quantity: 1 });
  };

  async function onSubscribe(e) {
    e.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;

    setSubscribeStatus({ loading: true, ok: false, message: "" });
    try {
      const data = await apiFetch("/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSubscribeStatus({
        loading: false,
        ok: true,
        message: data?.message || "Thank you for subscribing. Welcome to Vara.",
      });
      setSubscribeEmail("");
    } catch (err) {
      setSubscribeStatus({
        loading: false,
        ok: false,
        message: err.message || "Could not subscribe right now. Please try again.",
      });
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-[#f6f3ee]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">The New Heirloom Collection</p>
            <h1 className="mt-4 max-w-xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Jewellery that <br className="hidden sm:block" />lives beyond time.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted">
              Discover handcrafted diamonds and rare gemstones, designed with quiet grandeur for the moments you never forget.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center justify-center border border-border bg-white px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-foreground transition hover:bg-surface-muted">Shop Now</Link>
              <Link to="/collections" className="inline-flex items-center justify-center border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-foreground transition hover:bg-foreground hover:text-white">Explore Collections</Link>
            </div>
          </div>
          <div className="relative overflow-hidden bg-[#efe7da]" style={{ height: "clamp(320px, 46vw, 620px)" }}>
            <img
              src="/images/references/11.jpg"
              alt="Vara luxury jewellery"
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/fallback/1.svg"; }}
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
          {[
            ["/images/banner/National%20award%20(2).png", "Vara national award recognition banner"],
            ["/images/banner/State%20Award%2002-03.jpg", "Vara state award recognition banner"],
            ["/images/banner/state-awards-hd-2026.png", "Vara state awards banner"],
          ].map(([src, alt]) => (
            <div key={src} className="overflow-hidden border border-border bg-surface-muted">
              <img src={src} alt={alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead eyebrow="Shop By Category" title="Find your signature piece" text="From everyday radiance to ceremonial brilliance, explore jewellery crafted for every expression." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.name} to={c.href} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-surface-muted">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <p className="mt-4 text-sm text-muted">{c.sub}</p>
              <h3 className="mt-1 font-display text-3xl">{c.name}</h3>
              <span className="mt-2 inline-block text-[11px] uppercase tracking-[0.16em] text-accent">Shop Now</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Best Sellers" title="Most loved by our clientele" text="Timeless designs chosen for their brilliance, craftsmanship, and effortless elegance." />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead eyebrow="Shop By Gemstone" title="A spectrum of rare beauty" text="Choose a gemstone that speaks to your story, from classic diamonds to vivid coloured treasures." />
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {gemstones.map((g) => (
            <Link key={g.name} to={`/products?gemstone=${encodeURIComponent(g.name.toLowerCase())}`} className="group relative block overflow-hidden bg-surface-muted aspect-[3/4]">
              <img src={g.image} alt={g.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#292521]/55 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white font-display text-2xl">{g.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="New Arrivals" title="Fresh expressions of luxury" text="Newly unveiled designs, created to bring a modern glow to your jewellery collection." />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => <ProductCard key={`new-${p.id}`} p={{ ...p, badge: p.badge || "New" }} onAdd={onAdd} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead eyebrow="Featured Collections" title="Curated for every chapter" text="Explore editorial collections where artistry, heritage, and contemporary design meet." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.title} to="/collections" className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-surface-muted">
                <img src={c.image} alt={c.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">Collection</p>
              <h3 className="mt-1 font-display text-3xl">{c.title}</h3>
              <p className="mt-2 text-sm text-muted">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/references/6.jpg"
            alt="Exclusive gold jewellery"
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/fallback/2.svg"; }}
          />
          <div className="absolute inset-0 bg-[#292521]/45" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 text-white">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#efe4cf]">Exclusive Jewellery</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Bespoke brilliance, reserved for the extraordinary.</h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/85">Our exclusive atelier pieces are crafted in limited numbers, pairing exceptional gemstones with meticulous hand-finishing. For those who seek jewellery as individual as their story.</p>
          <Link to="/collections" className="mt-8 inline-flex border border-white bg-white px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-foreground hover:bg-transparent hover:text-white transition">Discover Exclusives</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead eyebrow="Why Choose Us" title="The Vara promise" text="Luxury is not only how jewellery looks, but how thoughtfully it is made and cared for." center />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p) => (
            <div key={p.no} className="border border-border p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-accent">{p.no}</div>
              <h3 className="mt-3 font-display text-2xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Customer Testimonials" title="Cherished by those who wear it" text="Stories from clients who found their perfect piece with Vara." center />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="border border-border bg-white p-6">
                <p className="text-sm leading-7 text-foreground">“{t.quote}”</p>
                <footer className="mt-5 text-sm"><div className="font-medium">{t.name}</div><div className="text-muted">{t.city}</div></footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Our Legacy</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Gallery & Recognition</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">A glimpse into our craftsmanship, awards, and milestones that define the Vara journey.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {GALLERY_IMAGES.map((img, i) => (
              <button key={img.src} type="button" onClick={() => setGalleryActive(i)} className="group relative aspect-[4/5] overflow-hidden border border-border bg-[#efe7da]" aria-label={`Open gallery image ${i + 1}`}>
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-[#292521]/0 transition group-hover:bg-[#292521]/10" />
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/gallery" className="inline-flex border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-foreground transition hover:bg-foreground hover:text-white">View Full Gallery</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Newsletter</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">Enter the world of Vara</h2>
        <p className="mt-4 text-muted">Receive early access to new collections, private offers, and stories from our atelier.</p>
        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={onSubscribe}>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={subscribeEmail}
            onChange={(e) => setSubscribeEmail(e.target.value)}
            placeholder="Email address"
            disabled={subscribeStatus.loading}
            className="w-full border border-border px-4 py-3 outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={subscribeStatus.loading}
            className="bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {subscribeStatus.loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {subscribeStatus.message && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-4 text-sm ${subscribeStatus.ok ? "text-accent" : "text-[#8a4b4b]"}`}
          >
            {subscribeStatus.message}
          </p>
        )}
      </section>

      {galleryActive !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#292521]/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={() => setGalleryActive(null)}>
          <button type="button" className="absolute right-4 top-4 border border-white/30 px-3 py-2 text-xs tracking-[0.16em] text-white uppercase hover:bg-white/10" onClick={() => setGalleryActive(null)}>Close</button>
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:left-6" onClick={(e) => { e.stopPropagation(); setGalleryActive((galleryActive - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length); }} aria-label="Previous image">&#8592;</button>
          <div className="relative max-h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={GALLERY_IMAGES[galleryActive].src} alt={GALLERY_IMAGES[galleryActive].alt} className="max-h-[80vh] w-full object-contain" />
          </div>
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/30 px-3 py-2 text-white hover:bg-white/10 sm:right-6" onClick={(e) => { e.stopPropagation(); setGalleryActive((galleryActive + 1) % GALLERY_IMAGES.length); }} aria-label="Next image">&#8594;</button>
        </div>
      )}
    </div>
  );
}
