import type { JewelleryType } from "@/types/product";

export type CategoryPageConfig = {
  slug: string;
  title: string;
  description: string;
  jewelleryType: JewelleryType;
};

export const categoryPages: CategoryPageConfig[] = [
  {
    slug: "rings",
    title: "Rings",
    description: "Discover diamond, gemstone, and gold rings crafted for timeless elegance.",
    jewelleryType: "Rings",
  },
  {
    slug: "earrings",
    title: "Earrings",
    description: "From classic studs to luminous drops, find earrings for every occasion.",
    jewelleryType: "Earrings",
  },
  {
    slug: "necklaces",
    title: "Necklaces",
    description: "Elegant pendants and statement necklaces designed to captivate.",
    jewelleryType: "Necklaces",
  },
  {
    slug: "bracelets",
    title: "Bracelets",
    description: "Refined bracelets and cuffs crafted with exceptional detail.",
    jewelleryType: "Bracelets",
  },
  {
    slug: "engagement-rings",
    title: "Engagement Rings",
    description: "Celebrate your promise with engagement rings designed to last forever.",
    jewelleryType: "Engagement Rings",
  },
  {
    slug: "wedding-jewellery",
    title: "Wedding Jewellery",
    description: "Heirloom-worthy wedding jewellery for your most unforgettable moments.",
    jewelleryType: "Wedding Jewellery",
  },
  {
    slug: "mens-jewellery",
    title: "Men's Jewellery",
    description: "Bold, refined jewellery crafted for the modern gentleman.",
    jewelleryType: "Men's Jewellery",
  },
];

export function getCategoryPage(slug: string) {
  return categoryPages.find((c) => c.slug === slug);
}
