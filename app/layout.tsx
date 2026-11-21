import { Suspense } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreProvider } from "@/components/store/store-provider";
import { getProductsAsync } from "@/lib/data/products-db";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vara.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vara | Luxury Jewellery",
    template: "%s | Vara",
  },
  description:
    "Discover Vara, a premium Indian luxury jewellery destination for rings, earrings, necklaces, bracelets, engagement and wedding jewellery.",
  keywords: ["luxury jewellery", "gold jewellery", "diamond rings", "engagement rings", "Indian jewellery", "Vara"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Vara",
    title: "Vara | Luxury Jewellery",
    description:
      "Discover Vara, a premium Indian luxury jewellery destination for fine craftsmanship and timeless elegance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vara | Luxury Jewellery",
    description:
      "Discover Vara, a premium Indian luxury jewellery destination for fine craftsmanship and timeless elegance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const products = await getProductsAsync();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorantGaramond.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <StoreProvider initialProducts={products}>
          <div className="flex min-h-screen flex-col">
            <Suspense fallback={<div className="h-[121px] border-b border-border bg-surface" />}>
              <SiteHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
