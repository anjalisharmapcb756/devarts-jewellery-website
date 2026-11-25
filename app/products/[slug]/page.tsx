import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/ui/container";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductBySlugAsync, getProductsAsync, getRelatedProductsAsync } from "@/lib/data/products-db";
import { products as mockProducts } from "@/lib/data/products";
import { breadcrumbJsonLd, publicMetadata, safeJsonLd } from "@/lib/seo";
import { absoluteUrl, siteName } from "@/lib/site-url";

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
  await connection();
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);
  if (!product) {
    return { title: "Product Details", robots: { index: false, follow: false } };
  }

  return publicMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  await connection();
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlugAsync(slug),
    getProductsAsync(),
  ]);
  if (!product) notFound();

  const relatedProducts = await getRelatedProductsAsync(product, allProducts);
  const productPath = `/products/${product.slug}`;
  const images = [product.image, product.hoverImage, ...(product.images ?? [])]
    .filter(Boolean)
    .map((image) => absoluteUrl(image));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: images,
      sku: product.id,
      brand: { "@type": "Brand", name: siteName },
      category: product.category,
      offers: {
        "@type": "Offer",
        url: absoluteUrl(productPath),
        priceCurrency: "INR",
        price: product.price,
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
      ...(Number(product.reviewCount ?? 0) > 0 && Number(product.rating ?? 0) > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Number(product.rating),
              reviewCount: Number(product.reviewCount),
            },
          }
        : {}),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Jewellery", path: "/products" },
      { name: product.name, path: productPath },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
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
