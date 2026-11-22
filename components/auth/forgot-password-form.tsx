"use client";

import { useState } from "react";
import { AuthLink } from "@/components/auth/auth-shell";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to send reset link.");
      setSuccess(data.message || "If an account exists for this email, a reset link has been sent.");
    } catch (err: any) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      {success ? <div className="border border-[#b8c9b0] bg-[#f5faf3] px-4 py-3 text-sm text-[#3f5a36]">{success}</div> : null}
      <div>
        <label htmlFor="forgot-email" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Email</label>
        <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="you@example.com" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Sending..." : "Send Reset Link"}</button>
      <p className="text-sm text-muted">Remembered your password? <AuthLink href="/login">Sign in</AuthLink></p>
    </form>
  );
}
