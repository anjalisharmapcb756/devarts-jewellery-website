export const siteName = "Vara";
export const siteDescription =
  "Discover Vara, a premium Indian luxury jewellery destination for rings, earrings, necklaces, bracelets, engagement and wedding jewellery.";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // Fall through to the explicit error below.
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid http(s) URL in production.");
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string, siteUrl = getSiteUrl()): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
