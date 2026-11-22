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
          { label: "Engagement Rings", href: "/products/engagement-rings" },
          { label: "Wedding Jewellery", href: "/products/wedding-jewellery" },
          { label: "Diamond Rings", href: "/products/rings" },
          { label: "All Rings", href: "/products/rings" },
        ],
      },
      {
        title: "By Style",
        links: [
          { label: "Solitaire", href: "/products/rings" },
          { label: "Halo", href: "/products/rings" },
          { label: "Vintage", href: "/products/rings" },
          { label: "Stackable", href: "/products/rings" },
        ],
      },
    ],
    featured: {
      title: "The Aurora Ring",
      description: "A radiant signature piece crafted to captivate.",
      href: "/products/aurora-diamond-ring",
      image: "/images/references/1.jpg",
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
          { label: "Everyday Elegance", href: "/collections" },
          { label: "Wedding", href: "/products/wedding-jewellery" },
          { label: "Gifting", href: "/products" },
          { label: "New Arrivals", href: "/#new-arrivals" },
        ],
      },
    ],
    featured: {
      title: "Celeste Pendant",
      description: "Luminous pearls, refined for every moment.",
      href: "/products/celeste-pearl-pendant",
      image: "/images/references/2.jpg",
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
    ],
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
    ],
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
];
