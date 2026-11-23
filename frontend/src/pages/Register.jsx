import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      nav("/account", { replace: true });
    } catch (err) {
      const message = err?.message || "Registration failed";
      setError(message.includes("already exists") ? "An account with this email already exists. Please login instead." : message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Account</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Create Account</h1>
      <p className="mt-3 text-sm text-muted">Join Vara to save your cart, wishlist, and order history.</p>

      <div className="mt-8 flex border-b border-border">
        <span className="px-5 py-3 text-[11px] uppercase tracking-[0.16em] border-b-2 border-foreground -mb-px">Customer Registration</span>
        <Link to="/admin/login" className="px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground">Admin Login</Link>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block"><span className="text-[11px] uppercase tracking-[0.14em] text-muted">Full Name</span><input className="mt-2 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" placeholder="Your full name" value={form.name} onChange={set("name")} required autoComplete="name" /></label>
        <label className="block"><span className="text-[11px] uppercase tracking-[0.14em] text-muted">Email</span><input className="mt-2 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" placeholder="you@example.com" type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
        <label className="block"><span className="text-[11px] uppercase tracking-[0.14em] text-muted">Password</span><input className="mt-2 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" placeholder="At least 8 characters" type="password" value={form.password} onChange={set("password")} required minLength={8} autoComplete="new-password" /></label>
        <label className="block"><span className="text-[11px] uppercase tracking-[0.14em] text-muted">Confirm Password</span><input className="mt-2 w-full border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" placeholder="Re-enter password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required minLength={8} autoComplete="new-password" /></label>

        {error && <p className="text-sm text-[#8a4b4b] bg-[#8a4b4b]/5 border border-[#8a4b4b]/20 px-4 py-3">{error}</p>}

        <button disabled={loading} className="w-full bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition disabled:opacity-50">{loading ? "Creating Account..." : "Create Account"}</button>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-sm text-muted">
        <p>Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link></p>
      </div>
    </div>
  );
}
