import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { noIndex } from "@/lib/seo";

export const instant = false;

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your profile, orders, and saved addresses.",
  robots: noIndex,
};

export default function AccountPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-sm font-medium tracking-[0.25em] text-accent-text uppercase">
          My Account
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Your Vara Account
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Manage your profile, saved addresses, and order history.
        </p>
        <div className="mt-10">
          <AccountDashboard />
        </div>
      </Container>
    </section>
  );
}