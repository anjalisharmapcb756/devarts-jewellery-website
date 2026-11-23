import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/ui/container";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductBySlugAsync, getProductsAsync, getRelatedProductsAsync } from "@/lib/data/products-db";
import { products as mockProducts } from "@/lib/data/products";

export const instant = false;

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);
  if (!product) return { title: "Product Details" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vara.example.com";
  const url = `${siteUrl}/products/${product.slug}`;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | Vara`,
      description: product.description,
      url,
      type: "website",
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Vara`,
      description: product.description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  await connection();
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getProductBySlugAsync(slug), getProductsAsync()]);
  if (!product) notFound();
  const relatedProducts = await getRelatedProductsAsync(product, allProducts);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vara.example.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image, product.hoverImage, ...(product.images ?? [])].filter(Boolean),
    sku: product.id,
    brand: { "@type": "Brand", name: "Vara" },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        allProducts={allProducts}
      />
    </>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Suspense
          fallback={
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="aspect-[4/5] animate-pulse bg-surface-muted" />
              <div className="space-y-4 py-8">
                <div className="h-4 w-24 animate-pulse bg-surface-muted" />
                <div className="h-12 w-3/4 animate-pulse bg-surface-muted" />
                <div className="h-24 w-full animate-pulse bg-surface-muted" />
              </div>
            </div>
          }
        >
          <ProductDetailContent params={params} />
        </Suspense>
      </Container>
    </section>
  );
}