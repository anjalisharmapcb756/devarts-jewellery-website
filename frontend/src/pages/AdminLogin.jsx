import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await login(email, password);
      if (data?.user?.role !== "admin") { setError("Admin access required."); return; }
      nav("/admin");
    } catch (err) { setError(err.message || "Login failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Admin Login</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-[#8a4b4b]">{error}</p>}
        <button disabled={loading} className="w-full bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}
