import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl, siteDescription, siteName } from "@/lib/site-url";

export const noIndex: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
};

type PublicMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
};

export function publicMetadata({
  title,
  description = siteDescription,
  path,
  image,
  type = "website",
}: PublicMetadataInput): Metadata {
  const url = path ? absoluteUrl(path) : getSiteUrl();
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: "en_IN",
      url,
      siteName,
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
