import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === "admin";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">My Account</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{isAdmin ? "Super Admin Account" : "My Account"}</h1>
        </div>
        <button onClick={logout} className="border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] hover:border-foreground">Logout</button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="border border-border p-5 h-fit">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-4">Account Menu</p>
          <div className="space-y-1 text-sm">
            <Link to="/account" className="block bg-foreground text-white px-3 py-2">Overview</Link>
            <Link to="/account/orders" className="block px-3 py-2 hover:bg-surface-muted">My Orders</Link>
            {isAdmin && <Link to="/admin" className="block border-t border-border mt-2 pt-3 text-accent px-3 py-2 hover:bg-surface-muted">Super Admin Dashboard</Link>}
            {isAdmin && <Link to="/admin/products" className="block px-3 py-2 text-accent hover:bg-surface-muted">Manage Products</Link>}
            {isAdmin && <Link to="/admin/orders" className="block px-3 py-2 text-accent hover:bg-surface-muted">Manage Orders</Link>}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="border border-border p-6 max-w-xl">
            <h2 className="font-display text-2xl">Profile</h2>
            <p className="mt-4"><span className="text-muted">Name:</span> {user.name}</p>
            <p className="mt-2"><span className="text-muted">Email:</span> {user.email}</p>
            <p className="mt-2"><span className="text-muted">Role:</span> {user.role}</p>
          </div>

          {isAdmin && (
            <div className="border border-accent/30 bg-accent/5 p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Administrator Access</p>
              <h2 className="mt-2 font-display text-3xl">Super Admin Dashboard</h2>
              <p className="mt-3 max-w-2xl text-muted leading-7">Analyze store performance, manage products and orders, review customers, and update store settings.</p>
              <Link to="/admin" className="mt-5 inline-block bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white hover:bg-accent">Open Dashboard</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
