import { publicMetadata } from "@/lib/seo";

export const instant = false;

﻿import { GallerySection } from "@/components/home/gallery-section";

export const metadata = publicMetadata({
  title: "Gallery & Recognition",
  description: "Explore Vara's gallery of craftsmanship, awards, and milestones.",
  path: "/gallery",
});

export default function GalleryPage() {
  return <GallerySection />;
}
