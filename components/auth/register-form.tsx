"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/auth/actions";
import { AuthLink } from "@/components/auth/auth-shell";

function validate(name: string, email: string, password: string, confirm: string) {
  if (!name.trim()) return "Full name is required.";
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const validationError = validate(name, email, password, confirm);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("password", password);
    const result = await registerAction(fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {error ? <div className="border border-[#c9a3a3] bg-[#fdf7f7] px-4 py-3 text-sm text-[#7a3d3d]">{error}</div> : null}
      {success ? <div className="border border-[#b8c9b0] bg-[#f5faf3] px-4 py-3 text-sm text-[#3f5a36]">{success}</div> : null}

      <div>
        <label htmlFor="register-name" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Full Name</label>
        <input id="register-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="Your full name" />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Email</label>
        <input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Password</label>
        <input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="At least 8 characters" />
      </div>
      <div>
        <label htmlFor="register-confirm" className="block text-xs font-medium tracking-[0.18em] text-muted uppercase">Confirm Password</label>
        <input id="register-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent" placeholder="Re-enter your password" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-sm text-muted">
        Already have an account? <AuthLink href="/login">Sign in</AuthLink>
      </p>
    </form>
  );
}