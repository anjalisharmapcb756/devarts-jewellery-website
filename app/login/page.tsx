import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Vara account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Sign In"
      description="Welcome back. Access your orders, saved addresses, and wishlist."
      footer={<span>Secure sign-in powered by Supabase authentication.</span>}
    >
      <Suspense fallback={<div className="h-64 animate-pulse bg-surface-muted" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}