import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault(); setError(""); setMsg(""); setLoading(true);
    try { const d = await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); setMsg(d?.message || "If an account exists, a reset link has been generated."); }
    catch (err) { setError(err.message || "Failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Forgot Password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-[#8a4b4b]">{error}</p>}
        {msg && <p className="text-sm text-muted">{msg}</p>}
        <button disabled={loading} className="w-full bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent disabled:opacity-50">{loading ? "Sending..." : "Send Reset Link"}</button>
      </form>
    </div>
  );
}
