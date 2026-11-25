import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getProductsAsync } from "@/lib/data/products-db";
import { getSession } from "@/lib/auth/session";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Vara jewellery purchase.",
  robots: noIndex,
};

export const instant = false;

async function CheckoutContent() {
  await connection();
  const [products, session] = await Promise.all([getProductsAsync(), getSession()]);
  return <CheckoutForm products={products} initialEmail={session?.email ?? ""} />;
}

export default function CheckoutPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">Secure Checkout</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">Checkout</h1>
        <Suspense fallback={<div className="mt-12 border border-border bg-surface-muted/30 p-10 text-center text-sm text-muted">Loading checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </Container>
    </section>
  );
}
