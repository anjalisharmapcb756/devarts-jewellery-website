import catalogue from "./catalogue.json" with { type: "json" };

export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gemstone: string;
  metal: string;
  style: string;
  price: number;
  price_inr: number;
  image: string;
  hoverImage?: string;
  description?: string;
  details?: string[];
  metalOptions?: string[];
  sizes?: string[];
  is_active?: boolean;
  is_in_stock?: boolean;
  stock_quantity?: number;
};

export const CATALOGUE = catalogue as CatalogueProduct[];

export function findCatalogueProduct(idOrSlug: string): CatalogueProduct | null {
  const key = String(idOrSlug || "").trim().toLowerCase();
  if (!key) return null;
  return CATALOGUE.find((p) => p.id.toLowerCase() === key || p.slug.toLowerCase() === key) || null;
}
