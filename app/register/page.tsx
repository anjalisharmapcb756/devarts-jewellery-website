import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Register",
  description: "Create your Vara account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Create Account"
      description="Join Vara for a personalised jewellery experience, saved favourites, and order history."
    >
      <RegisterForm />
    </AuthShell>
  );
}