import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!token || !email) {
      setError("This reset link is missing details. Request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, password }),
      });
      nav("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Reset Password</h1>
      <p className="mt-3 text-sm text-muted">Choose a new password for {email || "your account"}.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="email" value={email} readOnly aria-label="Email" />
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="password" required minLength={8} placeholder="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="password" required minLength={8} placeholder="Confirm new password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {error && <p role="alert" className="text-sm text-[#8a4b4b]">{error}</p>}
        <button disabled={loading || !token} className="w-full bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent disabled:opacity-50">{loading ? "Resetting..." : "Reset Password"}</button>
      </form>
    </div>
  );
}
