import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState(params.get("email") || "");
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, token, password }) }); nav("/login"); }
    catch (err) { setError(err.message || "Failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Reset Password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" required placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="password" required minLength={8} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-[#8a4b4b]">{error}</p>}
        <button disabled={loading} className="w-full bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent disabled:opacity-50">{loading ? "Resetting..." : "Reset Password"}</button>
      </form>
    </div>
  );
}
