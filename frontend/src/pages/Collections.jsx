import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/pricing";
import { CATALOGUE, mergeCatalogue, productFallback } from "../data/catalogue";

const categoryDefs = [
  { name: "Rings", image: CATALOGUE[0].image, href: "/products?category=Rings", desc: "Solitaire, engagement, and everyday rings", match: (p) => p.category === "Rings" },
  { name: "Necklaces", image: CATALOGUE[20].image, href: "/products?category=Necklaces", desc: "Pendants, chains, and statement necklaces", match: (p) => p.category === "Necklaces" },
  { name: "Earrings", image: CATALOGUE[40].image, href: "/products?category=Earrings", desc: "Studs, drops, hoops, and danglers", match: (p) => p.category === "Earrings" },
  { name: "Bracelets", image: CATALOGUE[60].image, href: "/products?category=Bracelets", desc: "Tennis, chain, and cuff bracelets", match: (p) => p.category === "Bracelets" },
];
const gemstoneDefs = ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl", "Amethyst", "Topaz", "Garnet", "Opal", "Aquamarine"];
const occasionDefs = [
  { name: "Engagement", href: "/products?category=Engagement+Rings", image: CATALOGUE[80].image, match: (p) => /engagement/i.test(`${p.name} ${p.category}`) },
  { name: "Wedding", href: "/products", image: CATALOGUE[14].image, match: (p) => /diamond|emerald|platinum|halo|pave/i.test(`${p.name} ${p.category}`) },
  { name: "Anniversary", href: "/products", image: CATALOGUE[37].image, match: (p) => /ring|diamond|ruby|eternity/i.test(`${p.name} ${p.category}`) },
  { name: "Gifting", href: "/products", image: CATALOGUE[52].image, match: (p) => /earring|pendant|necklace|bracelet/i.test(`${p.name} ${p.category}`) },
];
const priceDefs = [
  { label: "Under ₹25,000", href: "/products?price=Under+%E2%82%B925%2C000", min: 0, max: 25000 },
  { label: "₹25,000 - ₹50,000", href: "/products?price=%E2%82%B925%2C000+-+%E2%82%B950%2C000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", href: "/products?price=%E2%82%B950%2C000+-+%E2%82%B91%2C00%2C000", min: 50000, max: 100000 },
  { label: "Above ₹1,00,000", href: "/products?price=Above+%E2%82%B91%2C00%2C000", min: 100000, max: Infinity },
];

function ProductMiniCard({ p }) {
  return (
    <Link to={`/products/${p.slug}`} className="block">
      <div className="aspect-[3/4] overflow-hidden bg-surface-muted">
        <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productFallback(p.id); }} />
      </div>
      <div className="mt-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{p.category} · {p.gemstone}</p>
        <div className="mt-1 text-sm line-clamp-2">{p.name}</div>
        <div className="mt-1 text-sm text-muted">{formatPrice(p.price ?? p.price_inr)}</div>
      </div>
    </Link>
  );
}

function Section({ eyebrow, title, text, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 max-w-2xl text-muted leading-7">{text}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function Collections() {
  const [products, setProducts] = useState([]);
  useEffect(() => { apiFetch("/products").then((d) => setProducts(d?.products || [])).catch(() => {}); }, []);
  const catalog = useMemo(() => mergeCatalogue(products), [products]);

  return (
    <div>
      <section className="bg-surface-muted/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Vara Catalogue</p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">Jewellery & Collections</h1>
          <p className="mt-4 max-w-2xl text-muted leading-7">Browse the Vara catalogue by category, gemstone, metal, occasion, and price — with jewellery in every collection.</p>
        </div>
      </section>

      <Section eyebrow="Shop by Category" title="Find your perfect piece" text="Explore signature jewellery categories crafted for every style and moment.">
        <div className="space-y-12">
          {categoryDefs.map((c) => (
            <div key={c.name}>
              <div className="flex items-end justify-between gap-4 mb-5">
                <div><h3 className="font-display text-3xl">{c.name}</h3><p className="text-sm text-muted mt-1">{c.desc}</p></div>
                <Link to={c.href} className="text-[11px] uppercase tracking-[0.16em] text-accent hover:underline">View All</Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{catalog.filter(c.match).slice(0, 4).map((p) => <ProductMiniCard key={`${c.name}-${p.id}`} p={p} />)}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="bg-surface-muted/30 border-y border-border">
        <Section eyebrow="Shop by Gemstone" title="A spectrum of rare beauty" text="Choose a gemstone that speaks to your story.">
          <div className="space-y-12">
            {gemstoneDefs.map((g, i) => (
              <div key={g}>
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4"><img src={CATALOGUE[i * 2].image} alt={g} className="h-14 w-14 object-cover border border-border" /><h3 className="font-display text-3xl">{g}</h3></div>
                  <Link to={`/products?gemstone=${encodeURIComponent(g)}`} className="text-[11px] uppercase tracking-[0.16em] text-accent hover:underline">View All</Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{catalog.filter((p) => (p.gemstone || "").toLowerCase() === g.toLowerCase()).slice(0, 4).map((p) => <ProductMiniCard key={`${g}-${p.id}`} p={p} />)}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section eyebrow="Shop by Occasion" title="Celebrate every moment" text="Jewellery curated for life's most meaningful milestones.">
        <div className="space-y-12">
          {occasionDefs.map((o) => (
            <div key={o.name}>
              <div className="flex items-end justify-between gap-4 mb-5"><h3 className="font-display text-3xl">{o.name}</h3><Link to={o.href} className="text-[11px] uppercase tracking-[0.16em] text-accent hover:underline">View All</Link></div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{catalog.filter(o.match).slice(0, 4).map((p) => <ProductMiniCard key={`${o.name}-${p.id}`} p={p} />)}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="bg-surface-muted/30 border-y border-border">
        <Section eyebrow="Shop by Price" title="Find jewellery within your budget" text="Browse curated selections across price ranges.">
          <div className="space-y-12">
            {priceDefs.map((r) => (
              <div key={r.label}>
                <div className="flex items-end justify-between gap-4 mb-5"><h3 className="font-display text-3xl">{r.label}</h3><Link to={r.href} className="text-[11px] uppercase tracking-[0.16em] text-accent hover:underline">View All</Link></div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{catalog.filter((p) => Number(p.price ?? p.price_inr ?? 0) >= r.min && Number(p.price ?? p.price_inr ?? 0) < r.max).slice(0, 4).map((p) => <ProductMiniCard key={`${r.label}-${p.id}`} p={p} />)}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
