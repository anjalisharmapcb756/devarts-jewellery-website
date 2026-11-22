import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Vara account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Forgot Password"
      description="Enter your email address and we’ll send you a secure password reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}