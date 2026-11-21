export type Category = {
  name: string;
  href: string;
  image: string;
  description: string;
};

export type Gemstone = {
  name: string;
  href: string;
  tone: string;
  image: string;
};

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
};

export type Collection = {
  name: string;
  href: string;
  image: string;
  description: string;
};

export type Testimonial = {
  name: string;
  location: string;
  quote: string;
  rating: number;
};

const ref = (n: number) => `/images/references/${n}.jpg`;

export const categories: Category[] = [
  {
    name: "Rings",
    href: "/products/rings",
    image: ref(1),
    description: "Signature solitaires and bands",
  },
  {
    name: "Necklaces",
    href: "/products/necklaces",
    image: ref(2),
    description: "Pendants with quiet brilliance",
  },
  {
    name: "Earrings",
    href: "/products/earrings",
    image: ref(3),
    description: "Elegant drops and studs",
  },
  {
    name: "Bracelets",
    href: "/products/bracelets",
    image: ref(4),
    description: "Refined everyday radiance",
  },
];

export const bestSellers: HomeProduct[] = [
  {
    id: "p1",
    slug: "aurora-diamond-ring",
    name: "Aurora Diamond Ring",
    price: 89500,
    category: "Rings",
    image: ref(6),
    badge: "Bestseller",
  },
  {
    id: "p2",
    slug: "celeste-pearl-pendant",
    name: "Celeste Pearl Pendant",
    price: 64500,
    category: "Necklaces",
    image: ref(7),
    badge: "Loved",
  },
  {
    id: "p3",
    slug: "lumiere-drop-earrings",
    name: "Lumière Drop Earrings",
    price: 72500,
    category: "Earrings",
    image: ref(8),
  },
  {
    id: "p4",
    slug: "etoile-gold-bracelet",
    name: "Étoile Gold Bracelet",
    price: 56800,
    category: "Bracelets",
    image: ref(9),
  },
];

export const gemstones: Gemstone[] = [
  { name: "Diamond", href: "/products?gemstone=diamond", tone: "from-[#f7f4ee] to-[#e8dfcf]", image: ref(6) },
  { name: "Emerald", href: "/products?gemstone=emerald", tone: "from-[#eef5ef] to-[#d7e6d8]", image: ref(10) },
  { name: "Ruby", href: "/products?gemstone=ruby", tone: "from-[#f8eeee] to-[#ead3d3]", image: ref(8) },
  { name: "Sapphire", href: "/products?gemstone=sapphire", tone: "from-[#eef2f8] to-[#d6deeb]", image: ref(7) },
  { name: "Pearl", href: "/products?gemstone=pearl", tone: "from-[#faf8f4] to-[#ece4d8]", image: ref(12) },
];

export const newArrivals: HomeProduct[] = [
  { id: "p5", slug: "noor-emerald-ring", name: "Noor Emerald Ring", price: 112000, category: "Rings", image: ref(10), badge: "New" },
  { id: "p6", slug: "solene-sapphire-necklace", name: "Solène Sapphire Necklace", price: 134000, category: "Necklaces", image: ref(7), badge: "New" },
  { id: "p7", slug: "amour-ruby-earrings", name: "Amour Ruby Earrings", price: 98500, category: "Earrings", image: ref(8), badge: "New" },
  { id: "p8", slug: "heritage-diamond-bracelet", name: "Heritage Diamond Bracelet", price: 149000, category: "Bracelets", image: ref(9), badge: "New" },
];

export const collections: Collection[] = [
  {
    name: "The Bridal Edit",
    href: "/collections",
    image: ref(11),
    description: "Heirloom-worthy pieces for unforgettable beginnings.",
  },
  {
    name: "Golden Hour",
    href: "/collections",
    image: ref(6),
    description: "Warm gold silhouettes crafted for modern elegance.",
  },
  {
    name: "Celestial Gems",
    href: "/collections",
    image: ref(10),
    description: "Rare gemstones inspired by starlit beauty.",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Ananya S.",
    location: "Mumbai",
    quote:
      "The craftsmanship is exquisite. My ring feels timeless, elegant, and beautifully personal.",
    rating: 5,
  },
  {
    name: "Meera K.",
    location: "Bengaluru",
    quote:
      "From packaging to finish, every detail felt luxurious. The necklace is even more stunning in person.",
    rating: 5,
  },
  {
    name: "Riya P.",
    location: "Delhi",
    quote:
      "Vara made gifting effortless. The design is refined and the quality truly stands out.",
    rating: 5,
  },
];
