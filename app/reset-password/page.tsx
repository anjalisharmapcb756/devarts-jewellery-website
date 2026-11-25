import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { noIndex } from "@/lib/seo";

export const instant = false;

export const metadata: Metadata = { title: "Reset Password", robots: noIndex };

export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Account" title="Reset Password" description="Choose a new password for your Vara account.">
      <Suspense fallback={<div className="h-64 animate-pulse bg-surface-muted" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
