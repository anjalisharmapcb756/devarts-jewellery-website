export type NavItem = {
  label: string;
  href: string;
  featured?: {
    title: string;
    description: string;
    href: string;
    image: string;
  };
  columns?: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
};

export const mainNavigation: NavItem[] = [
  {
    label: "Rings",
    href: "/products/rings",
    columns: [
      {
        title: "Shop Rings",
        links: [
          { label: "Diamond Rings", href: "/products/rings" },
          { label: "Solitaire Rings", href: "/products/rings" },
          { label: "Halo Rings", href: "/products/rings" },
          { label: "All Rings", href: "/products/rings" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Engagement", href: "/products/engagement-rings" },
          { label: "Wedding", href: "/products/wedding-jewellery" },
          { label: "Everyday", href: "/products/rings" },
          { label: "Gifting", href: "/products" },
        ],
      },
    ],
    featured: {
      title: "The Aurora Ring",
      description: "A luminous signature setting, crafted to be remembered.",
      href: "/products/aurora-diamond-ring",
      image: "/images/references/1.jpg",
    },
  },
  {
    label: "Earrings",
    href: "/products/earrings",
    columns: [
      {
        title: "Shop Earrings",
        links: [
          { label: "Studs", href: "/products/earrings" },
          { label: "Drops", href: "/products/earrings" },
          { label: "Hoops", href: "/products/earrings" },
          { label: "All Earrings", href: "/products/earrings" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Everyday Elegance", href: "/products/earrings" },
          { label: "Bridal", href: "/products/wedding-jewellery" },
          { label: "Gifting", href: "/products" },
          { label: "New Arrivals", href: "/#new-arrivals" },
        ],
      },
    ],
    featured: {
      title: "Pearl & Light",
      description: "Soft lustre, refined for every hour of the day.",
      href: "/products/earrings",
      image: "/images/references/4.jpg",
    },
  },
  {
    label: "Necklaces",
    href: "/products/necklaces",
    columns: [
      {
        title: "Shop Necklaces",
        links: [
          { label: "Pendants", href: "/products/necklaces" },
          { label: "Diamond Necklaces", href: "/products/necklaces" },
          { label: "Pearl Necklaces", href: "/products/necklaces" },
          { label: "All Necklaces", href: "/products/necklaces" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Everyday Elegance", href: "/products/necklaces" },
          { label: "Wedding", href: "/products/wedding-jewellery" },
          { label: "Gifting", href: "/products" },
          { label: "New Arrivals", href: "/#new-arrivals" },
        ],
      },
    ],
    featured: {
      title: "The Celeste Pendant",
      description: "Luminous pearls, refined for every moment.",
      href: "/products/celeste-pearl-pendant",
      image: "/images/references/2.jpg",
    },
  },
  {
    label: "Bracelets",
    href: "/products/bracelets",
    columns: [
      {
        title: "Shop Bracelets",
        links: [
          { label: "Tennis Bracelets", href: "/products/bracelets" },
          { label: "Bangles", href: "/products/bracelets" },
          { label: "Gold Bracelets", href: "/products/bracelets" },
          { label: "All Bracelets", href: "/products/bracelets" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Everyday Elegance", href: "/products/bracelets" },
          { label: "Bridal", href: "/products/wedding-jewellery" },
          { label: "Gifting", href: "/products" },
          { label: "New Arrivals", href: "/#new-arrivals" },
        ],
      },
    ],
    featured: {
      title: "The Finer Line",
      description: "A delicate finishing touch, worn alone or layered.",
      href: "/products/bracelets",
      image: "/images/references/5.jpg",
    },
  },
  {
    label: "Engagement",
    href: "/products/engagement-rings",
    columns: [
      {
        title: "Engagement Rings",
        links: [
          { label: "Solitaire", href: "/products/engagement-rings" },
          { label: "Halo", href: "/products/engagement-rings" },
          { label: "Vintage", href: "/products/engagement-rings" },
          { label: "All Engagement Rings", href: "/products/engagement-rings" },
        ],
      },
      {
        title: "The Journey",
        links: [
          { label: "Wedding Jewellery", href: "/products/wedding-jewellery" },
          { label: "Rings", href: "/products/rings" },
          { label: "Collections", href: "/collections" },
          { label: "Our Story", href: "/info/our-story" },
        ],
      },
    ],
    featured: {
      title: "Forever, Reimagined",
      description: "Heirloom-quality rings for a lifetime of moments.",
      href: "/products/engagement-rings",
      image: "/images/references/6.jpg",
    },
  },
  {
    label: "Collections",
    href: "/collections",
    columns: [
      {
        title: "Signature Edits",
        links: [
          { label: "Auréa Edit", href: "/collections" },
          { label: "Bridal", href: "/products/wedding-jewellery" },
          { label: "Everyday", href: "/products" },
          { label: "Gifting", href: "/products" },
        ],
      },
      {
        title: "Explore",
        links: [
          { label: "All Jewellery", href: "/products" },
          { label: "New Arrivals", href: "/#new-arrivals" },
          { label: "Gallery", href: "/gallery" },
          { label: "Our Story", href: "/info/our-story" },
        ],
      },
    ],
    featured: {
      title: "The Auréa Edit",
      description: "A curated portrait of the house's most loved pieces.",
      href: "/collections",
      image: "/images/references/7.jpg",
    },
  },
  {
    label: "New Arrivals",
    href: "/#new-arrivals",
    columns: [
      {
        title: "Just In",
        links: [
          { label: "New Arrivals", href: "/#new-arrivals" },
          { label: "New Rings", href: "/products/rings" },
          { label: "New Necklaces", href: "/products/necklaces" },
          { label: "New Earrings", href: "/products/earrings" },
        ],
      },
      {
        title: "Discover",
        links: [
          { label: "Collections", href: "/collections" },
          { label: "Engagement", href: "/products/engagement-rings" },
          { label: "Bracelets", href: "/products/bracelets" },
          { label: "All Jewellery", href: "/products" },
        ],
      },
    ],
    featured: {
      title: "Fresh from the Atelier",
      description: "The latest expressions of quiet luxury.",
      href: "/#new-arrivals",
      image: "/images/references/8.jpg",
    },
  },
];
