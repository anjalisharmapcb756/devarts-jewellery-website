"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLink } from "@/components/auth/auth-shell";

export function ResetPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!email || !token) return setError("Reset link is invalid or incomplete.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, token, password }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to reset password.");
      setSuccess("Password updated. Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      {success ? <div className="border border-[#b8c9b0] bg-[#f5faf3] px-4 py-3 text-sm text-[#3f5a36]">{success}</div> : null}
      <div><label htmlFor="reset-password" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">New Password</label><input id="reset-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" /></div>
      <div><label htmlFor="reset-confirm" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Confirm Password</label><input id="reset-confirm" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" /></div>
      <button type="submit" disabled={loading} className="w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Updating..." : "Reset Password"}</button>
      <p className="text-sm text-muted">Back to <AuthLink href="/login">Sign in</AuthLink></p>
    </form>
  );
}
