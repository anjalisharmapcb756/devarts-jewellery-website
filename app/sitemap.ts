import type { MetadataRoute } from "next";
import { getProductsAsync } from "@/lib/data/products-db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vara.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "",
    "/products",
    "/products/rings",
    "/products/earrings",
    "/products/necklaces",
    "/products/bracelets",
    "/products/engagement-rings",
    "/products/wedding-jewellery",
    "/products/mens-jewellery",
    "/collections",
    "/cart",
    "/wishlist",
    "/login",
    "/register",
    "/forgot-password",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" as const : "weekly" as const,
    priority: route === "" ? 1 : route.startsWith("/products") ? 0.8 : 0.6,
  }));

  try {
    const products = await getProductsAsync();
    const productRoutes = products.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
