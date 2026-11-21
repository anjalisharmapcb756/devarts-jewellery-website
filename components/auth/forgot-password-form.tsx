"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AuthLink } from "@/components/auth/auth-shell";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!configured) return setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account`,
    });
    setLoading(false);
    if (resetError) return setError(resetError.message);
    setSuccess("If an account exists for this email, a password reset link has been sent.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!configured ? (
        <div className="border border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted">
          Supabase credentials are not configured. Add them to <code>.env.local</code> to enable authentication.
        </div>
      ) : null}
      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      {success ? <div className="border border-[#b8c9b0] bg-[#f5faf3] px-4 py-3 text-sm text-[#3f5a36]">{success}</div> : null}

      <div>
        <label htmlFor="forgot-email" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Email</label>
        <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="you@example.com" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="text-sm text-muted">
        Remembered your password? <AuthLink href="/login">Sign in</AuthLink>
      </p>
    </form>
  );
}