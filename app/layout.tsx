import { Suspense } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreProvider } from "@/components/store/store-provider";
import { getProductsAsync } from "@/lib/data/products-db";
import { publicMetadata } from "@/lib/seo";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site-url";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...publicMetadata({
    title: `${siteName} | Luxury Jewellery`,
    description: siteDescription,
    path: "/",
  }),
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Luxury Jewellery`,
    template: `%s | ${siteName}`,
  },
  keywords: ["luxury jewellery", "gold jewellery", "diamond rings", "engagement rings", "Indian jewellery", siteName],
  robots: {
    index: true,
    follow: true,
  },
};

async function AppShell({ children }: { children: React.ReactNode }) {
  const products = await getProductsAsync();
  return (
    <StoreProvider initialProducts={products}>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<div className="h-[160px] border-b border-border bg-surface" />}>
          <SiteHeader />
        </Suspense>
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </StoreProvider>
  );
}

function LayoutFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-background" aria-busy="true">
      <div className="h-10 bg-[#292521]" />
      <div className="h-20 border-b border-border bg-surface" />
      <div className="flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-4 w-32 animate-pulse bg-surface-muted" />
          <div className="h-12 w-2/3 max-w-xl animate-pulse bg-surface-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-surface-muted" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-72 bg-[#292521]" />
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorantGaramond.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] bg-foreground px-4 py-3 text-sm text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Suspense fallback={<LayoutFallback />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
