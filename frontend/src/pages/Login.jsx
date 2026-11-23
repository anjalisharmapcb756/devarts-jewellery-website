import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Sign In</h1>

      <div className="mt-8 flex border-b border-border">
        <span className="px-5 py-3 text-[11px] uppercase tracking-[0.16em] border-b-2 border-foreground -mb-px">Customer Login</span>
        <Link to="/admin/login" className="px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground">Admin Login</Link>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Email</label>
          <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent bg-transparent" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.14em] text-muted mb-2">Password</label>
          <input className="w-full border border-border px-4 py-3 outline-none focus:border-accent bg-transparent" placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">Forgot password?</Link>
        </div>

        {error && <p className="text-sm text-[#8a4b4b] bg-[#8a4b4b]/5 border border-[#8a4b4b]/20 px-4 py-3">{error}</p>}

        <button disabled={loading} className="w-full bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-sm text-muted space-y-2">
        <p>New to Vara? <Link to="/register" className="text-accent hover:underline">Create an account</Link></p>
        <p>Looking for orders or wishlist? <Link to="/account" className="text-accent hover:underline">Go to account</Link></p>
      </div>
    </div>
  );
}
