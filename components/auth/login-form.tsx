"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/auth/actions";
import { AuthLink } from "@/components/auth/auth-shell";

function validate(email: string, password: string) {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate(email, password);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);
    fd.append("next", next);
    const result = await loginAction(fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    router.push(result?.next || next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}

      <div>
        <label htmlFor="login-email" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="login-password" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Password</label>
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-sm text-muted">
        New to Vara? <AuthLink href="/register">Create an account</AuthLink>
      </p>
    </form>
  );
}