import type { MetadataRoute } from "next";
import { getProductsAsync } from "@/lib/data/products-db";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const configuredDate = process.env.SITEMAP_LAST_MODIFIED
  ? new Date(process.env.SITEMAP_LAST_MODIFIED)
  : null;
const lastModified =
  configuredDate && !Number.isNaN(configuredDate.getTime()) ? configuredDate : new Date();

const publicRoutes = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/products", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/products/rings", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/earrings", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/necklaces", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/bracelets", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/engagement-rings", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/wedding-jewellery", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/products/mens-jewellery", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/collections", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/gallery", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/info/our-story", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/contact", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/shipping", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/returns", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/care", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/faqs", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/info/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/info/terms", changeFrequency: "yearly" as const, priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path, siteUrl),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const products = await getProductsAsync();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`, siteUrl),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      images: product.image ? [absoluteUrl(product.image, siteUrl)] : undefined,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
